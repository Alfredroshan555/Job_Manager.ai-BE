import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Schema as MongooseSchema } from "mongoose";

export type JobMatchDocument = JobMatch & Document;

@Schema()
export class JobMatch {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: "User", required: true })
  userId: MongooseSchema.Types.ObjectId;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: "Job", required: true })
  jobId: MongooseSchema.Types.ObjectId;

  @Prop({ required: true })
  matchScore: number;

  @Prop([String])
  skillOverlap: string[];

  @Prop([String])
  skillGaps: string[];

  @Prop({ required: true, enum: ["apply", "maybe", "skip"] })
  recommendation: string;

  @Prop({ default: Date.now })
  createdAt: Date;
}

export const JobMatchSchema = SchemaFactory.createForClass(JobMatch);
JobMatchSchema.index({ userId: 1, jobId: 1 }, { unique: true });
