import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { AppController } from "./app.controller";
import { MongooseModule } from "@nestjs/mongoose";
import { BullModule } from "@nestjs/bullmq";
import { AuthModule } from "./modules/auth/auth.module";
import { ResumeModule } from "./modules/resume/resume.module";
import { JobsModule } from "./modules/jobs/jobs.module";
import { AiModule } from "./modules/ai/ai.module";
import { OrchestratorModule } from "./modules/common/orchestrator/orchestrator.module";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),

    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        uri: configService.get<string>("MONGODB_URI"),
      }),
      inject: [ConfigService],
    }),
    /*
    BullModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        connection: {
          url: configService.get<string>("REDIS_URL"),
        },
      }),
      inject: [ConfigService],
    }),
    */
    AuthModule,
    ResumeModule,
    JobsModule,
    AiModule,
    OrchestratorModule,
  ],
  controllers: [AppController],
  providers: [],
})
export class AppModule {}
