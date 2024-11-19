import pool from "@/lib/db"; // Import the connection pool
import { NextResponse } from "next/server";

export async function POST() {
  try {
    // Query all rows from the database
    const result = await pool.query(
      "SELECT * FROM powerusage where pdate=$1;",
      ["2024-11-20"]
    );

    // Initialize an object to store aggregates
    const aggregate = {};

    // Iterate over rows to calculate aggregate for each hour
    result.rows.forEach((row) => {
      Object.keys(row).forEach((key) => {
        if (key.startsWith("hr")) {
          // Parse the value to a number and sum it up
          aggregate[key] = (aggregate[key] || 0) + parseFloat(row[key]);
        }
      });
    });

    // Convert the aggregate object to an array of { hour, total }
    const aggregateArray = Object.entries(aggregate).map(([hour, total]) => {
      let hourNumber = total / Math.pow(10, 16);
      return { hour: hour, total: hourNumber };
    });
    console.log(aggregateArray);
    // Return the aggregate array as a JSON response
    return NextResponse.json(aggregateArray, { status: 200 });
  } catch (error) {
    console.error("Error fetching and aggregating power usage:", error);
    return NextResponse.json(
      { error: "Failed to fetch power usage data" },
      { status: 500 }
    );
  }
}
