import { Injectable } from "@nestjs/common";
const pdf = require("pdf-parse");
import * as mammoth from "mammoth";
import * as fs from "fs";

@Injectable()
export class ResumeProcessorService {
  async extractText(filePath: string, mimeType: string): Promise<string> {
    if (mimeType === "application/pdf") {
      const dataBuffer = fs.readFileSync(filePath);
      const instance = new pdf.PDFParse(new Uint8Array(dataBuffer));
      const data = await instance.getText();
      return data.text;
    } else if (
      mimeType ===
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
      mimeType === "application/msword"
    ) {
      const result = await mammoth.extractRawText({ path: filePath });
      return result.value;
    } else {
      throw new Error(`Unsupported file type: ${mimeType}`);
    }
  }
}
