import { Injectable, Logger } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import * as crypto from "crypto";
import { Job, JobDocument } from "./schemas/job.schema";
import { JobProfileDocument } from "./schemas/job-profile.schema";
import { ApifyService } from "./apify.service";

@Injectable()
export class JobDiscoveryService {
  private readonly logger = new Logger(JobDiscoveryService.name);

  constructor(
    @InjectModel(Job.name) private jobModel: Model<JobDocument>,
    private readonly apifyService: ApifyService,
  ) {}

  async updateJobsFromProfile(
    profile: JobProfileDocument,
  ): Promise<JobDocument[]> {
    const searchTerms = profile.search_keywords.slice(0, 5);
    const discoveredJobs: JobDocument[] = [];

    this.logger.log(
      `Starting job discovery for ${searchTerms.length} terms...`,
    );

    const apifyResults = await this.apifyService.scrapeJobs(searchTerms);

    if (apifyResults.length === 0) {
      this.logger.warn("No jobs found via Apify.");
      return [];
    }

    for (const jobData of apifyResults) {
      // Validate critical fields to avoid null pointer errors
      if (!jobData.title || !jobData.company_name) {
        this.logger.warn(
          `Skipping job listing with missing critical data: ${JSON.stringify(jobData).substring(0, 100)}...`,
        );
        continue;
      }

      const sourceUrl = jobData.official_url || jobData.platform_url;
      const hashId = this.generateHash(jobData.title, jobData.company_name);

      const job = await this.jobModel.findOneAndUpdate(
        { hashId },
        {
          title: jobData.title,
          company: jobData.company_name,
          location: jobData.location,
          description: jobData.description,
          sourceUrl: sourceUrl,
          source: jobData.platform,
          postedAt: jobData.posted_date
            ? new Date(jobData.posted_date)
            : new Date(),
          hashId,
        },
        { upsert: true, returnDocument: "after" },
      );
      discoveredJobs.push(job);
    }

    this.logger.log(
      `Successfully discovered and updated ${discoveredJobs.length} jobs.`,
    );
    return discoveredJobs;
  }

  private generateHash(title: string, company: string): string {
    const safeTitle = (title ?? "").toLowerCase().trim();
    const safeCompany = (company ?? "").toLowerCase().trim();
    return crypto
      .createHash("sha256")
      .update(`${safeTitle}-${safeCompany}`)
      .digest("hex");
  }
}
