import {
  Controller,
  Get,
  Post,
  Query,
  UseGuards,
  Req,
  NotFoundException,
  InternalServerErrorException,
} from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import { JobMatch, JobMatchDocument } from "./schemas/job-match.schema";
import { JobProfile, JobProfileDocument } from "./schemas/job-profile.schema";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { OrchestratorService } from "../common/orchestrator/orchestrator.service";

@Controller("api/jobs")
@UseGuards(JwtAuthGuard)
export class JobsController {
  constructor(
    @InjectModel(JobMatch.name) private jobMatchModel: Model<JobMatchDocument>,
    @InjectModel(JobProfile.name)
    private jobProfileModel: Model<JobProfileDocument>,
    private readonly orchestratorService: OrchestratorService,
  ) {}

  @Get("matches")
  async getMatches(
    @Req() req: any,
    @Query("minScore") minScore = 0,
    @Query("limit") limit = 50,
    @Query("sort") sort = "desc",
  ) {
    const userId = req.user.userId;

    try {
      const matches = await this.jobMatchModel
        .find({
          userId,
          matchScore: { $gte: Number(minScore) },
        })
        .sort({ matchScore: sort === "desc" ? -1 : 1 })
        .populate("jobId")
        .limit(Number(limit));

      return matches;
    } catch (error) {
      throw new InternalServerErrorException("Failed to fetch matches");
    }
  }

  @Post("refresh")
  async refreshJobs(@Req() req: any) {
    const userId = req.user.userId;

    try {
      const profile = await this.jobProfileModel.findOne({ userId });
      if (!profile)
        throw new NotFoundException("No profile found. Upload resume first.");

      await this.orchestratorService.startJobDiscovery(
        userId,
        profile._id.toString(),
      );
      return { message: "Job discovery refresh triggered" };
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      throw new InternalServerErrorException("Refresh failed");
    }
  }

  @Get("dashboard-summary")
  async getSummary(@Req() req: any) {
    const userId = req.user.userId;

    try {
      const totalMatches = await this.jobMatchModel.countDocuments({ userId });
      const avgScore = await this.jobMatchModel.aggregate([
        { $match: { userId: new Types.ObjectId(userId) } },
        { $group: { _id: null, avg: { $avg: "$matchScore" } } },
      ]);

      const profile = await this.jobProfileModel.findOne({ userId });

      return {
        totalJobsDiscovered: totalMatches,
        averageMatchScore: avgScore[0]?.avg || 0,
        lastUpdated: profile ? profile.createdAt : null,
        profile: profile || null,
      };
    } catch (error) {
      throw new InternalServerErrorException("Summary failed");
    }
  }
}
