import { Injectable, Logger, Inject, forwardRef } from "@nestjs/common";
import { ResumeProcessor } from "../../resume/resume.processor";
import { DiscoveryProcessor } from "../../jobs/discovery.processor";
import { MatchProcessor } from "../../jobs/match.processor";

@Injectable()
export class OrchestratorService {
  private readonly logger = new Logger(OrchestratorService.name);

  constructor(
    @Inject(forwardRef(() => ResumeProcessor))
    private resumeProcessor: ResumeProcessor,
    @Inject(forwardRef(() => DiscoveryProcessor))
    private discoveryProcessor: DiscoveryProcessor,
    @Inject(forwardRef(() => MatchProcessor))
    private matchProcessor: MatchProcessor,
  ) {}

  async startResumeProcessing(userId: string, resumeId: string): Promise<void> {
    this.logger.log(
      `Dev Fallback: Starting immediate resume processing for ${resumeId}`,
    );
    const mockJob = { data: { userId, resumeId } } as any;
    this.resumeProcessor.process(mockJob).catch((err) => {
      this.logger.error(`Direct resume processing failed: ${err.message}`);
    });
  }

  async startJobDiscovery(userId: string, profileId: string): Promise<void> {
    this.logger.log(
      `Dev Fallback: Starting immediate job discovery for profile ${profileId}`,
    );
    const mockJob = { data: { userId, profileId } } as any;
    this.discoveryProcessor.process(mockJob).catch((err) => {
      this.logger.error(`Direct job discovery failed: ${err.message}`);
    });
  }

  async startJobMatching(
    userId: string,
    profileId: string,
    jobId: string,
  ): Promise<void> {
    this.logger.log(
      `Dev Fallback: Starting immediate job matching for job ${jobId}`,
    );
    const mockJob = { data: { userId, profileId, jobId } } as any;
    this.matchProcessor.process(mockJob).catch((err) => {
      this.logger.error(`Direct job matching failed: ${err.message}`);
    });
  }
}
