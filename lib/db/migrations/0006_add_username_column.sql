-- Add username column to User table if it doesn't exist
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "username" VARCHAR(64);

-- Update existing users to have default usernames based on their email
UPDATE "User" 
SET "username" = SPLIT_PART(email, '@', 1) 
WHERE "username" IS NULL; 