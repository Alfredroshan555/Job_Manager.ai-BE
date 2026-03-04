import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document } from "mongoose";

export type JobDocument = Job & Document;

@Schema()
export class Job {
  @Prop()
  externalId: string;

  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  company: string;

  @Prop()
  location: string;

  @Prop({ required: true })
  description: string;

  @Prop({ required: true, unique: true })
  sourceUrl: string;

  @Prop()
  source: string;

  @Prop()
  postedAt: Date;

  @Prop({ required: true, unique: true })
  hashId: string;

  @Prop({ default: Date.now })
  createdAt: Date;
}

export const JobSchema = SchemaFactory.createForClass(Job);
