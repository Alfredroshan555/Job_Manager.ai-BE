import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Schema as MongooseSchema } from "mongoose";

export type ProfileDocument = Profile & Document;

@Schema({ collection: "jobprofiles" })
export class Profile {
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

  @Prop({ type: [String], default: [] })
  related_roles: string[];

  @Prop({ required: true })
  experience_years: number;

  @Prop({ required: true })
  seniority_level: string;

  @Prop({ type: [String], default: [] })
  technical_stack: string[];

  @Prop({ type: [String], default: [] })
  core_skills: string[];

  @Prop({ type: [String], default: [] })
  industries: string[];

  @Prop({ type: [String], default: [] })
  search_keywords: string[];

  @Prop({ default: Date.now })
  createdAt: Date;
}

export const ProfileSchema = SchemaFactory.createForClass(Profile);
