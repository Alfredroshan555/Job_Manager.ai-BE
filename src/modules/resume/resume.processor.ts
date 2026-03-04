import { Processor, WorkerHost } from "@nestjs/bullmq";
import { Job } from "bullmq";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { Resume, ResumeDocument } from "./resume.schema";
import { User, UserDocument } from "../auth/user.schema";
import {
  JobProfile,
  JobProfileDocument,
} from "../jobs/schemas/job-profile.schema";
import { ResumeProcessorService } from "./resume-processor.service";
import { AiService } from "../ai/ai.service";
import { OrchestratorService } from "../common/orchestrator/orchestrator.service";
import { Logger, Inject, forwardRef } from "@nestjs/common";

@Processor("resume-processing")
export class ResumeProcessor extends WorkerHost {
  private readonly logger = new Logger(ResumeProcessor.name);

  constructor(
    @InjectModel(Resume.name) private resumeModel: Model<ResumeDocument>,
    @InjectModel(JobProfile.name)
    private jobProfileModel: Model<JobProfileDocument>,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private resumeProcessorService: ResumeProcessorService,
    private aiService: AiService,
    @Inject(forwardRef(() => OrchestratorService))
    private orchestratorService: OrchestratorService,
  ) {
    super();
  }

  async process(job: Job<any, any, string>): Promise<any> {
    const { resumeId, userId } = job.data;
    this.logger.log(`Processing resume ${resumeId} for user ${userId}...`);

    try {
      const resume = await this.resumeModel.findById(resumeId);
      if (!resume) throw new Error(`Resume not found: ${resumeId}`);

      // Text Extraction
      const rawText = await this.resumeProcessorService.extractText(
        resume.fileUrl,
        resume.mimeType,
      );
      resume.rawText = rawText;
      await resume.save();

      // AI Parsing
      this.logger.log(`AI Parsing started for resume ${resumeId}...`);
      const structuredData = await this.aiService.parseResume(rawText);

      // Save Profile (Update existing profile associated with user)
      const profile = await this.jobProfileModel.findOneAndUpdate(
        { userId },
        { resumeId, ...structuredData },
        { upsert: true, new: true },
      );

      // Update User Name and Email from Resume
      try {
        const updateFields: { name?: string; email?: string } = {};

        if (structuredData.full_name) {
          updateFields.name = structuredData.full_name;
        }

        if (structuredData.email) {
          // Only update email if it's not already taken by another user
          const existingUser = await this.userModel.findOne({
            email: structuredData.email,
            _id: { $ne: userId },
          });

          if (existingUser) {
            this.logger.warn(
              `Email ${structuredData.email} from resume already belongs to another user. Skipping email update.`,
            );
          } else {
            updateFields.email = structuredData.email;
          }
        }

        if (Object.keys(updateFields).length > 0) {
          await this.userModel.findByIdAndUpdate(userId, updateFields);
          this.logger.log(
            `Updated user ${userId}: name="${updateFields.name ?? "unchanged"}", email="${updateFields.email ?? "unchanged"}"`,
          );
        }
      } catch (updateError) {
        // Log but don't fail the whole pipeline for a user update error
        this.logger.error(
          `Failed to update user profile from resume: ${updateError.message}`,
        );
      }

      this.logger.log(
        `Profile created: ${profile._id}. Triggering job discovery...`,
      );

      // Update resume status
      resume.status = "completed";
      await resume.save();

      // Chain next background job: Discovery
      await this.orchestratorService.startJobDiscovery(
        userId,
        profile._id.toString(),
      );
    } catch (error) {
      this.logger.error(`Error processing resume ${resumeId}:`, error);

      // Update resume status to failed
      try {
        const resume = await this.resumeModel.findById(resumeId);
        if (resume) {
          resume.status = "failed";
          await resume.save();
        }
      } catch (saveErr) {
        this.logger.error(`Failed to update resume status: ${saveErr.message}`);
      }

      throw error;
    }
  }
}
