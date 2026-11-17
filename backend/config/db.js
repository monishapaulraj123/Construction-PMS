import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import fs from 'fs';

dotenv.config();

// Database connection configuration
export const poolConfig = {
  host: (process.env.DB_HOST || 'localhost').trim(),
  user: (process.env.DB_USER || 'root').trim(),
  password: (process.env.DB_PASSWORD || '').trim(),
  database: (process.env.DB_NAME || 'construction_realestate_db').trim(),
  port: Number(process.env.DB_PORT) || 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 10000,
};

// Enable secure SSL connection for Aiven
if (process.env.DB_SSL === 'true') {
  poolConfig.ssl = {
    ca: fs.readFileSync('/etc/secrets/aiven-ca.pem', 'utf8'),
    rejectUnauthorized: true,
  };
}

// Create MySQL connection pool
const pool = mysql.createPool(poolConfig);

// Test database connection without modifying database contents
export async function testConnection() {
  let connection;

  try {
    connection = await pool.getConnection();

    const [rows] = await connection.query(
      'SELECT DATABASE() AS database_name'
    );

    console.log(
      `[Database] Connected successfully to '${rows[0].database_name}'`
    );

    return true;
  } catch (err) {
    console.error('[Database Connection Error]', err.message);
    return false;
  } finally {
    if (connection) {
      connection.release();
    }
  }
}

// Export connection pool
export default pool;

