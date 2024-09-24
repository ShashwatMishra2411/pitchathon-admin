import { Pool } from 'pg';

// Define the connection URL
const connectionString = process.env.NEXT_PUBLIC_POSTGRES;
if (!connectionString) {
    throw new Error('DATABASE_URL environment variable is not set');
}
// Create a pool of connections
const pool = new Pool({
    connectionString,
});

export default pool;
