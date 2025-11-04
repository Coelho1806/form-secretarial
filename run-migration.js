import { getPool } from './src/lib/db.js';
import fs from 'fs';

async function runMigration() {
  const pool = getPool();
  
  try {
    console.log('Running migration: adding adapted_prompt column...');
    
    const migration = fs.readFileSync('./database/migration_add_adapted_prompt.sql', 'utf8');
    
    await pool.query(migration);
    
    console.log('✅ Migration completed successfully!');
    
    // Verify column was created
    const result = await pool.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'form_submissions' AND column_name = 'adapted_prompt'
    `);
    
    if (result.rows.length > 0) {
      console.log('✅ Column adapted_prompt created:', result.rows[0]);
    } else {
      console.log('⚠️  Column not found after migration');
    }
    
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

runMigration();
