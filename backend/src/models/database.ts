import { Pool, PoolClient, QueryResult } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

// Create connection pool with environment variables
const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'agreement_tracker',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  max: parseInt(process.env.DB_POOL_SIZE || '20'),
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
  ssl: process.env.DB_SSL === 'require' ? { rejectUnauthorized: false } : false,
});

pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
});

// Define Database interface with SQLite-compatible API
export interface Database {
  query: (text: string, values?: any[]) => Promise<QueryResult>;
  run: (text: string, values?: any[]) => Promise<any>;
  get: (text: string, values?: any[]) => Promise<any>;
  all: (text: string, values?: any[]) => Promise<any[]>;
  exec: (text: string) => Promise<any>;
}

// Helper function to convert SQLite ? placeholders to PostgreSQL $1, $2, etc.
function convertPlaceholders(text: string): { text: string; paramCount: number } {
  let paramCount = 0;
  const newText = text.replace(/\?/g, () => {
    paramCount++;
    return `$${paramCount}`;
  });
  return { text: newText, paramCount };
}

// Create database object with SQLite-compatible API for PostgreSQL
export const db: Database = {
  query: (text: string, values?: any[]) => {
    const { text: pgText } = convertPlaceholders(text);
    const params = Array.isArray(values) ? values : values ? [values] : [];
    return pool.query(pgText, params);
  },

  run: (text: string, values?: any[]) => {
    const { text: pgText } = convertPlaceholders(text);
    const params = Array.isArray(values) ? values : values ? [values] : [];
    // Add RETURNING id for INSERT statements
    const finalText = pgText.toUpperCase().includes('INSERT') ? pgText.replace(/;?$/, ' RETURNING id;') : pgText;
    return pool.query(finalText, params).then((result: QueryResult) => ({
      lastID: result.rows[0]?.id,
      changes: result.rowCount
    }));
  },

  get: (text: string, values?: any[]) => {
    const { text: pgText } = convertPlaceholders(text);
    const params = Array.isArray(values) ? values : values ? [values] : [];
    return pool.query(pgText, params).then((result: QueryResult) => result.rows[0]);
  },

  all: (text: string, values?: any[]) => {
    const { text: pgText } = convertPlaceholders(text);
    const params = Array.isArray(values) ? values : values ? [values] : [];
    return pool.query(pgText, params).then((result: QueryResult) => result.rows);
  },

  exec: (text: string) => {
    return pool.query(text);
  }
};

export const initializeDatabase = async (): Promise<Database> => {
  let client: PoolClient | null = null;
  try {
    client = await pool.connect();

    // Create tables with PostgreSQL syntax
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        name VARCHAR(255) NOT NULL,
        password_hash VARCHAR(255),
        google_id VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS agreements (
        id SERIAL PRIMARY KEY,
        creator_id INTEGER NOT NULL,
        title VARCHAR(255) DEFAULT 'Standard Agreement',
        agreement_type VARCHAR(100) NOT NULL,
        start_date TEXT NOT NULL,
        end_date TEXT NOT NULL,
        terms_conditions TEXT NOT NULL,
        payment_amount DECIMAL(10,2) NOT NULL,
        jurisdiction VARCHAR(255) NOT NULL,
        recipient_name VARCHAR(255) NOT NULL,
        recipient_email VARCHAR(255) NOT NULL,
        status VARCHAR(50) DEFAULT 'draft' CHECK(status IN ('draft','pending','signed','rejected')),
        pdf_url VARCHAR(500),
        signed_pdf_url VARCHAR(500),
        unsigned_pdf_content BYTEA,
        signed_pdf_content BYTEA,
        sent_at TIMESTAMP,
        signed_at TIMESTAMP,
        rejected_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(creator_id) REFERENCES users(id) ON DELETE CASCADE
      );

      CREATE TABLE IF NOT EXISTS signatures (
        id SERIAL PRIMARY KEY,
        agreement_id INTEGER NOT NULL,
        signer_name VARCHAR(255) NOT NULL,
        signature_type VARCHAR(50) CHECK(signature_type IN ('typed','drawn','uploaded')),
        signature_data TEXT NOT NULL,
        ip_address VARCHAR(45),
        signed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(agreement_id) REFERENCES agreements(id) ON DELETE CASCADE
      );

      CREATE TABLE IF NOT EXISTS audit_logs (
        id SERIAL PRIMARY KEY,
        agreement_id INTEGER NOT NULL,
        action VARCHAR(100) NOT NULL,
        performed_by VARCHAR(255) NOT NULL,
        timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(agreement_id) REFERENCES agreements(id) ON DELETE CASCADE
      );

      CREATE TABLE IF NOT EXISTS notifications (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL,
        agreement_id INTEGER,
        type VARCHAR(50) CHECK(type IN ('sent','signed','rejected','pdf_ready')),
        title VARCHAR(255) NOT NULL,
        message TEXT NOT NULL,
        is_read BOOLEAN DEFAULT false,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY(agreement_id) REFERENCES agreements(id) ON DELETE CASCADE
      );

      CREATE INDEX IF NOT EXISTS idx_agreements_creator ON agreements(creator_id);
      CREATE INDEX IF NOT EXISTS idx_signatures_agreement ON signatures(agreement_id);
      CREATE INDEX IF NOT EXISTS idx_audit_logs_agreement ON audit_logs(agreement_id);
      CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id);
      CREATE INDEX IF NOT EXISTS idx_notifications_agreement ON notifications(agreement_id);
    `);

    // Migration: Add BYTEA columns if they don't exist
    console.log('🔄 Running database migrations...');
    
    try {
      await client.query(`ALTER TABLE agreements ADD COLUMN IF NOT EXISTS unsigned_pdf_content BYTEA;`);
      console.log('✅ Column unsigned_pdf_content ready');
    } catch (err) {
      // Column might already exist, continue
    }

    try {
      await client.query(`ALTER TABLE agreements ADD COLUMN IF NOT EXISTS signed_pdf_content BYTEA;`);
      console.log('✅ Column signed_pdf_content ready');
    } catch (err) {
      // Column might already exist, continue
    }

    console.log('✅ Database migration complete');
    return db;
  } catch (error) {
    console.error('Database initialization error:', error);
    throw error;
  } finally {
    if (client) {
      client.release();
    }
  }
};

export const getDatabase = (): Database => {
  return db;
};

// Helper function to execute queries
export const query = (text: string, params?: any[]) => {
  return db.query(text, params);
};

// Graceful shutdown
export const closeDatabase = async () => {
  try {
    await pool.end();
    console.log('Database pool closed');
  } catch (error) {
    console.error('Error closing database pool:', error);
  }
};

export default getDatabase;
