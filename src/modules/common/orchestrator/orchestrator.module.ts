import { Module, Global, forwardRef } from "@nestjs/common";
import { OrchestratorService } from "./orchestrator.service";
import { ResumeModule } from "../../resume/resume.module";
import { JobsModule } from "../../jobs/jobs.module";

@Global()
@Module({
  imports: [forwardRef(() => ResumeModule), forwardRef(() => JobsModule)],
  providers: [OrchestratorService],
  exports: [OrchestratorService],
})
export class OrchestratorModule {}
