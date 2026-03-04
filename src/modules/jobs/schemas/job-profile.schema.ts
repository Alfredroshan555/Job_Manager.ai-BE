import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Schema as MongooseSchema } from "mongoose";

export type JobProfileDocument = JobProfile & Document;

@Schema({ collection: "jobprofiles" })
export class JobProfile {
  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: "Resume",
    required: false,
    unique: true,
    sparse: true,
  })
  resumeId?: MongooseSchema.Types.ObjectId;

  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: "User",
    required: true,
    unique: true,
  })
  userId: MongooseSchema.Types.ObjectId;

  @Prop({ required: true })
  email: string;

  @Prop({ required: true })
  primary_role: string;

  @Prop([String])
  related_roles: string[];

  @Prop()
  experience_years: number;

  @Prop()
  seniority_level: string;

  @Prop([String])
  technical_stack: string[];

  @Prop([String])
  core_skills: string[];

  @Prop([String])
  industries: string[];

  @Prop([String])
  search_keywords: string[];

  @Prop({ default: Date.now })
  createdAt: Date;
}

export const JobProfileSchema = SchemaFactory.createForClass(JobProfile);
