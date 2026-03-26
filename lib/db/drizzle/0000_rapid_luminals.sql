CREATE TABLE "hustler_applications" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"title" text NOT NULL,
	"company" text NOT NULL,
	"city" text,
	"country" text,
	"sector" text,
	"bio" text NOT NULL,
	"linkedin" text NOT NULL,
	"quote" text,
	"impact" text,
	"ai_score" integer,
	"ai_status" text,
	"ai_reasoning" text,
	"ai_checklist" jsonb,
	"editorial_status" text DEFAULT 'pending' NOT NULL,
	"editor_notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"reviewed_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "newsletter_subscribers" (
	"id" serial PRIMARY KEY NOT NULL,
	"email" text NOT NULL,
	"source" text DEFAULT 'share_gate' NOT NULL,
	"poll_id" integer,
	"country_code" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "newsletter_subscribers_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "poll_options" (
	"id" serial PRIMARY KEY NOT NULL,
	"poll_id" integer NOT NULL,
	"text" text NOT NULL,
	"vote_count" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "poll_snapshots" (
	"id" serial PRIMARY KEY NOT NULL,
	"poll_id" integer NOT NULL,
	"option_id" integer NOT NULL,
	"snapshot_date" timestamp NOT NULL,
	"percentage" real DEFAULT 0 NOT NULL,
	"vote_count" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "polls" (
	"id" serial PRIMARY KEY NOT NULL,
	"question" text NOT NULL,
	"context" text,
	"category" text NOT NULL,
	"category_slug" text NOT NULL,
	"tags" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"poll_type" text DEFAULT 'binary' NOT NULL,
	"is_featured" boolean DEFAULT false NOT NULL,
	"is_editors_pick" boolean DEFAULT false NOT NULL,
	"editorial_status" text DEFAULT 'approved' NOT NULL,
	"ends_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"related_profile_ids" jsonb DEFAULT '[]'::jsonb NOT NULL
);
--> statement-breakpoint
CREATE TABLE "votes" (
	"id" serial PRIMARY KEY NOT NULL,
	"poll_id" integer NOT NULL,
	"option_id" integer NOT NULL,
	"voter_token" text NOT NULL,
	"country_code" text,
	"country_name" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "profiles" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"headline" text NOT NULL,
	"role" text NOT NULL,
	"company" text,
	"company_url" text,
	"sector" text NOT NULL,
	"country" text NOT NULL,
	"city" text NOT NULL,
	"image_url" text,
	"summary" text NOT NULL,
	"story" text NOT NULL,
	"lessons_learned" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"quote" text NOT NULL,
	"impact_statement" text,
	"is_featured" boolean DEFAULT false NOT NULL,
	"is_verified" boolean DEFAULT false NOT NULL,
	"view_count" integer DEFAULT 0 NOT NULL,
	"associated_poll_count" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "majlis_channel_members" (
	"id" serial PRIMARY KEY NOT NULL,
	"channel_id" integer NOT NULL,
	"user_id" integer NOT NULL,
	"last_read_message_id" integer,
	"joined_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "majlis_channels" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"type" text DEFAULT 'group' NOT NULL,
	"created_by" integer,
	"is_default" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "majlis_invites" (
	"id" serial PRIMARY KEY NOT NULL,
	"profile_id" integer NOT NULL,
	"token" text NOT NULL,
	"email" text NOT NULL,
	"is_used" boolean DEFAULT false NOT NULL,
	"expires_at" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "majlis_invites_token_unique" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE "majlis_messages" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"channel_id" integer,
	"content" text NOT NULL,
	"reply_to_id" integer,
	"is_edited" boolean DEFAULT false NOT NULL,
	"is_deleted" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"edited_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "majlis_users" (
	"id" serial PRIMARY KEY NOT NULL,
	"profile_id" integer NOT NULL,
	"email" text NOT NULL,
	"password_hash" text NOT NULL,
	"display_name" text NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"is_banned" boolean DEFAULT false NOT NULL,
	"is_muted" boolean DEFAULT false NOT NULL,
	"last_seen_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "majlis_users_profile_id_unique" UNIQUE("profile_id"),
	CONSTRAINT "majlis_users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "predictions" (
	"id" serial PRIMARY KEY NOT NULL,
	"question" text NOT NULL,
	"category" text NOT NULL,
	"category_slug" text NOT NULL,
	"resolves_at" text,
	"yes_percentage" integer DEFAULT 50 NOT NULL,
	"no_percentage" integer DEFAULT 50 NOT NULL,
	"total_count" integer DEFAULT 0 NOT NULL,
	"momentum" real DEFAULT 0 NOT NULL,
	"momentum_direction" text DEFAULT 'up' NOT NULL,
	"trend_data" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"card_layout" text DEFAULT 'grid' NOT NULL,
	"editorial_status" text DEFAULT 'draft' NOT NULL,
	"is_featured" boolean DEFAULT false NOT NULL,
	"tags" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "prediction_votes" (
	"id" serial PRIMARY KEY NOT NULL,
	"prediction_id" integer NOT NULL,
	"choice" text NOT NULL,
	"voter_token" text NOT NULL,
	"country" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "pulse_topics" (
	"id" serial PRIMARY KEY NOT NULL,
	"topic_id" text NOT NULL,
	"tag" text NOT NULL,
	"tag_color" text DEFAULT '#DC143C' NOT NULL,
	"title" text NOT NULL,
	"stat" text NOT NULL,
	"delta" text NOT NULL,
	"delta_up" boolean DEFAULT true NOT NULL,
	"blurb" text NOT NULL,
	"source" text NOT NULL,
	"spark_data" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"live_config" jsonb DEFAULT 'null'::jsonb,
	"sort_order" serial NOT NULL,
	"editorial_status" text DEFAULT 'approved' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "pulse_topics_topic_id_unique" UNIQUE("topic_id")
);
--> statement-breakpoint
CREATE TABLE "cms_configs" (
	"id" serial PRIMARY KEY NOT NULL,
	"key" text NOT NULL,
	"value" jsonb NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "cms_configs_key_unique" UNIQUE("key")
);
--> statement-breakpoint
CREATE TABLE "design_tokens" (
	"id" serial PRIMARY KEY NOT NULL,
	"token_type" text DEFAULT 'color' NOT NULL,
	"name" text NOT NULL,
	"label" text NOT NULL,
	"value" text NOT NULL,
	"category" text,
	"sort_order" serial NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "design_tokens_name_unique" UNIQUE("name")
);
--> statement-breakpoint
ALTER TABLE "majlis_channel_members" ADD CONSTRAINT "majlis_channel_members_channel_id_majlis_channels_id_fk" FOREIGN KEY ("channel_id") REFERENCES "public"."majlis_channels"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "majlis_channel_members" ADD CONSTRAINT "majlis_channel_members_user_id_majlis_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."majlis_users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "majlis_channels" ADD CONSTRAINT "majlis_channels_created_by_majlis_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."majlis_users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "majlis_invites" ADD CONSTRAINT "majlis_invites_profile_id_profiles_id_fk" FOREIGN KEY ("profile_id") REFERENCES "public"."profiles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "majlis_messages" ADD CONSTRAINT "majlis_messages_user_id_majlis_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."majlis_users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "majlis_messages" ADD CONSTRAINT "majlis_messages_channel_id_majlis_channels_id_fk" FOREIGN KEY ("channel_id") REFERENCES "public"."majlis_channels"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "majlis_users" ADD CONSTRAINT "majlis_users_profile_id_profiles_id_fk" FOREIGN KEY ("profile_id") REFERENCES "public"."profiles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "prediction_votes" ADD CONSTRAINT "prediction_votes_prediction_id_predictions_id_fk" FOREIGN KEY ("prediction_id") REFERENCES "public"."predictions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "votes_poll_voter_unique" ON "votes" USING btree ("poll_id","voter_token");