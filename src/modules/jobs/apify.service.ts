import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { ApifyClient } from "apify-client";

export interface ApifyJob {
  title: string;
  company_name: string;
  location: string;
  description: string;
  platform_url: string;
  official_url?: string;
  platform: string;
  posted_date?: string;
  is_remote?: boolean;
  salary_minimum?: number;
  salary_maximum?: number;
  salary_currency?: string;
  salary_period?: string;
}

@Injectable()
export class ApifyService {
  private client: ApifyClient | null = null;
  private readonly logger = new Logger(ApifyService.name);
  private readonly ACTOR_ID = "jpraRc4MCUh5ehbHV"; // agentx/all-jobs-scraper

  constructor(private configService: ConfigService) {
    // const token = this.configService.get<string>("APIFY_API_TOKEN");
    const token = process.env.APIFY_API_TOKEN;
    if (token) {
      this.client = new ApifyClient({ token });
    } else {
      this.logger.warn(
        "APIFY_API_TOKEN not found in environment. Apify features will be disabled.",
      );
    }
  }

  async scrapeJobs(
    searchTerms: string[],
    location: string = "Kochi, Kerala",
    maxResults: number = 20,
  ): Promise<ApifyJob[]> {
    if (!this.client) {
      this.logger.error("Apify client not initialized. Cannot scrape jobs.");
      return [];
    }

    try {
      this.logger.log(
        `Starting job scraping for terms: ${searchTerms.join(", ")} in ${location}`,
      );

      const input = {
        search_terms: searchTerms,
        location: location,
        max_results: maxResults,
        posted_since: "7 days", // Default to recent jobs
        country: "India",
        currency: "INR",
      };

      // Run the Actor and wait for completion
      const run = await this.client.actor(this.ACTOR_ID).call(input);

      if (!run.defaultDatasetId) {
        throw new Error("Actor run failed or no dataset created");
      }

      this.logger.log(
        `Scraping completed. Dataset ID: ${run.defaultDatasetId}`,
      );

      // Fetch results from dataset
      const { items } = await this.client
        .dataset(run.defaultDatasetId)
        .listItems();

      this.logger.log(`Fetched ${items.length} jobs from Apify`);

      return items as unknown as ApifyJob[];
    } catch (error) {
      this.logger.error(`Apify Scrape Error: ${error.message}`, error.stack);
      return [];
    }
  }
}
