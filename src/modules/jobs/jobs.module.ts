import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { JobsController } from "./jobs.controller";
import { Job, JobSchema } from "./schemas/job.schema";
import { JobMatch, JobMatchSchema } from "./schemas/job-match.schema";
import { JobProfile, JobProfileSchema } from "./schemas/job-profile.schema";
import { ScrapeLog, ScrapeLogSchema } from "./schemas/scrape-log.schema";
import { JobDiscoveryService } from "./job-discovery.service";
// import { DiscoveryProcessor } from './discovery.processor';
// import { MatchProcessor } from './match.processor';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Job.name, schema: JobSchema },
      { name: JobMatch.name, schema: JobMatchSchema },
      { name: JobProfile.name, schema: JobProfileSchema },
      { name: ScrapeLog.name, schema: ScrapeLogSchema },
    ]),
  ],
  controllers: [JobsController],
  providers: [JobDiscoveryService /*, DiscoveryProcessor, MatchProcessor*/],
  exports: [MongooseModule],
})
export class JobsModule {}
