-- Add username column to User table
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "username" VARCHAR(64); 