-- Aivo Platform Comprehensive Schema Migration
-- Phase 1: Core foundation and Phase 1 features
-- This migration creates the complete database structure

-- Enable UUID extension for CUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ================================
-- TENANT AND ORGANIZATION TABLES
-- ================================

-- Tenants (top-level organizations)
CREATE TABLE "tenants" (
    "id" TEXT NOT NULL PRIMARY KEY DEFAULT gen_random_uuid()::text,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL UNIQUE,
    "domain" TEXT UNIQUE,
    "region" TEXT NOT NULL,
    "timezone" TEXT NOT NULL DEFAULT 'UTC',
    "settings" JSONB,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" TIMESTAMP(3)
);

-- Districts within tenants
CREATE TABLE "districts" (
    "id" TEXT NOT NULL PRIMARY KEY DEFAULT gen_random_uuid()::text,
    "tenant_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT UNIQUE,
    "address" JSONB,
    "contact_info" JSONB,
    "settings" JSONB,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" TIMESTAMP(3),
    FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE
);

-- Schools within districts
CREATE TABLE "schools" (
    "id" TEXT NOT NULL PRIMARY KEY DEFAULT gen_random_uuid()::text,
    "tenant_id" TEXT NOT NULL,
    "district_id" TEXT,
    "name" TEXT NOT NULL,
    "code" TEXT UNIQUE,
    "type" TEXT NOT NULL,
    "address" JSONB,
    "contact_info" JSONB,
    "settings" JSONB,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" TIMESTAMP(3),
    FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE,
    FOREIGN KEY ("district_id") REFERENCES "districts"("id") ON DELETE SET NULL
);

-- Classrooms within schools
CREATE TABLE "classrooms" (
    "id" TEXT NOT NULL PRIMARY KEY DEFAULT gen_random_uuid()::text,
    "school_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "grade_level" TEXT NOT NULL,
    "subject" TEXT,
    "capacity" INTEGER NOT NULL DEFAULT 30,
    "settings" JSONB,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" TIMESTAMP(3),
    FOREIGN KEY ("school_id") REFERENCES "schools"("id") ON DELETE CASCADE
);

-- ================================
-- USER MANAGEMENT TABLES
-- ================================

-- Main users table with multi-role support
CREATE TABLE "users" (
    "id" TEXT NOT NULL PRIMARY KEY DEFAULT gen_random_uuid()::text,
    "tenant_id" TEXT NOT NULL,
    "email" TEXT UNIQUE,
    "phone_number" TEXT UNIQUE,
    "first_name" TEXT NOT NULL,
    "last_name" TEXT NOT NULL,
    "display_name" TEXT,
    "avatar" TEXT,
    "role" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'active',
    "last_login_at" TIMESTAMP(3),
    "email_verified" BOOLEAN NOT NULL DEFAULT false,
    "phone_verified" BOOLEAN NOT NULL DEFAULT false,
    
    -- MFA settings
    "mfa_enabled" BOOLEAN NOT NULL DEFAULT false,
    "mfa_secret" TEXT,
    "backup_codes" TEXT[],
    
    -- Profile information
    "date_of_birth" TIMESTAMP(3),
    "grade" TEXT,
    "disabilities" JSONB,
    
    -- IEP and special needs
    "has_iep" BOOLEAN NOT NULL DEFAULT false,
    "has_504_plan" BOOLEAN NOT NULL DEFAULT false,
    
    -- Learning preferences and accessibility
    "learning_style" JSONB,
    "accessibility" JSONB,
    
    -- Focus baseline metrics
    "focus_baseline" JSONB,
    
    -- Organizational relationships
    "district_id" TEXT,
    "school_id" TEXT,
    
    -- Audit fields
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" TIMESTAMP(3),
    
    FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE,
    FOREIGN KEY ("district_id") REFERENCES "districts"("id") ON DELETE SET NULL,
    FOREIGN KEY ("school_id") REFERENCES "schools"("id") ON DELETE SET NULL
);

-- Parent-student relationships
CREATE TABLE "parent_student_relations" (
    "id" TEXT NOT NULL PRIMARY KEY DEFAULT gen_random_uuid()::text,
    "parent_id" TEXT NOT NULL,
    "student_id" TEXT NOT NULL,
    "relationship" TEXT NOT NULL,
    "is_primary" BOOLEAN NOT NULL DEFAULT false,
    "is_emergency" BOOLEAN NOT NULL DEFAULT false,
    "can_pickup" BOOLEAN NOT NULL DEFAULT true,
    "receive_notifications" BOOLEAN NOT NULL DEFAULT true,
    "contact_method" TEXT NOT NULL DEFAULT 'email',
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE("parent_id", "student_id"),
    FOREIGN KEY ("parent_id") REFERENCES "users"("id") ON DELETE CASCADE,
    FOREIGN KEY ("student_id") REFERENCES "users"("id") ON DELETE CASCADE
);

