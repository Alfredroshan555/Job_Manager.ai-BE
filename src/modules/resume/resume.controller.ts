import {
  Controller,
  Post,
  Get,
  Param,
  UseInterceptors,
  UploadedFile,
  UseGuards,
  Req,
  BadRequestException,
} from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { Resume, ResumeDocument } from "./resume.schema";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { OrchestratorService } from "../common/orchestrator/orchestrator.service";
import { diskStorage } from "multer";
import { extname } from "path";

@Controller("api/resume")
export class ResumeController {
  constructor(
    @InjectModel(Resume.name) private resumeModel: Model<ResumeDocument>,
    private readonly orchestratorService: OrchestratorService,
  ) {}

  @Post("upload")
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(
    FileInterceptor("resume", {
      storage: diskStorage({
        destination: "./uploads",
        filename: (req, file, cb) => {
          const randomName = Array(32)
            .fill(null)
            .map(() => Math.round(Math.random() * 16).toString(16))
            .join("");
          return cb(null, `${randomName}${extname(file.originalname)}`);
        },
      }),
    }),
  )
  async uploadFile(@UploadedFile() file: Express.Multer.File, @Req() req: any) {
    if (!file) throw new BadRequestException("No file uploaded");
    const userId = req.user.userId;

    try {
      const resume = new this.resumeModel({
        userId,
        fileUrl: file.path,
        mimeType: file.mimetype,
        rawText: "Pending extraction...",
        uploadedAt: new Date(),
      });
      await resume.save();

      await this.orchestratorService.startResumeProcessing(
        userId,
        resume._id.toString(),
      );

      return {
        message: "Upload success. Processing started.",
        resumeId: resume._id,
      };
    } catch (error) {
      throw new BadRequestException("Upload failed");
    }
  }

  @Get("status/:id")
  @UseGuards(JwtAuthGuard)
  async getStatus(@Param("id") id: string, @Req() req: any) {
    const userId = req.user.userId;
    const resume = await this.resumeModel.findOne({ _id: id, userId });
    if (!resume) throw new BadRequestException("Resume not found");

    return {
      status: resume.status,
      resumeId: resume._id,
    };
  }
}
