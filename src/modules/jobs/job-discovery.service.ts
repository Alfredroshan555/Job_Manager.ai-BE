import { Injectable, Logger } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import axios from "axios";
import * as crypto from "crypto";
import { Job, JobDocument } from "./schemas/job.schema";
import { JobProfileDocument } from "./schemas/job-profile.schema";

@Injectable()
export class JobDiscoveryService {
  private readonly logger = new Logger(JobDiscoveryService.name);

  constructor(@InjectModel(Job.name) private jobModel: Model<JobDocument>) {}

  async updateJobsFromProfile(
    profile: JobProfileDocument,
  ): Promise<JobDocument[]> {
    const queries = profile.search_keywords.slice(0, 5);
    const discoveredJobs: JobDocument[] = [];

    for (const query of queries) {
      const results = await this.searchJobs(query);
      for (const jobData of results) {
        const hashId = this.generateHash(jobData.title, jobData.company);

        const job = await this.jobModel.findOneAndUpdate(
          { hashId },
          {
            ...jobData,
            hashId,
          },
          { upsert: true, new: true },
        );
        discoveredJobs.push(job);
      }
    }

    return discoveredJobs;
  }

  private async searchJobs(query: string): Promise<Partial<Job>[]> {
    if (!process.env.SCRAPER_API_KEY) {
      return [
        {
          title: `Software Engineer - ${query}`,
          company: "Tech Corp",
          location: "Remote",
          description: "Description of the role...",
          sourceUrl: `https://example.com/job/${Math.random()}`,
          source: "LinkedIn",
          postedAt: new Date(),
        },
      ];
    }

    try {
      const response = await axios.post(
        "https://google.serper.dev/search",
        {
          q: `${query} jobs last 7 days`,
          num: 10,
        },
        {
          headers: {
            "X-API-KEY": process.env.SCRAPER_API_KEY,
            "Content-Type": "application/json",
          },
        },
      );

      return (response.data as any).organic.map((item: any) => ({
        title: item.title,
        company: this.extractCompany(item.snippet),
        location: "United States",
        description: item.snippet,
        sourceUrl: item.link,
        source: this.detectSource(item.link),
        postedAt: new Date(),
      }));
    } catch (error) {
      this.logger.error("Job Search Error:", error);
      return [];
    }
  }

  private generateHash(title: string, company: string): string {
    return crypto
      .createHash("sha256")
      .update(`${title.toLowerCase().trim()}-${company.toLowerCase().trim()}`)
      .digest("hex");
  }

  private detectSource(url: string): string {
    if (url.includes("linkedin.com")) return "LinkedIn";
    if (url.includes("indeed.com")) return "Indeed";
    if (url.includes("wellfound.com")) return "Wellfound";
    if (url.includes("naukri.com")) return "Naukri";
    return "Web Search";
  }

  private extractCompany(snippet: string): string {
    return "Unknown Company";
  }
}
