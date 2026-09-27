const mysql = require('mysql2/promise');
require('dotenv').config();

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT ? parseInt(process.env.DB_PORT, 10) : 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'password',
  ssl: process.env.DB_HOST && process.env.DB_HOST.includes('tidbcloud.com') 
    ? { minVersion: 'TLSv1.2', rejectUnauthorized: true } 
    : undefined,
  waitForConnections: true,
  connectionLimit: 50,
  queueLimit: 0
};

const dbName = process.env.DB_NAME || 'release_checklist';

// Create pool with the database selected
const pool = mysql.createPool({
  ...dbConfig,
  database: dbName
});

const initDB = async () => {
  try {
    // 1. Create a temporary connection without selecting a database
    const tempConnection = await mysql.createConnection(dbConfig);
    await tempConnection.query(`CREATE DATABASE IF NOT EXISTS \`${dbName}\``);
    await tempConnection.end();

    // 2. Now use the main pool to create tables
    const connection = await pool.getConnection();

    await connection.query(`
      CREATE TABLE IF NOT EXISTS releases (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        date DATETIME NOT NULL,
        additional_info TEXT,
        completed_steps JSON,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);
    connection.release();
    console.log("Database initialized");
  } catch (err) {
    console.error("Failed to initialize DB:", err);
  }
};

module.exports = { pool, initDB };
