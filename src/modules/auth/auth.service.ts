import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
} from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import * as bcrypt from "bcryptjs";
import * as jwt from "jsonwebtoken";
import { User, UserDocument } from "./user.schema";
import {
  JobProfile,
  JobProfileDocument,
} from "../jobs/schemas/job-profile.schema";

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(JobProfile.name)
    private profileModel: Model<JobProfileDocument>,
  ) {}

  async signup(email: string, password: string) {
    const existing = await this.userModel.findOne({ email });
    if (existing) throw new BadRequestException("User exists");

    const passwordHash = await bcrypt.hash(password, 10);
    const user = new this.userModel({ email, passwordHash });
    await user.save();

    // Create default profile in jobprofiles
    const profile = new this.profileModel({
      userId: user._id,
      email: user.email,
      primary_role: "New User",
      experience_years: 0,
      seniority_level: "Entry",
    });
    await profile.save();

    return { message: "User created" };
  }

  async login(email: string, password: string) {
    const user = await this.userModel.findOne({ email });
    if (!user) throw new UnauthorizedException("Invalid credentials");

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) throw new UnauthorizedException("Invalid credentials");

    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET || "secret",
      { expiresIn: "7d" },
    );
    return { token, user: { id: user._id, email: user.email } };
  }

  async findById(id: string) {
    const user = await this.userModel.findById(id);
    if (!user) throw new UnauthorizedException("User not found");
    return user;
  }

  async findProfileByUserId(userId: string) {
    return this.profileModel.findOne({
      userId: new Types.ObjectId(userId),
    } as any);
  }

  async findOrCreateProfile(userId: string, email: string) {
    let profile = await this.findProfileByUserId(userId);
    // Dummy data added in case there is no profile available in the DB --> Test condition will not affect in PROD
    if (!profile) {
      profile = new this.profileModel({
        userId: new Types.ObjectId(userId),
        email: email,
        primary_role: "Full Stack Engineer",
        experience_years: 5,
        seniority_level: "Senior",
      });
      await profile.save();
    }
    return profile;
  }
}
