import pool from '@/lib/db'; // Import the connection pool
import { NextResponse } from 'next/server';

export async function GET() {
    try {
        // Example query to fetch data
        // console.log(req.type);
        const result1 = await pool.query('SELECT Count(*) FROM Participants where gender=$1 and present=true', ['Male']);
        const result2 = await pool.query('SELECT Count(*) FROM Participants where gender=$1 and present=true', ['Female']);
        const result3 = await pool.query('SELECT Count(*) FROM Participants');
        return new NextResponse(JSON.stringify({
            male: result1.rows[0].count,
            female: result2.rows[0].count,
            total: result3.rows[0].count
        }), { status: 200 });
    } catch (error) {
        console.error('Error fetching participants:', error);
        return new NextResponse("Failed", { status: 500 });
        // res.status(500).json({ error: 'Failed to fetch participants' });
    }
}

