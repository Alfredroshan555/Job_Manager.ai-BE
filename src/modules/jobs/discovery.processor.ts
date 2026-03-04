import { Processor, WorkerHost } from "@nestjs/bullmq";
import { Job } from "bullmq";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { JobProfile, JobProfileDocument } from "./schemas/job-profile.schema";
import { JobDiscoveryService } from "./job-discovery.service";
import { OrchestratorService } from "../common/orchestrator/orchestrator.service";
import { Logger } from "@nestjs/common";

@Processor("job-discovery")
export class DiscoveryProcessor extends WorkerHost {
  private readonly logger = new Logger(DiscoveryProcessor.name);

  constructor(
    @InjectModel(JobProfile.name)
    private jobProfileModel: Model<JobProfileDocument>,
    private jobDiscoveryService: JobDiscoveryService,
    private orchestratorService: OrchestratorService,
  ) {
    super();
  }

  async process(job: Job<any, any, string>): Promise<any> {
    const { userId, profileId } = job.data;
    this.logger.log(`Discovering jobs for profile ${profileId}...`);

    try {
      const profile = await this.jobProfileModel.findById(profileId);
      if (!profile) throw new Error(`Profile not found: ${profileId}`);

      const discoveredJobs =
        await this.jobDiscoveryService.updateJobsFromProfile(profile);
      this.logger.log(
        `Found ${discoveredJobs.length} potential jobs. Triggering scoring...`,
      );

      for (const jobDoc of discoveredJobs) {
        await this.orchestratorService.startJobMatching(
          userId,
          profileId,
          jobDoc._id.toString(),
        );
      }
    } catch (error) {
      this.logger.error(
        `Error discovering jobs for profile ${profileId}:`,
        error,
      );
      throw error;
    }
  }
}
