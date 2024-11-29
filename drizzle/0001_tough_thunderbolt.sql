CREATE TABLE IF NOT EXISTS "companies" (
	"company_id" char(26) PRIMARY KEY NOT NULL,
	"company_name" varchar(255) NOT NULL,
	"website" varchar(255),
	"logo" varchar(512),
	"metadata" jsonb,
	"is_processed" boolean DEFAULT false,
	"country" varchar(10),
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "conversations" (
	"conversation_id" char(26) PRIMARY KEY NOT NULL,
	"interview_id" varchar(26) NOT NULL,
	"question" text NOT NULL,
	"answer" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "interviews" (
	"interview_id" char(26) PRIMARY KEY NOT NULL,
	"company_id" varchar(26) NOT NULL,
	"candidate_id" char(26),
	"candidate_name" varchar(50),
	"position" varchar(50),
	"interview_type" varchar(50),
	"experience" integer,
	"resume_summary" text,
	"category" varchar(15) DEFAULT 'default' NOT NULL,
	"language" varchar(20) DEFAULT 'ENGLISH' NOT NULL,
	"feedback" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"ended_at" timestamp
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "prompts" (
	"prompt_id" varchar(40) PRIMARY KEY NOT NULL,
	"position" varchar(60),
	"interview_type" varchar(40),
	"company_id" char(26),
	"prompt" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "questions" (
	"question_id" char(26) PRIMARY KEY NOT NULL,
	"company_id" varchar(26),
	"question" text NOT NULL,
	"position" varchar(50),
	"interview_type" varchar(50),
	"experience_level" varchar(50),
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "verification_tokens" (
	"token" varchar(255) PRIMARY KEY NOT NULL,
	"email" varchar(255) NOT NULL,
	"expires" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now()
);
