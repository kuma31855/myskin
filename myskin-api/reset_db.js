// myskin-api/reset_db.js
const fs = require('fs/promises');
const path = require('path');
const pool = require('./db');

async function resetDatabase() {
  let connection;
  try {
    console.log('Reading SQL seed file...');
    const seedPath = path.join(__dirname, 'myskin_seed.sql');
    const sql = await fs.readFile(seedPath, 'utf-8');

    // CREATE DATABASE and USE statements might fail if the user doesn't have permissions
    // or if they are run in a transaction context. It's often better to ensure the DB
    // exists beforehand. Let's focus on cleaning and seeding the tables.

    // Split SQL file into individual statements
    const statements = sql.split(/;\s*$/m).filter(statement => statement.length > 0);
    
    connection = await pool.getConnection();
    console.log('Successfully connected to the database.');

    // Temporarily disable foreign key checks to avoid order issues during dropping
    await connection.query('SET FOREIGN_KEY_CHECKS=0;');
    console.log('Foreign key checks disabled.');

    // Execute each statement
    for (const statement of statements) {
      // Skip comments and empty lines
      if (statement.trim().startsWith('--') || statement.trim().length === 0) {
        continue;
      }
      // The seed file handles DROPPING tables, so we just run the queries.
       console.log(`Executing: ${statement.substring(0, 100)}...`);
      await connection.query(statement);
    }
    
    // Re-enable foreign key checks
    await connection.query('SET FOREIGN_KEY_CHECKS=1;');
    console.log('Foreign key checks enabled.');

    console.log('✅ Database reset and seeded successfully!');

  } catch (error) {
    console.error('❌ Failed to reset database:', error);
  } finally {
    if (connection) {
      connection.release();
      console.log('Connection released.');
    }
    // End the pool so the script can exit
    pool.end();
  }
}

resetDatabase();
