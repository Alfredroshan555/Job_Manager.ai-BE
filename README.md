# Job_Manager.ai Backend

A powerful, AI-driven job tracking and management system built with NestJS. This application helps users track their job applications, process resumes using AI, and match their profiles with the best job opportunities.

## 🚀 Features

- **User Authentication**: Secure signup/login using JWT and bcrypt.
- **Resume Processing**: Extract text from PDF/Docx resumes and process them using AI.
- **AI-Powered Insights**: Integration with Gemini/OpenAI for resume analysis and job matching.
- **Job Discovery**: Automated job discovery and matching based on user profiles.
- **Orchestration**: Background task processing using BullMQ and Redis.
- **Dashboard**: Get a summary of your job application progress.

## 🛠️ Tech Stack

- **Framework**: [NestJS](https://nestjs.com/) (Node.js)
- **Database**: [MongoDB](https://www.mongodb.com/) with [Mongoose](https://mongoosejs.com/)
- **AI Services**: [Google Gemini Pro](https://ai.google.dev/) & [OpenAI](https://openai.com/)
- **Queue System**: [BullMQ](https://docs.bullmq.io/) & [Redis](https://redis.io/)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Other Tools**:
  - `pdf-parse` & `mammoth` for document extraction
  - `bcryptjs` for password hashing
  - `jsonwebtoken` for auth tokens
  - `multer` for file uploads

## 📂 Project Structure

```bash
src/
├── modules/
│   ├── ai/          # AI logic (Gemini/OpenAI services)
│   ├── auth/        # User authentication & profile management
│   ├── jobs/        # Job discovery, matching & scheduling
│   ├── resume/      # Resume upload & text extraction
│   └── common/      # Core orchestrator and shared schemas
├── main.ts          # Application entry point
└── app.module.ts    # Root bridge module
```

## ⚙️ Prerequisites

- **Node.js**: v18+
- **MongoDB**: A running instance (local or Atlas)
- **Redis**: Required for BullMQ queues
- **API Keys**: Google Gemini and/or OpenAI keys

## 🛠️ Installation & Setup

1. **Clone the repository**:

   ```bash
   git clone https://github.com/Alfredroshan555/Job_Manager.ai-BE.git
   cd Job_Manager.ai-BE
   ```

2. **Install dependencies**:

   ```bash
   npm install
   ```

3. **Configure Environment Variables**:
   Create a `.env` file in the root directory:

   ```env
   PORT=5001
   MONGODB_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret
   GEMINI_API_KEY=your_gemini_key
   OPENAI_API_KEY=your_openai_key
   REDIS_HOST=localhost
   REDIS_PORT=6379
   ```

4. **Run the application**:

   ```bash
   # Development mode
   npm run dev

   # Production mode
   npm run build
   npm run start:prod
   ```

## 🛣️ API Endpoints

### Auth

- `POST /api/auth/signup` - Register a new user
- `POST /api/auth/login` - Login and receive JWT
- `GET /api/auth/me` - Get current user profile

### Resume

- `POST /api/resume/upload` - Upload and process a resume
- `GET /api/resume/status/:id` - Check processing status

### Jobs

- `GET /api/jobs/matches` - Get AI-recommended job matches
- `POST /api/jobs/refresh` - Trigger manual job discovery
- `GET /api/jobs/dashboard-summary` - Get application stats

## 📄 License

This project is licensed under the ISC License.
