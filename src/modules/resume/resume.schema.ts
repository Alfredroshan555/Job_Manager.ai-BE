import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Schema as MongooseSchema } from "mongoose";

export type ResumeDocument = Resume & Document;

@Schema()
export class Resume {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: "User", required: true })
  userId: MongooseSchema.Types.ObjectId;

  @Prop({ required: true })
  fileUrl: string;

  @Prop({ required: true })
  mimeType: string;

  @Prop({ required: true })
  rawText: string;

  @Prop({ default: "processing", enum: ["processing", "completed", "failed"] })
  status: string;

  @Prop({ default: Date.now })
  uploadedAt: Date;
}

export const ResumeSchema = SchemaFactory.createForClass(Resume);
