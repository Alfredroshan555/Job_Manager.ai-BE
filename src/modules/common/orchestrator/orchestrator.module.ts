import { Module, Global, forwardRef } from "@nestjs/common";
import { OrchestratorService } from "./orchestrator.service";
import { ResumeModule } from "../../resume/resume.module";

@Global()
@Module({
  imports: [forwardRef(() => ResumeModule)],
  providers: [OrchestratorService],
  exports: [OrchestratorService],
})
export class OrchestratorModule {}
