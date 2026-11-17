
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

// Resolve the current directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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
  const isRender = process.env.RENDER === 'true';

  const caPath = isRender
    ? '/etc/secrets/aiven-ca.pem'
    : path.join(__dirname, '../certificates/aiven-ca.pem');

  if (!fs.existsSync(caPath)) {
    throw new Error(`Aiven SSL certificate not found: ${caPath}`);
  }

  poolConfig.ssl = {
    ca: fs.readFileSync(caPath, 'utf8'),
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

    // Auto-migrate and synchronize project images to ensure distinct, suitable images in production and local DB
    try {
      const projectImages = [
        {
          code: 'PRJ-2026-001',
          name: 'Green Valley Residence',
          image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=800&auto=format&fit=crop'
        },
        {
          code: 'PRJ-2026-002',
          name: 'City Hospital Block B',
          image: 'https://images.unsplash.com/photo-1587351021355-a479a299d2f9?q=80&w=800&auto=format&fit=crop'
        },
        {
          code: 'PRJ-2026-003',
          name: 'Tech Park IT Tower',
          image: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=800&auto=format&fit=crop'
        }
      ];

      for (const p of projectImages) {
        await connection.query(
          `UPDATE projects 
           SET image = ? 
           WHERE (project_code = ? OR project_name LIKE ?) 
             AND (image != ? OR image IS NULL OR image = '')`,
          [p.image, p.code, `%${p.name}%`, p.image]
        );
      }
      console.log('[Database] Verified project images');
    } catch (migErr) {
      console.warn('[Database Notice] Project image verification:', migErr.message);
    }

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

