import { Injectable, Logger } from "@nestjs/common";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { ConfigService } from "@nestjs/config";

export interface StructuredProfile {
  full_name: string;
  email: string;
  primary_role: string;
  related_roles: string[];
  experience_years: number;
  seniority_level: string;
  technical_stack: string[];
  core_skills: string[];
  industries: string[];
  search_keywords: string[];
}

export interface MatchResult {
  matchScore: number;
  skillOverlap: string[];
  skillGaps: string[];
  recommendation: "apply" | "maybe" | "skip";
}

@Injectable()
export class AiService {
  private genAI: GoogleGenerativeAI | null = null;
  private readonly logger = new Logger(AiService.name);

  constructor(private configService: ConfigService) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (apiKey) {
      this.genAI = new GoogleGenerativeAI(apiKey);
    } else {
      this.logger.warn(
        "GEMINI_API_KEY not found or default. Gemini-based AI features will be mocked.",
      );
    }
  }

  async parseResume(resumeText: string): Promise<StructuredProfile> {
    if (!this.genAI) {
      this.logger.error("Mocking resume parsing (Gemini disabled)...");
      return {
        full_name: "John Doe",
        email: "john.doe@example.com",
        primary_role: "Full Stack Developer",
        related_roles: ["Software Engineer", "Frontend Developer"],
        experience_years: 5,
        seniority_level: "Senior",
        technical_stack: ["React", "Node.js", "TypeScript", "MongoDB"],
        core_skills: ["Problem Solving", "Teamwork"],
        industries: ["Technology"],
        search_keywords: ["Software Engineer React"],
      };
    }

    try {
      const model = this.genAI.getGenerativeModel({
        model: "gemini-2.5-flash",
        generationConfig: { responseMimeType: "application/json" },
      });
      const prompt = `
        You are an expert HR and recruitment AI specialized in parsing professional resumes.
        Analyze the following resume text and extract structured profile data.

        The response must be a JSON object with the following fields:
        - full_name: string
        - email: string
        - primary_role: string
        - related_roles: string[]
        - experience_years: number
        - seniority_level: string (Junior, Mid-level, Senior, Lead, Manager, Director, or Executive)
        - technical_stack: string[]
        - core_skills: string[]
        - industries: string[]
        - search_keywords: string[]

        Resume Text:
        ${resumeText.substring(0, 30000)}
      `;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      this.logger.debug(`AI Raw Response: ${text}`);

      try {
        return JSON.parse(text) as StructuredProfile;
      } catch (parseError) {
        this.logger.error("Failed to parse Gemini JSON:", text);
        throw parseError;
      }
    } catch (error) {
      this.logger.error(`Gemini Parsing Error: ${error.message}`, error.stack);
      throw new Error(`Failed to parse resume with Gemini: ${error.message}`);
    }
  }

  async scoreJob(profile: any, job: any): Promise<MatchResult> {
    if (!this.genAI) {
      this.logger.log("Mocking job scoring (Gemini disabled)...");
      return {
        matchScore: 85,
        skillOverlap: ["React", "Node.js"],
        skillGaps: ["Docker"],
        recommendation: "apply",
      };
    }

    try {
      const model = this.genAI.getGenerativeModel({
        model: "gemini-2.5-flash",
        generationConfig: { responseMimeType: "application/json" },
      });
      const prompt = `
        You are an expert recruitment AI matching a candidate's profile to a specific job opening.
        Evaluate the match between the candidate profile and the job description.

        Candidate Profile:
        - Primary Role: ${profile.primary_role}
        - Tech Stack: ${profile.technical_stack.join(", ")}
        - Core Skills: ${profile.core_skills.join(", ")}
        - Industries: ${profile.industries.join(", ")}
        - Experience Level: ${profile.seniority_level} (${profile.experience_years} years)

        Job Title: ${job.title}
        Company: ${job.company}
        Job Description Snippet:
        ${job.description.substring(0, 10000)}

        The match must be a JSON object with:
        - matchScore: number (0-100)
        - skillOverlap: string[]
        - skillGaps: string[]
        - recommendation: "apply" | "maybe" | "skip"
      `;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      this.logger.debug(`AI Match Result: ${text}`);

      try {
        return JSON.parse(text) as MatchResult;
      } catch (parseError) {
        this.logger.error("Failed to parse Gemini Match JSON:", text);
        throw parseError;
      }
    } catch (error) {
      this.logger.error(`Gemini Matching Error: ${error.message}`, error.stack);
      return {
        matchScore: 0,
        skillOverlap: [],
        skillGaps: [],
        recommendation: "skip",
      };
    }
  }
}
