CREATE TABLE "audit_log" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"action" varchar(100) NOT NULL,
	"entity_type" varchar(100),
	"entity_id" varchar(256),
	"user_id" varchar(256),
	"user_email" varchar(256),
	"user_name" varchar(256),
	"details" jsonb,
	"ip_address" varchar(45),
	"user_agent" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "certification" (
	"id" varchar(256) PRIMARY KEY NOT NULL,
	"name" varchar(256) NOT NULL,
	"logo" varchar(512) NOT NULL,
	"status" varchar(50) DEFAULT 'active' NOT NULL,
	"publish_status" varchar(50) DEFAULT 'draft' NOT NULL,
	"last_audit_date" date,
	"expiry_date" date,
	"certificate_url" varchar(512),
	"description" text NOT NULL,
	"standards" jsonb NOT NULL,
	"published_at" timestamp with time zone,
	"published_by" varchar(256),
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "document" (
	"id" varchar(256) PRIMARY KEY NOT NULL,
	"title" varchar(512) NOT NULL,
	"category" varchar(100) NOT NULL,
	"description" text NOT NULL,
	"access_level" varchar(50) DEFAULT 'public' NOT NULL,
	"file_url" varchar(512),
	"file_size" varchar(50),
	"publish_status" varchar(50) DEFAULT 'draft' NOT NULL,
	"tags" jsonb NOT NULL,
	"published_at" timestamp with time zone,
	"published_by" varchar(256),
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "document_access_request" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"document_id" varchar(256) NOT NULL,
	"document_title" varchar(512) NOT NULL,
	"email" varchar(256) NOT NULL,
	"name" varchar(256) NOT NULL,
	"company" varchar(256) NOT NULL,
	"reason" text NOT NULL,
	"status" varchar(50) DEFAULT 'pending' NOT NULL,
	"approved_by" varchar(256),
	"approved_at" timestamp,
	"denial_reason" text,
	"denied_by" varchar(256),
	"denied_at" timestamp,
	"ip_address" varchar(45),
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "document_download" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"document_id" varchar(256) NOT NULL,
	"document_title" varchar(512) NOT NULL,
	"user_email" varchar(256),
	"user_name" varchar(256),
	"company" varchar(256),
	"ip_address" varchar(45),
	"user_agent" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "faq" (
	"id" varchar(256) PRIMARY KEY NOT NULL,
	"question" varchar(512) NOT NULL,
	"answer" text NOT NULL,
	"category" varchar(100) NOT NULL,
	"publish_status" varchar(50) DEFAULT 'draft' NOT NULL,
	"published_at" timestamp with time zone,
	"published_by" varchar(256),
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "form_submission" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"type" varchar(50) NOT NULL,
	"email" varchar(256) NOT NULL,
	"name" varchar(256),
	"company" varchar(256),
	"status" varchar(50) DEFAULT 'new' NOT NULL,
	"metadata" jsonb,
	"responded_at" timestamp,
	"responded_by" varchar(256),
	"response_notes" text,
	"ip_address" varchar(45),
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "post" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" varchar(256) NOT NULL,
	"content" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "subprocessor" (
	"id" varchar(256) PRIMARY KEY NOT NULL,
	"name" varchar(256) NOT NULL,
	"purpose" text NOT NULL,
	"data_processed" jsonb NOT NULL,
	"location" varchar(256) NOT NULL,
	"contract_url" varchar(512) NOT NULL,
	"status" varchar(50) DEFAULT 'active' NOT NULL,
	"publish_status" varchar(50) DEFAULT 'draft' NOT NULL,
	"published_at" timestamp with time zone,
	"published_by" varchar(256),
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "user" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"descope_user_id" varchar(256) NOT NULL,
	"email" varchar(256),
	"name" varchar(256),
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updated_at" timestamp with time zone,
	CONSTRAINT "user_descopeUserId_unique" UNIQUE("descope_user_id")
);
--> statement-breakpoint
CREATE INDEX "audit_log_action_idx" ON "audit_log" USING btree ("action");--> statement-breakpoint
CREATE INDEX "audit_log_entity_type_idx" ON "audit_log" USING btree ("entity_type");--> statement-breakpoint
CREATE INDEX "audit_log_entity_id_idx" ON "audit_log" USING btree ("entity_id");--> statement-breakpoint
CREATE INDEX "audit_log_user_id_idx" ON "audit_log" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "audit_log_created_at_idx" ON "audit_log" USING btree ("created_at");