-- User sessions for authentication
CREATE TABLE "user_sessions" (
    "id" TEXT NOT NULL PRIMARY KEY DEFAULT gen_random_uuid()::text,
    "user_id" TEXT NOT NULL,
    "session_token" TEXT NOT NULL UNIQUE,
    "refresh_token" TEXT UNIQUE,
    "device_id" TEXT,
    "ip_address" TEXT,
    "user_agent" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "last_activity_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE
);

-- Consent records for COPPA compliance
CREATE TABLE "consent_records" (
    "id" TEXT NOT NULL PRIMARY KEY DEFAULT gen_random_uuid()::text,
    "user_id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "granted" BOOLEAN NOT NULL,
    "granted_by" TEXT,
    "ip_address" TEXT,
    "user_agent" TEXT,
    "metadata" JSONB,
    "granted_at" TIMESTAMP(3) NOT NULL,
    "expires_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE
);

-- ================================
-- STUDENT PROFILE TABLES
-- ================================

-- Comprehensive student profiles
CREATE TABLE "student_profiles" (
    "id" TEXT NOT NULL PRIMARY KEY DEFAULT gen_random_uuid()::text,
    "user_id" TEXT NOT NULL UNIQUE,
    
    -- Demographics
    "grade_level" TEXT NOT NULL,
    "age_group" TEXT NOT NULL,
    
    -- Curriculum and academic
    "current_curriculum" TEXT,
    "primary_language" TEXT NOT NULL DEFAULT 'en',
    "secondary_languages" TEXT[],
    
    -- Disability and special needs
    "disability_types" TEXT[],
    "iep_active" BOOLEAN NOT NULL DEFAULT false,
    "plan_504_active" BOOLEAN NOT NULL DEFAULT false,
    
    -- IEP data storage
    "iep_goals" JSONB,
    "accommodations" JSONB,
    "modifications" JSONB,
    "services_required" JSONB,
    
    -- Learning preferences
    "learning_style" JSONB NOT NULL,
    "processing_speed" TEXT,
    "working_memory" TEXT,
    "attention_span" INTEGER,
    
    -- Accessibility settings
    "text_size" TEXT NOT NULL DEFAULT 'medium',
    "contrast" TEXT NOT NULL DEFAULT 'normal',
    "audio_support" BOOLEAN NOT NULL DEFAULT false,
    "visual_support" BOOLEAN NOT NULL DEFAULT false,
    "motor_support" BOOLEAN NOT NULL DEFAULT false,
    
    -- Focus baseline metrics
    "baseline_focus_score" DECIMAL(5,2),
    "optimal_session_length" INTEGER,
    "preferred_break_length" INTEGER,
    
    -- Behavioral patterns
    "best_focus_times" JSONB,
    "common_distractions" TEXT[],
    "motivators" TEXT[],
    
    -- Technology preferences
    "preferred_input_method" TEXT NOT NULL DEFAULT 'keyboard',
    "assistive_technology" JSONB,
    
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE
);

-- ================================
-- PHASE 1 FEATURE TABLES
-- ================================

-- Focus Guardian: Focus tracking sessions
CREATE TABLE "focus_sessions" (
    "id" TEXT NOT NULL PRIMARY KEY DEFAULT gen_random_uuid()::text,
    "student_id" TEXT NOT NULL,
    "teacher_id" TEXT,
    "subject" TEXT,
    "activity_type" TEXT NOT NULL,
    "duration" INTEGER NOT NULL,
    "actual_duration" INTEGER,
    "started_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ended_at" TIMESTAMP(3),
    "status" TEXT NOT NULL DEFAULT 'active',
    
    -- Focus metrics
    "focus_score" DECIMAL(5,2),
    "distraction_count" INTEGER NOT NULL DEFAULT 0,
    "attention_span" INTEGER,
    "fatigue_level" TEXT,
    
    -- Settings and consent
    "parental_consent" BOOLEAN NOT NULL DEFAULT false,
    "consented_by" TEXT,
    "monitoring_level" TEXT NOT NULL DEFAULT 'basic',
    "intervention_level" TEXT NOT NULL DEFAULT 'gentle',
    
    -- Analytics data
    "analytics" JSONB,
    "metadata" JSONB,
    
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY ("student_id") REFERENCES "users"("id") ON DELETE CASCADE,
    FOREIGN KEY ("teacher_id") REFERENCES "users"("id") ON DELETE SET NULL
);

