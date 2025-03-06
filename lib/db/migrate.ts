import { config } from 'dotenv';
import { drizzle } from 'drizzle-orm/postgres-js';
import { migrate } from 'drizzle-orm/postgres-js/migrator';
import postgres from 'postgres';

config({
  path: '.env',
});

const runMigrate = async () => {
  if (!process.env.POSTGRES_URL) {
    throw new Error('POSTGRES_URL is not defined');
  }

  const connection = postgres(process.env.POSTGRES_URL, { max: 1 });
  const db = drizzle(connection);

  console.log('⏳ Running migrations...');

  // Check if username column exists before migration
  try {
    const usernameCheck = await connection.unsafe(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name='User' AND column_name='username'
    `);
    if (usernameCheck.length === 0) {
      console.log('⚠️ Username column does not exist yet - will be created by migration');
    } else {
      console.log('✅ Username column already exists');
    }
  } catch (error) {
    console.warn('⚠️ Could not check username column status:', error);
  }

  const start = Date.now();
  await migrate(db, { migrationsFolder: './lib/db/migrations' });
  const end = Date.now();

  // Check if username column exists after migration
  try {
    const usernameCheck = await connection.unsafe(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name='User' AND column_name='username'
    `);
    if (usernameCheck.length === 0) {
      console.log('❌ Migration completed but username column was not created');
    } else {
      console.log('✅ Username column created/confirmed successfully');
    }
  } catch (error) {
    console.warn('⚠️ Could not verify username column after migration:', error);
  }

  console.log('✅ Migrations completed in', end - start, 'ms');
  process.exit(0);
};

runMigrate().catch((err) => {
  console.error('❌ Migration failed');
  console.error(err);
  process.exit(1);
});
