CREATE TABLE "audit_log" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"action" varchar(50) NOT NULL,
	"entity_type" varchar(100) NOT NULL,
	"entity_id" varchar(256),
	"user_id" varchar(256),
	"user_email" varchar(256),
	"user_name" varchar(256),
	"metadata" jsonb,
	"ip_address" varchar(45),
	"user_agent" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "certification" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(256) NOT NULL,
	"slug" varchar(256) NOT NULL,
	"logo" varchar(512),
	"status" varchar(50) DEFAULT 'active' NOT NULL,
	"last_audit_date" date,
	"expiry_date" date,
	"certificate_url" varchar(1024),
	"description" text NOT NULL,
	"standards" jsonb DEFAULT '[]'::jsonb,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"is_published" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone,
	CONSTRAINT "certification_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "document" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" varchar(512) NOT NULL,
	"slug" varchar(256) NOT NULL,
	"category" varchar(50) NOT NULL,
	"description" text NOT NULL,
	"access_level" varchar(50) DEFAULT 'public' NOT NULL,
	"file_url" varchar(1024),
	"file_size" varchar(50),
	"file_mime_type" varchar(100),
	"tags" jsonb DEFAULT '[]'::jsonb,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"is_published" boolean DEFAULT true NOT NULL,
	"download_count" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone,
	CONSTRAINT "document_slug_unique" UNIQUE("slug")
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
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"question" text NOT NULL,
	"answer" text NOT NULL,
	"category" varchar(50) NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"is_published" boolean DEFAULT true NOT NULL,
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
	"status" varchar(50) DEFAULT 'pending' NOT NULL,
	"metadata" jsonb,
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
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(256) NOT NULL,
	"slug" varchar(256) NOT NULL,
	"purpose" text NOT NULL,
	"data_processed" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"location" varchar(256) NOT NULL,
	"contract_url" varchar(1024),
	"status" varchar(50) DEFAULT 'active' NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"is_published" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone,
	CONSTRAINT "subprocessor_slug_unique" UNIQUE("slug")
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
CREATE INDEX "audit_log_created_at_idx" ON "audit_log" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "certification_status_idx" ON "certification" USING btree ("status");--> statement-breakpoint
CREATE INDEX "certification_is_published_idx" ON "certification" USING btree ("is_published");--> statement-breakpoint
CREATE INDEX "document_category_idx" ON "document" USING btree ("category");--> statement-breakpoint
CREATE INDEX "document_access_level_idx" ON "document" USING btree ("access_level");--> statement-breakpoint
CREATE INDEX "document_is_published_idx" ON "document" USING btree ("is_published");--> statement-breakpoint
CREATE INDEX "faq_category_idx" ON "faq" USING btree ("category");--> statement-breakpoint
CREATE INDEX "faq_is_published_idx" ON "faq" USING btree ("is_published");--> statement-breakpoint
CREATE INDEX "subprocessor_status_idx" ON "subprocessor" USING btree ("status");--> statement-breakpoint
CREATE INDEX "subprocessor_is_published_idx" ON "subprocessor" USING btree ("is_published");