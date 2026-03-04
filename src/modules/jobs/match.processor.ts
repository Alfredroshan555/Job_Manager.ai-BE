import { Processor, WorkerHost } from "@nestjs/bullmq";
import { Job as BullJob } from "bullmq";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { JobProfile, JobProfileDocument } from "./schemas/job-profile.schema";
import { Job, JobDocument } from "./schemas/job.schema";
import { JobMatch, JobMatchDocument } from "./schemas/job-match.schema";
import { AiService } from "../ai/ai.service";
import { Logger } from "@nestjs/common";

@Processor("job-matching")
export class MatchProcessor extends WorkerHost {
  private readonly logger = new Logger(MatchProcessor.name);

  constructor(
    @InjectModel(JobProfile.name)
    private jobProfileModel: Model<JobProfileDocument>,
    @InjectModel(Job.name) private jobModel: Model<JobDocument>,
    @InjectModel(JobMatch.name) private jobMatchModel: Model<JobMatchDocument>,
    private aiService: AiService,
  ) {
    super();
  }

  async process(job: BullJob<any, any, string>): Promise<any> {
    const { userId, profileId, jobId } = job.data;
    this.logger.log(
      `Scoring job ${jobId} against profile ${profileId} for user ${userId}...`,
    );

    try {
      const profile = await this.jobProfileModel.findById(profileId);
      if (!profile) throw new Error(`Profile not found: ${profileId}`);

      const jobDoc = await this.jobModel.findById(jobId);
      if (!jobDoc) throw new Error(`Job not found: ${jobId}`);

      // AI Scoring
      const scoringResult = await this.aiService.scoreJob(profile, jobDoc);

      // Save/Update Match
      await this.jobMatchModel.findOneAndUpdate(
        { userId, jobId },
        { ...scoringResult },
        { upsert: true, new: true },
      );

      this.logger.log(
        `Match score updated for User ${userId}, Job ${jobId}: ${scoringResult.matchScore}%`,
      );
    } catch (error) {
      this.logger.error(`Error scoring job ${jobId}:`, error);
      throw error;
    }
  }
}
