// Direct script to add username column to User table
// This script bypasses Drizzle and directly executes SQL
const postgres = require('postgres');
require('dotenv').config();

async function addUsernameColumn() {
  console.log('Starting direct username column migration...');
  
  // Connect to the database
  const sql = postgres(process.env.POSTGRES_URL, { max: 1 });
  
  try {
    // Check if username column already exists
    console.log('Checking if username column exists...');
    const columnCheck = await sql`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'User' 
      AND column_name = 'username'
    `;
    
    if (columnCheck.length === 0) {
      console.log('Username column does not exist. Adding it now...');
      
      // Add username column
      await sql`ALTER TABLE "User" ADD COLUMN "username" VARCHAR(64)`;
      console.log('Username column added successfully');
      
      // Set default usernames for existing users based on their email
      const users = await sql`SELECT id, email FROM "User"`;
      
      for (const user of users) {
        const defaultUsername = user.email.split('@')[0];
        await sql`UPDATE "User" SET "username" = ${defaultUsername} WHERE id = ${user.id}`;
      }
      
      console.log(`Updated ${users.length} existing users with default usernames`);
    } else {
      console.log('Username column already exists. No migration needed.');
    }
    
  } catch (error) {
    console.error('Error during migration:', error);
    process.exit(1);
  } finally {
    await sql.end();
    console.log('Direct migration completed');
  }
}

// Run the migration
addUsernameColumn().catch(error => {
  console.error('Migration failed:', error);
  process.exit(1);
}); 