import { Injectable, Logger, Inject, forwardRef } from "@nestjs/common";
import { ResumeProcessor } from "../../resume/resume.processor";

@Injectable()
export class OrchestratorService {
  private readonly logger = new Logger(OrchestratorService.name);

  constructor(
    @Inject(forwardRef(() => ResumeProcessor))
    private resumeProcessor: ResumeProcessor,
  ) {}

  async startResumeProcessing(userId: string, resumeId: string): Promise<void> {
    this.logger.log(
      `Dev Fallback: Starting immediate resume processing for ${resumeId}`,
    );
    // Simulate BullMQ job structure and call processor directly
    const mockJob = { data: { userId, resumeId } } as any;
    this.resumeProcessor.process(mockJob).catch((err) => {
      this.logger.error(`Direct processing failed: ${err.message}`);
    });
  }

  async startJobDiscovery(userId: string, profileId: string): Promise<void> {
    this.logger.log(
      `Mock: Starting job discovery for ${profileId} (Redis Disabled)`,
    );
  }

  async startJobMatching(
    userId: string,
    profileId: string,
    jobId: string,
  ): Promise<void> {
    this.logger.log(
      `Mock: Starting job matching for ${jobId} (Redis Disabled)`,
    );
  }
}
