import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Schema as MongooseSchema } from "mongoose";

export type ScrapeLogDocument = ScrapeLog & Document;

@Schema()
export class ScrapeLog {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: "User", required: true })
  userId: MongooseSchema.Types.ObjectId;

  @Prop({ required: true })
  query: string;

  @Prop({ required: true })
  source: string;

  @Prop({ enum: ["pending", "completed", "failed"], default: "pending" })
  status: string;

  @Prop({ default: 0 })
  jobsFound: number;

  @Prop()
  error: string;

  @Prop({ default: Date.now })
  createdAt: Date;
}

export const ScrapeLogSchema = SchemaFactory.createForClass(ScrapeLog);
