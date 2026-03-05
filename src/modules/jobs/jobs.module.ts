import { Module, forwardRef } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { JobsController } from "./jobs.controller";
import { Job, JobSchema } from "./schemas/job.schema";
import { JobMatch, JobMatchSchema } from "./schemas/job-match.schema";
import { JobProfile, JobProfileSchema } from "./schemas/job-profile.schema";
import { ScrapeLog, ScrapeLogSchema } from "./schemas/scrape-log.schema";
import { JobDiscoveryService } from "./job-discovery.service";
import { ApifyService } from "./apify.service";
import { DiscoveryProcessor } from "./discovery.processor";
import { MatchProcessor } from "./match.processor";
import { OrchestratorModule } from "../common/orchestrator/orchestrator.module";

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Job.name, schema: JobSchema },
      { name: JobMatch.name, schema: JobMatchSchema },
      { name: JobProfile.name, schema: JobProfileSchema },
      { name: ScrapeLog.name, schema: ScrapeLogSchema },
    ]),
    forwardRef(() => OrchestratorModule),
  ],
  controllers: [JobsController],
  providers: [
    JobDiscoveryService,
    ApifyService,
    DiscoveryProcessor,
    MatchProcessor,
  ],
  exports: [
    MongooseModule,
    JobDiscoveryService,
    ApifyService,
    DiscoveryProcessor,
    MatchProcessor,
  ],
})
export class JobsModule {}