-- Focus Guardian: Individual attention events
CREATE TABLE "focus_events" (
    "id" TEXT NOT NULL PRIMARY KEY DEFAULT gen_random_uuid()::text,
    "session_id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "severity" TEXT NOT NULL DEFAULT 'low',
    "confidence" DECIMAL(3,2) NOT NULL,
    
    -- Event data
    "description" TEXT,
    "duration" INTEGER,
    "triggers" TEXT[],
    "context" JSONB,
    
    -- Timestamps
    "detected_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "acknowledged_at" TIMESTAMP(3),
    "resolved_at" TIMESTAMP(3),
    
    -- Metadata
    "device_info" JSONB,
    "environment_data" JSONB,
    
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY ("session_id") REFERENCES "focus_sessions"("id") ON DELETE CASCADE
);

-- Focus Guardian: AI-powered interventions
CREATE TABLE "focus_interventions" (
    "id" TEXT NOT NULL PRIMARY KEY DEFAULT gen_random_uuid()::text,
    "session_id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "strategy" TEXT NOT NULL,
    
    -- Intervention details
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "content" JSONB,
    "duration" INTEGER,
    
    -- Execution
    "triggered_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "started_at" TIMESTAMP(3),
    "completed_at" TIMESTAMP(3),
    "skipped_at" TIMESTAMP(3),
    "effectiveness" TEXT,
    
    -- Student response
    "student_response" JSONB,
    "follow_up_needed" BOOLEAN NOT NULL DEFAULT false,
    
    -- Metadata
    "ai_generated" BOOLEAN NOT NULL DEFAULT true,
    "personalized_for" TEXT,
    
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY ("session_id") REFERENCES "focus_sessions"("id") ON DELETE CASCADE
);

