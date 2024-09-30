// import { NextApiRequest } from 'next';
import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db'; // Import the connection pool

export async function POST(req: NextRequest) {
    try {
        // Parse the incoming request body
        const { teamid, participantid, gender } = await req.json();

        if (!teamid || !participantid || !gender) {
            return new NextResponse("Missing required fields", { status: 400 });
        }

        // console.log(teamid, participantid, gender);
        const gen = gender.toLowerCase();

        // Check if the participant already exists
        const pres = await pool.query(
            'SELECT present FROM Participants WHERE teamID = $1 AND participantID = $2',
            [teamid, participantid]
        );
        let present;
        if (pres.rows.length > 0) {
            present = !pres.rows[0].present;
            console.log(teamid, participantid, present)
            const result = await pool.query('Update Participants set present=$1 where teamID=$2 AND participantID=$3', [present, teamid, participantid]);
            console.log(result.rows[0]);
            return new NextResponse(JSON.stringify(result.rows[0]), { status: 201 });
        } else {
            present = true;
            const query = `
            INSERT INTO Participants (teamID, participantID, gender, present)
            VALUES ($1, $2, $3, $4)
            RETURNING *;
        `;
            const values = [teamid, participantid, gen, present];

            // Execute the query with parameterized values
            const result = await pool.query(query, values);

            // Return the inserted participant data
            return new NextResponse(JSON.stringify(result.rows[0]), { status: 201 });
        }
        // const present = pres.rows.length > 0 ? !pres.rows[0].present : true;

        // Insert data into Participants table

    } catch (error) {
        console.error('Error inserting participant:', error);
        return new NextResponse("Failed", { status: 500 });
    }
}
