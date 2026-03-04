import { Module, forwardRef } from "@nestjs/common";
import { User, UserSchema } from "../auth/user.schema";
import { MongooseModule } from "@nestjs/mongoose";
import { ResumeController } from "./resume.controller";
import { Resume, ResumeSchema } from "./resume.schema";
import { ResumeProcessor } from "./resume.processor";
import { ResumeProcessorService } from "./resume-processor.service";
import {
  JobProfile,
  JobProfileSchema,
} from "../jobs/schemas/job-profile.schema";
import { AiModule } from "../ai/ai.module";
import { OrchestratorModule } from "../common/orchestrator/orchestrator.module";

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Resume.name, schema: ResumeSchema },
      { name: JobProfile.name, schema: JobProfileSchema },
      { name: User.name, schema: UserSchema },
    ]),
    AiModule,
    forwardRef(() => OrchestratorModule),
  ],
  controllers: [ResumeController],
  providers: [ResumeProcessor, ResumeProcessorService],
  exports: [ResumeProcessor],
})
export class ResumeModule {}
