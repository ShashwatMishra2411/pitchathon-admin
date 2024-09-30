import pool from '@/lib/db'; // Import the connection pool
import { NextResponse } from 'next/server';

export async function GET() {
    try {
        // Fetch data from the database
        const result1 = await pool.query('SELECT Count(*) FROM Participants WHERE gender=$1 AND present=true', ['Male']);
        const result2 = await pool.query('SELECT Count(*) FROM Participants WHERE gender=$1 AND present=true', ['Female']);
        const result3 = await pool.query('SELECT Count(*) FROM Participants');

        const response = NextResponse.json({
            male: result1.rows[0].count,
            female: result2.rows[0].count,
            total: result3.rows[0].count
        }, { status: 200 });

        // Setting headers
        response.headers.set("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
        response.headers.set("Pragma", "no-cache");
        response.headers.set("Expires", "0");
        response.headers.set("Surrogate-Control", "no-store");
        console.log(response);
        return response;

    } catch (error) {
        console.error('Error fetching participants:', error);
        return NextResponse.json({ error: 'Failed to fetch participants' }, { status: 500 });
    }
}
