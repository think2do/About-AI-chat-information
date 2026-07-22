import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_users_role" AS ENUM('admin', 'editor', 'member');
  CREATE TYPE "public"."enum_users_account_status" AS ENUM('active', 'suspended');
  CREATE TYPE "public"."enum_activities_activity_status" AS ENUM('registering', 'ongoing', 'upcoming', 'open', 'ended');
  CREATE TYPE "public"."enum_activities_registration_mode" AS ENUM('internal', 'external', 'closed');
  CREATE TYPE "public"."enum_activities_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__activities_v_version_activity_status" AS ENUM('registering', 'ongoing', 'upcoming', 'open', 'ended');
  CREATE TYPE "public"."enum__activities_v_version_registration_mode" AS ENUM('internal', 'external', 'closed');
  CREATE TYPE "public"."enum__activities_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum_activity_registrations_status" AS ENUM('registered', 'cancelled');
  CREATE TYPE "public"."enum_works_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__works_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum_content_modules_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__content_modules_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum_content_categories_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__content_categories_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum_content_items_item_type" AS ENUM('term', 'question', 'tool', 'command', 'simulator-step', 'agent-step', 'hidden-feature', 'module-config', 'lab-config', 'function-call-step', 'inference-step', 'rag-step', 'pipeline-stage');
  CREATE TYPE "public"."enum_content_items_difficulty" AS ENUM('简单', '中等', '困难');
  CREATE TYPE "public"."enum_content_items_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__content_items_v_version_item_type" AS ENUM('term', 'question', 'tool', 'command', 'simulator-step', 'agent-step', 'hidden-feature', 'module-config', 'lab-config', 'function-call-step', 'inference-step', 'rag-step', 'pipeline-stage');
  CREATE TYPE "public"."enum__content_items_v_version_difficulty" AS ENUM('简单', '中等', '困难');
  CREATE TYPE "public"."enum__content_items_v_version_status" AS ENUM('draft', 'published');
  CREATE TABLE "users_sessions" (
  	"_order" integer NOT NULL,
  	"_parent_id" uuid NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"created_at" timestamp(3) with time zone,
  	"expires_at" timestamp(3) with time zone NOT NULL
  );
  
  CREATE TABLE "users" (
  	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  	"name" varchar NOT NULL,
  	"role" "enum_users_role" DEFAULT 'member' NOT NULL,
  	"account_status" "enum_users_account_status" DEFAULT 'active' NOT NULL,
  	"suspension_reason" varchar,
  	"last_login_at" timestamp(3) with time zone,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"email" varchar NOT NULL,
  	"reset_password_token" varchar,
  	"reset_password_expiration" timestamp(3) with time zone,
  	"salt" varchar,
  	"hash" varchar,
  	"login_attempts" numeric DEFAULT 0,
  	"lock_until" timestamp(3) with time zone
  );
  
  CREATE TABLE "activities" (
  	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  	"title" varchar,
  	"slug" varchar,
  	"summary" varchar,
  	"rules" varchar,
  	"activity_status" "enum_activities_activity_status" DEFAULT 'upcoming',
  	"registration_mode" "enum_activities_registration_mode" DEFAULT 'internal',
  	"capacity" numeric,
  	"external_registration_url" varchar,
  	"status_text" varchar,
  	"participant_count" numeric DEFAULT 0,
  	"featured" boolean DEFAULT false,
  	"sort_order" numeric DEFAULT 0,
  	"cover_id" uuid,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"_status" "enum_activities_status" DEFAULT 'draft'
  );
  
  CREATE TABLE "_activities_v" (
  	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  	"parent_id" uuid,
  	"version_title" varchar,
  	"version_slug" varchar,
  	"version_summary" varchar,
  	"version_rules" varchar,
  	"version_activity_status" "enum__activities_v_version_activity_status" DEFAULT 'upcoming',
  	"version_registration_mode" "enum__activities_v_version_registration_mode" DEFAULT 'internal',
  	"version_capacity" numeric,
  	"version_external_registration_url" varchar,
  	"version_status_text" varchar,
  	"version_participant_count" numeric DEFAULT 0,
  	"version_featured" boolean DEFAULT false,
  	"version_sort_order" numeric DEFAULT 0,
  	"version_cover_id" uuid,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "enum__activities_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"latest" boolean
  );
  
  CREATE TABLE "activity_registrations" (
  	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  	"activity_id" uuid NOT NULL,
  	"user_id" uuid NOT NULL,
  	"contact_name" varchar NOT NULL,
  	"contact_email" varchar NOT NULL,
  	"contact_mobile" varchar,
  	"note" varchar,
  	"status" "enum_activity_registrations_status" DEFAULT 'registered' NOT NULL,
  	"registered_at" timestamp(3) with time zone NOT NULL,
  	"cancelled_at" timestamp(3) with time zone,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "works" (
  	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  	"title" varchar,
  	"slug" varchar,
  	"category" varchar,
  	"summary" varchar,
  	"author_name" varchar,
  	"external_url" varchar,
  	"featured" boolean DEFAULT false,
  	"sort_order" numeric DEFAULT 0,
  	"cover_id" uuid,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"_status" "enum_works_status" DEFAULT 'draft'
  );
  
  CREATE TABLE "_works_v" (
  	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  	"parent_id" uuid,
  	"version_title" varchar,
  	"version_slug" varchar,
  	"version_category" varchar,
  	"version_summary" varchar,
  	"version_author_name" varchar,
  	"version_external_url" varchar,
  	"version_featured" boolean DEFAULT false,
  	"version_sort_order" numeric DEFAULT 0,
  	"version_cover_id" uuid,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "enum__works_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"latest" boolean
  );
  
  CREATE TABLE "content_modules" (
  	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  	"label" varchar,
  	"slug" varchar,
  	"description" varchar,
  	"accent_color" varchar DEFAULT '#6c5ce7',
  	"sort_order" numeric DEFAULT 0,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"_status" "enum_content_modules_status" DEFAULT 'draft'
  );
  
  CREATE TABLE "_content_modules_v" (
  	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  	"parent_id" uuid,
  	"version_label" varchar,
  	"version_slug" varchar,
  	"version_description" varchar,
  	"version_accent_color" varchar DEFAULT '#6c5ce7',
  	"version_sort_order" numeric DEFAULT 0,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "enum__content_modules_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"latest" boolean
  );
  
  CREATE TABLE "content_categories" (
  	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  	"module_id" uuid,
  	"label" varchar,
  	"slug" varchar,
  	"item_type" varchar,
  	"source_key" varchar,
  	"sort_order" numeric DEFAULT 0,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"_status" "enum_content_categories_status" DEFAULT 'draft'
  );
  
  CREATE TABLE "_content_categories_v" (
  	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  	"parent_id" uuid,
  	"version_module_id" uuid,
  	"version_label" varchar,
  	"version_slug" varchar,
  	"version_item_type" varchar,
  	"version_source_key" varchar,
  	"version_sort_order" numeric DEFAULT 0,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "enum__content_categories_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"latest" boolean
  );
  
  CREATE TABLE "content_items_tags" (
  	"_order" integer NOT NULL,
  	"_parent_id" uuid NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"tag" varchar
  );
  
  CREATE TABLE "content_items" (
  	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  	"module_id" uuid,
  	"category_id" uuid,
  	"title" varchar,
  	"slug" varchar,
  	"item_type" "enum_content_items_item_type",
  	"summary" varchar,
  	"difficulty" "enum_content_items_difficulty",
  	"company" varchar,
  	"editorial_notes" jsonb,
  	"source" jsonb,
  	"source_key" varchar,
  	"sort_order" numeric DEFAULT 0,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"_status" "enum_content_items_status" DEFAULT 'draft'
  );
  
  CREATE TABLE "_content_items_v_version_tags" (
  	"_order" integer NOT NULL,
  	"_parent_id" uuid NOT NULL,
  	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  	"tag" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_content_items_v" (
  	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  	"parent_id" uuid,
  	"version_module_id" uuid,
  	"version_category_id" uuid,
  	"version_title" varchar,
  	"version_slug" varchar,
  	"version_item_type" "enum__content_items_v_version_item_type",
  	"version_summary" varchar,
  	"version_difficulty" "enum__content_items_v_version_difficulty",
  	"version_company" varchar,
  	"version_editorial_notes" jsonb,
  	"version_source" jsonb,
  	"version_source_key" varchar,
  	"version_sort_order" numeric DEFAULT 0,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "enum__content_items_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"latest" boolean
  );
  
  CREATE TABLE "media" (
  	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  	"alt" varchar NOT NULL,
  	"caption" varchar,
  	"prefix" varchar DEFAULT 'media',
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"url" varchar,
  	"thumbnail_u_r_l" varchar,
  	"filename" varchar,
  	"mime_type" varchar,
  	"filesize" numeric,
  	"width" numeric,
  	"height" numeric,
  	"focal_x" numeric,
  	"focal_y" numeric
  );
  
  CREATE TABLE "payload_kv" (
  	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  	"key" varchar NOT NULL,
  	"data" jsonb NOT NULL
  );
  
  CREATE TABLE "payload_locked_documents" (
  	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  	"global_slug" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "payload_locked_documents_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" uuid NOT NULL,
  	"path" varchar NOT NULL,
  	"users_id" uuid,
  	"activities_id" uuid,
  	"activity_registrations_id" uuid,
  	"works_id" uuid,
  	"content_modules_id" uuid,
  	"content_categories_id" uuid,
  	"content_items_id" uuid,
  	"media_id" uuid
  );
  
  CREATE TABLE "payload_preferences" (
  	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  	"key" varchar,
  	"value" jsonb,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "payload_preferences_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" uuid NOT NULL,
  	"path" varchar NOT NULL,
  	"users_id" uuid
  );
  
  CREATE TABLE "payload_migrations" (
  	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  	"name" varchar,
  	"batch" numeric,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "site_settings_contact_about_cards" (
  	"_order" integer NOT NULL,
  	"_parent_id" uuid NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"number_label" varchar,
  	"title" varchar NOT NULL,
  	"description" varchar NOT NULL
  );
  
  CREATE TABLE "site_settings_contact_repositories" (
  	"_order" integer NOT NULL,
  	"_parent_id" uuid NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"description" varchar NOT NULL,
  	"open_issues" numeric NOT NULL,
  	"repository_u_r_l" varchar
  );
  
  CREATE TABLE "site_settings_contact_join_steps" (
  	"_order" integer NOT NULL,
  	"_parent_id" uuid NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"number_label" varchar,
  	"title" varchar NOT NULL,
  	"description" varchar NOT NULL
  );
  
  CREATE TABLE "site_settings_contact_steps" (
  	"_order" integer NOT NULL,
  	"_parent_id" uuid NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"number_label" varchar,
  	"title" varchar NOT NULL,
  	"description" varchar NOT NULL
  );
  
  CREATE TABLE "site_settings" (
  	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  	"site_name" varchar DEFAULT 'About AI' NOT NULL,
  	"hero_title" varchar DEFAULT 'AI 探索者社区' NOT NULL,
  	"hero_slogan" varchar DEFAULT '一起学习 AI，一起把灵感做成作品。' NOT NULL,
  	"hero_description" varchar DEFAULT '面向 AI 学习者、产品人、设计师与开发者的开放社区。' NOT NULL,
  	"contact_content_version" numeric DEFAULT 0,
  	"contact_eyebrow" varchar DEFAULT 'CONTACT US',
  	"contact_title" varchar DEFAULT '联系我们',
  	"contact_intro" varchar DEFAULT '从上到下了解我们、Github 小组与二维码联系入口。',
  	"contact_mission_label" varchar DEFAULT '我们的使命',
  	"contact_mission" varchar DEFAULT '让复杂的 AI 知识更易理解，让学习成果真正变成作品。',
  	"contact_about_title" varchar DEFAULT '介绍我们',
  	"contact_github_title" varchar DEFAULT 'Github 小组',
  	"contact_github_intro" varchar DEFAULT '查看正在共建的项目，并了解如何通过 Issue 与 PR 参与协作。',
  	"contact_repositories_title" varchar DEFAULT '正在共建',
  	"contact_join_title" varchar DEFAULT '如何加入',
  	"contact_open_issues_label" varchar DEFAULT 'open issues',
  	"contact_repository_meta_label" varchar DEFAULT '仓库信息',
  	"contact_q_r_section_title" varchar DEFAULT '二维码',
  	"contact_q_r_intro" varchar DEFAULT '扫码加入社区，获取学习讨论、热门活动与共建信息。',
  	"contact_q_r_title" varchar DEFAULT '与我们建立联系',
  	"contact_q_r_description" varchar DEFAULT '你可以通过二维码加入社区，参与学习讨论、热门活动、作品展示与 Github 共建。',
  	"contact_q_r_code_id" uuid,
  	"contact_q_r_label" varchar DEFAULT '二维码占位',
  	"contact_q_r_note" varchar DEFAULT '上线前替换为正式社群二维码',
  	"footer_text" varchar DEFAULT '© 2026 · 由 AI 创造者社区发起' NOT NULL,
  	"contact_email" varchar DEFAULT 'hello@about-ai.local',
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  ALTER TABLE "users_sessions" ADD CONSTRAINT "users_sessions_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "activities" ADD CONSTRAINT "activities_cover_id_media_id_fk" FOREIGN KEY ("cover_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_activities_v" ADD CONSTRAINT "_activities_v_parent_id_activities_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."activities"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_activities_v" ADD CONSTRAINT "_activities_v_version_cover_id_media_id_fk" FOREIGN KEY ("version_cover_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "activity_registrations" ADD CONSTRAINT "activity_registrations_activity_id_activities_id_fk" FOREIGN KEY ("activity_id") REFERENCES "public"."activities"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "activity_registrations" ADD CONSTRAINT "activity_registrations_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "works" ADD CONSTRAINT "works_cover_id_media_id_fk" FOREIGN KEY ("cover_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_works_v" ADD CONSTRAINT "_works_v_parent_id_works_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."works"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_works_v" ADD CONSTRAINT "_works_v_version_cover_id_media_id_fk" FOREIGN KEY ("version_cover_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_content_modules_v" ADD CONSTRAINT "_content_modules_v_parent_id_content_modules_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."content_modules"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "content_categories" ADD CONSTRAINT "content_categories_module_id_content_modules_id_fk" FOREIGN KEY ("module_id") REFERENCES "public"."content_modules"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_content_categories_v" ADD CONSTRAINT "_content_categories_v_parent_id_content_categories_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."content_categories"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_content_categories_v" ADD CONSTRAINT "_content_categories_v_version_module_id_content_modules_id_fk" FOREIGN KEY ("version_module_id") REFERENCES "public"."content_modules"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "content_items_tags" ADD CONSTRAINT "content_items_tags_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."content_items"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "content_items" ADD CONSTRAINT "content_items_module_id_content_modules_id_fk" FOREIGN KEY ("module_id") REFERENCES "public"."content_modules"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "content_items" ADD CONSTRAINT "content_items_category_id_content_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."content_categories"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_content_items_v_version_tags" ADD CONSTRAINT "_content_items_v_version_tags_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_content_items_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_content_items_v" ADD CONSTRAINT "_content_items_v_parent_id_content_items_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."content_items"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_content_items_v" ADD CONSTRAINT "_content_items_v_version_module_id_content_modules_id_fk" FOREIGN KEY ("version_module_id") REFERENCES "public"."content_modules"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_content_items_v" ADD CONSTRAINT "_content_items_v_version_category_id_content_categories_id_fk" FOREIGN KEY ("version_category_id") REFERENCES "public"."content_categories"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."payload_locked_documents"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_activities_fk" FOREIGN KEY ("activities_id") REFERENCES "public"."activities"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_activity_registrations_fk" FOREIGN KEY ("activity_registrations_id") REFERENCES "public"."activity_registrations"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_works_fk" FOREIGN KEY ("works_id") REFERENCES "public"."works"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_content_modules_fk" FOREIGN KEY ("content_modules_id") REFERENCES "public"."content_modules"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_content_categories_fk" FOREIGN KEY ("content_categories_id") REFERENCES "public"."content_categories"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_content_items_fk" FOREIGN KEY ("content_items_id") REFERENCES "public"."content_items"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_media_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_preferences_rels" ADD CONSTRAINT "payload_preferences_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."payload_preferences"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_preferences_rels" ADD CONSTRAINT "payload_preferences_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "site_settings_contact_about_cards" ADD CONSTRAINT "site_settings_contact_about_cards_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."site_settings"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "site_settings_contact_repositories" ADD CONSTRAINT "site_settings_contact_repositories_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."site_settings"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "site_settings_contact_join_steps" ADD CONSTRAINT "site_settings_contact_join_steps_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."site_settings"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "site_settings_contact_steps" ADD CONSTRAINT "site_settings_contact_steps_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."site_settings"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "site_settings" ADD CONSTRAINT "site_settings_contact_q_r_code_id_media_id_fk" FOREIGN KEY ("contact_q_r_code_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "users_sessions_order_idx" ON "users_sessions" USING btree ("_order");
  CREATE INDEX "users_sessions_parent_id_idx" ON "users_sessions" USING btree ("_parent_id");
  CREATE INDEX "users_updated_at_idx" ON "users" USING btree ("updated_at");
  CREATE INDEX "users_created_at_idx" ON "users" USING btree ("created_at");
  CREATE UNIQUE INDEX "users_email_idx" ON "users" USING btree ("email");
  CREATE UNIQUE INDEX "activities_slug_idx" ON "activities" USING btree ("slug");
  CREATE INDEX "activities_sort_order_idx" ON "activities" USING btree ("sort_order");
  CREATE INDEX "activities_cover_idx" ON "activities" USING btree ("cover_id");
  CREATE INDEX "activities_updated_at_idx" ON "activities" USING btree ("updated_at");
  CREATE INDEX "activities_created_at_idx" ON "activities" USING btree ("created_at");
  CREATE INDEX "activities__status_idx" ON "activities" USING btree ("_status");
  CREATE INDEX "_activities_v_parent_idx" ON "_activities_v" USING btree ("parent_id");
  CREATE INDEX "_activities_v_version_version_slug_idx" ON "_activities_v" USING btree ("version_slug");
  CREATE INDEX "_activities_v_version_version_sort_order_idx" ON "_activities_v" USING btree ("version_sort_order");
  CREATE INDEX "_activities_v_version_version_cover_idx" ON "_activities_v" USING btree ("version_cover_id");
  CREATE INDEX "_activities_v_version_version_updated_at_idx" ON "_activities_v" USING btree ("version_updated_at");
  CREATE INDEX "_activities_v_version_version_created_at_idx" ON "_activities_v" USING btree ("version_created_at");
  CREATE INDEX "_activities_v_version_version__status_idx" ON "_activities_v" USING btree ("version__status");
  CREATE INDEX "_activities_v_created_at_idx" ON "_activities_v" USING btree ("created_at");
  CREATE INDEX "_activities_v_updated_at_idx" ON "_activities_v" USING btree ("updated_at");
  CREATE INDEX "_activities_v_latest_idx" ON "_activities_v" USING btree ("latest");
  CREATE INDEX "activity_registrations_activity_idx" ON "activity_registrations" USING btree ("activity_id");
  CREATE INDEX "activity_registrations_user_idx" ON "activity_registrations" USING btree ("user_id");
  CREATE INDEX "activity_registrations_status_idx" ON "activity_registrations" USING btree ("status");
  CREATE INDEX "activity_registrations_updated_at_idx" ON "activity_registrations" USING btree ("updated_at");
  CREATE INDEX "activity_registrations_created_at_idx" ON "activity_registrations" USING btree ("created_at");
  CREATE UNIQUE INDEX "activity_user_idx" ON "activity_registrations" USING btree ("activity_id","user_id");
  CREATE UNIQUE INDEX "works_slug_idx" ON "works" USING btree ("slug");
  CREATE INDEX "works_sort_order_idx" ON "works" USING btree ("sort_order");
  CREATE INDEX "works_cover_idx" ON "works" USING btree ("cover_id");
  CREATE INDEX "works_updated_at_idx" ON "works" USING btree ("updated_at");
  CREATE INDEX "works_created_at_idx" ON "works" USING btree ("created_at");
  CREATE INDEX "works__status_idx" ON "works" USING btree ("_status");
  CREATE INDEX "_works_v_parent_idx" ON "_works_v" USING btree ("parent_id");
  CREATE INDEX "_works_v_version_version_slug_idx" ON "_works_v" USING btree ("version_slug");
  CREATE INDEX "_works_v_version_version_sort_order_idx" ON "_works_v" USING btree ("version_sort_order");
  CREATE INDEX "_works_v_version_version_cover_idx" ON "_works_v" USING btree ("version_cover_id");
  CREATE INDEX "_works_v_version_version_updated_at_idx" ON "_works_v" USING btree ("version_updated_at");
  CREATE INDEX "_works_v_version_version_created_at_idx" ON "_works_v" USING btree ("version_created_at");
  CREATE INDEX "_works_v_version_version__status_idx" ON "_works_v" USING btree ("version__status");
  CREATE INDEX "_works_v_created_at_idx" ON "_works_v" USING btree ("created_at");
  CREATE INDEX "_works_v_updated_at_idx" ON "_works_v" USING btree ("updated_at");
  CREATE INDEX "_works_v_latest_idx" ON "_works_v" USING btree ("latest");
  CREATE UNIQUE INDEX "content_modules_slug_idx" ON "content_modules" USING btree ("slug");
  CREATE INDEX "content_modules_sort_order_idx" ON "content_modules" USING btree ("sort_order");
  CREATE INDEX "content_modules_updated_at_idx" ON "content_modules" USING btree ("updated_at");
  CREATE INDEX "content_modules_created_at_idx" ON "content_modules" USING btree ("created_at");
  CREATE INDEX "content_modules__status_idx" ON "content_modules" USING btree ("_status");
  CREATE INDEX "_content_modules_v_parent_idx" ON "_content_modules_v" USING btree ("parent_id");
  CREATE INDEX "_content_modules_v_version_version_slug_idx" ON "_content_modules_v" USING btree ("version_slug");
  CREATE INDEX "_content_modules_v_version_version_sort_order_idx" ON "_content_modules_v" USING btree ("version_sort_order");
  CREATE INDEX "_content_modules_v_version_version_updated_at_idx" ON "_content_modules_v" USING btree ("version_updated_at");
  CREATE INDEX "_content_modules_v_version_version_created_at_idx" ON "_content_modules_v" USING btree ("version_created_at");
  CREATE INDEX "_content_modules_v_version_version__status_idx" ON "_content_modules_v" USING btree ("version__status");
  CREATE INDEX "_content_modules_v_created_at_idx" ON "_content_modules_v" USING btree ("created_at");
  CREATE INDEX "_content_modules_v_updated_at_idx" ON "_content_modules_v" USING btree ("updated_at");
  CREATE INDEX "_content_modules_v_latest_idx" ON "_content_modules_v" USING btree ("latest");
  CREATE INDEX "content_categories_module_idx" ON "content_categories" USING btree ("module_id");
  CREATE INDEX "content_categories_slug_idx" ON "content_categories" USING btree ("slug");
  CREATE INDEX "content_categories_item_type_idx" ON "content_categories" USING btree ("item_type");
  CREATE UNIQUE INDEX "content_categories_source_key_idx" ON "content_categories" USING btree ("source_key");
  CREATE INDEX "content_categories_sort_order_idx" ON "content_categories" USING btree ("sort_order");
  CREATE INDEX "content_categories_updated_at_idx" ON "content_categories" USING btree ("updated_at");
  CREATE INDEX "content_categories_created_at_idx" ON "content_categories" USING btree ("created_at");
  CREATE INDEX "content_categories__status_idx" ON "content_categories" USING btree ("_status");
  CREATE INDEX "_content_categories_v_parent_idx" ON "_content_categories_v" USING btree ("parent_id");
  CREATE INDEX "_content_categories_v_version_version_module_idx" ON "_content_categories_v" USING btree ("version_module_id");
  CREATE INDEX "_content_categories_v_version_version_slug_idx" ON "_content_categories_v" USING btree ("version_slug");
  CREATE INDEX "_content_categories_v_version_version_item_type_idx" ON "_content_categories_v" USING btree ("version_item_type");
  CREATE INDEX "_content_categories_v_version_version_source_key_idx" ON "_content_categories_v" USING btree ("version_source_key");
  CREATE INDEX "_content_categories_v_version_version_sort_order_idx" ON "_content_categories_v" USING btree ("version_sort_order");
  CREATE INDEX "_content_categories_v_version_version_updated_at_idx" ON "_content_categories_v" USING btree ("version_updated_at");
  CREATE INDEX "_content_categories_v_version_version_created_at_idx" ON "_content_categories_v" USING btree ("version_created_at");
  CREATE INDEX "_content_categories_v_version_version__status_idx" ON "_content_categories_v" USING btree ("version__status");
  CREATE INDEX "_content_categories_v_created_at_idx" ON "_content_categories_v" USING btree ("created_at");
  CREATE INDEX "_content_categories_v_updated_at_idx" ON "_content_categories_v" USING btree ("updated_at");
  CREATE INDEX "_content_categories_v_latest_idx" ON "_content_categories_v" USING btree ("latest");
  CREATE INDEX "content_items_tags_order_idx" ON "content_items_tags" USING btree ("_order");
  CREATE INDEX "content_items_tags_parent_id_idx" ON "content_items_tags" USING btree ("_parent_id");
  CREATE INDEX "content_items_module_idx" ON "content_items" USING btree ("module_id");
  CREATE INDEX "content_items_category_idx" ON "content_items" USING btree ("category_id");
  CREATE INDEX "content_items_slug_idx" ON "content_items" USING btree ("slug");
  CREATE INDEX "content_items_item_type_idx" ON "content_items" USING btree ("item_type");
  CREATE UNIQUE INDEX "content_items_source_key_idx" ON "content_items" USING btree ("source_key");
  CREATE INDEX "content_items_sort_order_idx" ON "content_items" USING btree ("sort_order");
  CREATE INDEX "content_items_updated_at_idx" ON "content_items" USING btree ("updated_at");
  CREATE INDEX "content_items_created_at_idx" ON "content_items" USING btree ("created_at");
  CREATE INDEX "content_items__status_idx" ON "content_items" USING btree ("_status");
  CREATE INDEX "_content_items_v_version_tags_order_idx" ON "_content_items_v_version_tags" USING btree ("_order");
  CREATE INDEX "_content_items_v_version_tags_parent_id_idx" ON "_content_items_v_version_tags" USING btree ("_parent_id");
  CREATE INDEX "_content_items_v_parent_idx" ON "_content_items_v" USING btree ("parent_id");
  CREATE INDEX "_content_items_v_version_version_module_idx" ON "_content_items_v" USING btree ("version_module_id");
  CREATE INDEX "_content_items_v_version_version_category_idx" ON "_content_items_v" USING btree ("version_category_id");
  CREATE INDEX "_content_items_v_version_version_slug_idx" ON "_content_items_v" USING btree ("version_slug");
  CREATE INDEX "_content_items_v_version_version_item_type_idx" ON "_content_items_v" USING btree ("version_item_type");
  CREATE INDEX "_content_items_v_version_version_source_key_idx" ON "_content_items_v" USING btree ("version_source_key");
  CREATE INDEX "_content_items_v_version_version_sort_order_idx" ON "_content_items_v" USING btree ("version_sort_order");
  CREATE INDEX "_content_items_v_version_version_updated_at_idx" ON "_content_items_v" USING btree ("version_updated_at");
  CREATE INDEX "_content_items_v_version_version_created_at_idx" ON "_content_items_v" USING btree ("version_created_at");
  CREATE INDEX "_content_items_v_version_version__status_idx" ON "_content_items_v" USING btree ("version__status");
  CREATE INDEX "_content_items_v_created_at_idx" ON "_content_items_v" USING btree ("created_at");
  CREATE INDEX "_content_items_v_updated_at_idx" ON "_content_items_v" USING btree ("updated_at");
  CREATE INDEX "_content_items_v_latest_idx" ON "_content_items_v" USING btree ("latest");
  CREATE INDEX "media_updated_at_idx" ON "media" USING btree ("updated_at");
  CREATE INDEX "media_created_at_idx" ON "media" USING btree ("created_at");
  CREATE UNIQUE INDEX "media_filename_idx" ON "media" USING btree ("filename");
  CREATE UNIQUE INDEX "payload_kv_key_idx" ON "payload_kv" USING btree ("key");
  CREATE INDEX "payload_locked_documents_global_slug_idx" ON "payload_locked_documents" USING btree ("global_slug");
  CREATE INDEX "payload_locked_documents_updated_at_idx" ON "payload_locked_documents" USING btree ("updated_at");
  CREATE INDEX "payload_locked_documents_created_at_idx" ON "payload_locked_documents" USING btree ("created_at");
  CREATE INDEX "payload_locked_documents_rels_order_idx" ON "payload_locked_documents_rels" USING btree ("order");
  CREATE INDEX "payload_locked_documents_rels_parent_idx" ON "payload_locked_documents_rels" USING btree ("parent_id");
  CREATE INDEX "payload_locked_documents_rels_path_idx" ON "payload_locked_documents_rels" USING btree ("path");
  CREATE INDEX "payload_locked_documents_rels_users_id_idx" ON "payload_locked_documents_rels" USING btree ("users_id");
  CREATE INDEX "payload_locked_documents_rels_activities_id_idx" ON "payload_locked_documents_rels" USING btree ("activities_id");
  CREATE INDEX "payload_locked_documents_rels_activity_registrations_id_idx" ON "payload_locked_documents_rels" USING btree ("activity_registrations_id");
  CREATE INDEX "payload_locked_documents_rels_works_id_idx" ON "payload_locked_documents_rels" USING btree ("works_id");
  CREATE INDEX "payload_locked_documents_rels_content_modules_id_idx" ON "payload_locked_documents_rels" USING btree ("content_modules_id");
  CREATE INDEX "payload_locked_documents_rels_content_categories_id_idx" ON "payload_locked_documents_rels" USING btree ("content_categories_id");
  CREATE INDEX "payload_locked_documents_rels_content_items_id_idx" ON "payload_locked_documents_rels" USING btree ("content_items_id");
  CREATE INDEX "payload_locked_documents_rels_media_id_idx" ON "payload_locked_documents_rels" USING btree ("media_id");
  CREATE INDEX "payload_preferences_key_idx" ON "payload_preferences" USING btree ("key");
  CREATE INDEX "payload_preferences_updated_at_idx" ON "payload_preferences" USING btree ("updated_at");
  CREATE INDEX "payload_preferences_created_at_idx" ON "payload_preferences" USING btree ("created_at");
  CREATE INDEX "payload_preferences_rels_order_idx" ON "payload_preferences_rels" USING btree ("order");
  CREATE INDEX "payload_preferences_rels_parent_idx" ON "payload_preferences_rels" USING btree ("parent_id");
  CREATE INDEX "payload_preferences_rels_path_idx" ON "payload_preferences_rels" USING btree ("path");
  CREATE INDEX "payload_preferences_rels_users_id_idx" ON "payload_preferences_rels" USING btree ("users_id");
  CREATE INDEX "payload_migrations_updated_at_idx" ON "payload_migrations" USING btree ("updated_at");
  CREATE INDEX "payload_migrations_created_at_idx" ON "payload_migrations" USING btree ("created_at");
  CREATE INDEX "site_settings_contact_about_cards_order_idx" ON "site_settings_contact_about_cards" USING btree ("_order");
  CREATE INDEX "site_settings_contact_about_cards_parent_id_idx" ON "site_settings_contact_about_cards" USING btree ("_parent_id");
  CREATE INDEX "site_settings_contact_repositories_order_idx" ON "site_settings_contact_repositories" USING btree ("_order");
  CREATE INDEX "site_settings_contact_repositories_parent_id_idx" ON "site_settings_contact_repositories" USING btree ("_parent_id");
  CREATE INDEX "site_settings_contact_join_steps_order_idx" ON "site_settings_contact_join_steps" USING btree ("_order");
  CREATE INDEX "site_settings_contact_join_steps_parent_id_idx" ON "site_settings_contact_join_steps" USING btree ("_parent_id");
  CREATE INDEX "site_settings_contact_steps_order_idx" ON "site_settings_contact_steps" USING btree ("_order");
  CREATE INDEX "site_settings_contact_steps_parent_id_idx" ON "site_settings_contact_steps" USING btree ("_parent_id");
  CREATE INDEX "site_settings_contact_q_r_code_idx" ON "site_settings" USING btree ("contact_q_r_code_id");`)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "users_sessions" CASCADE;
  DROP TABLE "users" CASCADE;
  DROP TABLE "activities" CASCADE;
  DROP TABLE "_activities_v" CASCADE;
  DROP TABLE "activity_registrations" CASCADE;
  DROP TABLE "works" CASCADE;
  DROP TABLE "_works_v" CASCADE;
  DROP TABLE "content_modules" CASCADE;
  DROP TABLE "_content_modules_v" CASCADE;
  DROP TABLE "content_categories" CASCADE;
  DROP TABLE "_content_categories_v" CASCADE;
  DROP TABLE "content_items_tags" CASCADE;
  DROP TABLE "content_items" CASCADE;
  DROP TABLE "_content_items_v_version_tags" CASCADE;
  DROP TABLE "_content_items_v" CASCADE;
  DROP TABLE "media" CASCADE;
  DROP TABLE "payload_kv" CASCADE;
  DROP TABLE "payload_locked_documents" CASCADE;
  DROP TABLE "payload_locked_documents_rels" CASCADE;
  DROP TABLE "payload_preferences" CASCADE;
  DROP TABLE "payload_preferences_rels" CASCADE;
  DROP TABLE "payload_migrations" CASCADE;
  DROP TABLE "site_settings_contact_about_cards" CASCADE;
  DROP TABLE "site_settings_contact_repositories" CASCADE;
  DROP TABLE "site_settings_contact_join_steps" CASCADE;
  DROP TABLE "site_settings_contact_steps" CASCADE;
  DROP TABLE "site_settings" CASCADE;
  DROP TYPE "public"."enum_users_role";
  DROP TYPE "public"."enum_users_account_status";
  DROP TYPE "public"."enum_activities_activity_status";
  DROP TYPE "public"."enum_activities_registration_mode";
  DROP TYPE "public"."enum_activities_status";
  DROP TYPE "public"."enum__activities_v_version_activity_status";
  DROP TYPE "public"."enum__activities_v_version_registration_mode";
  DROP TYPE "public"."enum__activities_v_version_status";
  DROP TYPE "public"."enum_activity_registrations_status";
  DROP TYPE "public"."enum_works_status";
  DROP TYPE "public"."enum__works_v_version_status";
  DROP TYPE "public"."enum_content_modules_status";
  DROP TYPE "public"."enum__content_modules_v_version_status";
  DROP TYPE "public"."enum_content_categories_status";
  DROP TYPE "public"."enum__content_categories_v_version_status";
  DROP TYPE "public"."enum_content_items_item_type";
  DROP TYPE "public"."enum_content_items_difficulty";
  DROP TYPE "public"."enum_content_items_status";
  DROP TYPE "public"."enum__content_items_v_version_item_type";
  DROP TYPE "public"."enum__content_items_v_version_difficulty";
  DROP TYPE "public"."enum__content_items_v_version_status";`)
}