-- Game Generation: Game templates
CREATE TABLE "game_templates" (
    "id" TEXT NOT NULL PRIMARY KEY DEFAULT gen_random_uuid()::text,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    
    -- Age and grade targeting
    "min_age" INTEGER NOT NULL,
    "max_age" INTEGER NOT NULL,
    "grade_level" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    
    -- Game configuration
    "difficulty" TEXT NOT NULL DEFAULT 'medium',
    "estimated_duration" INTEGER NOT NULL,
    "max_players" INTEGER NOT NULL DEFAULT 1,
    "is_multiplayer" BOOLEAN NOT NULL DEFAULT false,
    
    -- Template structure
    "structure" JSONB NOT NULL,
    "content_slots" JSONB NOT NULL,
    "scoring_rubric" JSONB NOT NULL,
    "adaptation_rules" JSONB NOT NULL,
    
    -- Metadata
    "tags" TEXT[],
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "popularity" INTEGER NOT NULL DEFAULT 0,
    
    "created_by" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Game Generation: Game sessions
CREATE TABLE "game_sessions" (
    "id" TEXT NOT NULL PRIMARY KEY DEFAULT gen_random_uuid()::text,
    "template_id" TEXT NOT NULL,
    "student_id" TEXT NOT NULL,
    "teacher_id" TEXT,
    
    -- Session details
    "title" TEXT NOT NULL,
    "description" TEXT,
    "status" TEXT NOT NULL DEFAULT 'created',
    
    -- Game content (generated by AI)
    "generated_content" JSONB NOT NULL,
    "game_state" JSONB NOT NULL,
    "player_progress" JSONB NOT NULL,
    
    -- Timing
    "started_at" TIMESTAMP(3),
    "completed_at" TIMESTAMP(3),
    "estimated_duration" INTEGER NOT NULL,
    "actual_duration" INTEGER,
    
    -- Scoring and results
    "score" INTEGER,
    "max_score" INTEGER,
    "percentage" DECIMAL(5,2),
    "performance_level" TEXT,
    
    -- Learning outcomes
    "skills_assessed" TEXT[],
    "mastery_levels" JSONB,
    "learning_objectives" TEXT[],
    
    -- Feedback and analytics
    "ai_analysis" JSONB,
    "feedback" TEXT,
    "recommendations" TEXT[],
    
    -- Metadata
    "metadata" JSONB,
    
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY ("template_id") REFERENCES "game_templates"("id"),
    FOREIGN KEY ("student_id") REFERENCES "users"("id") ON DELETE CASCADE,
    FOREIGN KEY ("teacher_id") REFERENCES "users"("id") ON DELETE SET NULL
);

-- Additional indexes for performance optimization
CREATE INDEX "idx_tenants_slug" ON "tenants"("slug");
CREATE INDEX "idx_tenants_domain" ON "tenants"("domain");
CREATE INDEX "idx_districts_tenant_id" ON "districts"("tenant_id");
CREATE INDEX "idx_schools_tenant_id" ON "schools"("tenant_id");
CREATE INDEX "idx_schools_district_id" ON "schools"("district_id");
CREATE INDEX "idx_classrooms_school_grade" ON "classrooms"("school_id", "grade_level");
CREATE INDEX "idx_users_tenant_role" ON "users"("tenant_id", "role");
CREATE INDEX "idx_users_email" ON "users"("email");
CREATE INDEX "idx_users_role_status" ON "users"("role", "status");
CREATE INDEX "idx_student_profiles_grade_age" ON "student_profiles"("grade_level", "age_group");
CREATE INDEX "idx_student_profiles_disabilities" ON "student_profiles" USING GIN("disability_types");
CREATE INDEX "idx_focus_sessions_student_started" ON "focus_sessions"("student_id", "started_at");
CREATE INDEX "idx_focus_sessions_status_started" ON "focus_sessions"("status", "started_at");
CREATE INDEX "idx_focus_events_session_detected" ON "focus_events"("session_id", "detected_at");
CREATE INDEX "idx_focus_events_type_detected" ON "focus_events"("type", "detected_at");
CREATE INDEX "idx_focus_interventions_session_triggered" ON "focus_interventions"("session_id", "triggered_at");
CREATE INDEX "idx_focus_interventions_type_effectiveness" ON "focus_interventions"("type", "effectiveness");
CREATE INDEX "idx_game_templates_category_grade" ON "game_templates"("category", "grade_level");
CREATE INDEX "idx_game_templates_subject_difficulty" ON "game_templates"("subject", "difficulty");
CREATE INDEX "idx_game_sessions_student_created" ON "game_sessions"("student_id", "created_at");
CREATE INDEX "idx_game_sessions_status_started" ON "game_sessions"("status", "started_at");

-- Enable row-level security for multi-tenant isolation
ALTER TABLE "tenants" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "districts" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "schools" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "classrooms" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "users" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "student_profiles" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "focus_sessions" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "focus_events" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "focus_interventions" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "game_templates" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "game_sessions" ENABLE ROW LEVEL SECURITY;

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION trigger_set_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add updated_at triggers to all tables
CREATE TRIGGER set_timestamp_tenants BEFORE UPDATE ON "tenants" FOR EACH ROW EXECUTE PROCEDURE trigger_set_timestamp();
CREATE TRIGGER set_timestamp_districts BEFORE UPDATE ON "districts" FOR EACH ROW EXECUTE PROCEDURE trigger_set_timestamp();
CREATE TRIGGER set_timestamp_schools BEFORE UPDATE ON "schools" FOR EACH ROW EXECUTE PROCEDURE trigger_set_timestamp();
CREATE TRIGGER set_timestamp_classrooms BEFORE UPDATE ON "classrooms" FOR EACH ROW EXECUTE PROCEDURE trigger_set_timestamp();
CREATE TRIGGER set_timestamp_users BEFORE UPDATE ON "users" FOR EACH ROW EXECUTE PROCEDURE trigger_set_timestamp();
CREATE TRIGGER set_timestamp_user_sessions BEFORE UPDATE ON "user_sessions" FOR EACH ROW EXECUTE PROCEDURE trigger_set_timestamp();
CREATE TRIGGER set_timestamp_consent_records BEFORE UPDATE ON "consent_records" FOR EACH ROW EXECUTE PROCEDURE trigger_set_timestamp();
CREATE TRIGGER set_timestamp_student_profiles BEFORE UPDATE ON "student_profiles" FOR EACH ROW EXECUTE PROCEDURE trigger_set_timestamp();
CREATE TRIGGER set_timestamp_focus_sessions BEFORE UPDATE ON "focus_sessions" FOR EACH ROW EXECUTE PROCEDURE trigger_set_timestamp();
CREATE TRIGGER set_timestamp_focus_interventions BEFORE UPDATE ON "focus_interventions" FOR EACH ROW EXECUTE PROCEDURE trigger_set_timestamp();
CREATE TRIGGER set_timestamp_game_templates BEFORE UPDATE ON "game_templates" FOR EACH ROW EXECUTE PROCEDURE trigger_set_timestamp();
CREATE TRIGGER set_timestamp_game_sessions BEFORE UPDATE ON "game_sessions" FOR EACH ROW EXECUTE PROCEDURE trigger_set_timestamp();