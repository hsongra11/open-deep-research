#!/usr/bin/env node

// Simple script to directly add username column to User table
const postgres = require('postgres');
require('dotenv').config();

async function fixUsername() {
  console.log('Starting direct username column fix...');
  
  if (!process.env.POSTGRES_URL) {
    console.error('POSTGRES_URL environment variable not set');
    process.exit(1);
  }
  
  // Connect to the database with simple configuration
  const sql = postgres(process.env.POSTGRES_URL);
  
  try {
    // Check if the column exists
    console.log('Checking if username column exists...');
    const tables = await sql`
      SELECT table_name FROM information_schema.tables 
      WHERE table_schema='public' AND table_name='User'
    `;
    
    if (tables.length === 0) {
      console.error('User table not found');
      process.exit(1);
    }
    
    // Execute the SQL to add the column if it doesn't exist
    console.log('Adding username column if needed...');
    await sql.unsafe(`
      DO $$ 
      BEGIN 
        BEGIN
          ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "username" VARCHAR(64);
        EXCEPTION WHEN duplicate_column THEN
          NULL;
        END;
      END $$;
    `);
    
    // Set default usernames for any null values
    console.log('Setting default usernames based on email...');
    await sql.unsafe(`
      UPDATE "User"
      SET "username" = SPLIT_PART(email, '@', 1)
      WHERE "username" IS NULL
    `);
    
    console.log('Username column migration completed successfully');
  } catch (error) {
    console.error('Error during column fix:', error);
    process.exit(1);
  } finally {
    await sql.end();
  }
}

// Execute the fix
fixUsername().catch(err => {
  console.error('Failed to fix username column:', err);
  process.exit(1);
}); 