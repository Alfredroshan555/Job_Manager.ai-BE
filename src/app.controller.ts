import { Get, Controller } from "@nestjs/common";
import { InjectConnection } from "@nestjs/mongoose";
import { Connection } from "mongoose";

@Controller()
export class AppController {
  constructor(@InjectConnection() private connection: Connection) {}

  @Get()
  getHello(): string {
    return "AI Job Intelligence API (NestJS) is running! (Mock Mode)";
  }

  @Get("api/health")
  getHealth() {
    return { status: "ok", framework: "NestJS" };
  }

  @Get("api/mongo-test")
  async testMongo() {
    try {
      const dbName = this.connection.db.databaseName;

      // Fetch all data from the 'users' collection
      const users = await this.connection.db
        .collection("users")
        .find()
        .toArray();

      return {
        message: "Data fetched successfully from 'users' collection",
        database: dbName,
        userCount: users.length,
        users: users,
      };
    } catch (error) {
      return {
        message: "Failed to fetch data from MongoDB",
        error: error.message,
      };
    }
  }
}

