import { NextResponse } from "next/server";
import axios from "axios";

const API_KEY = process.env.API_KEY;
const BASE_URL = process.env.BASE_URL; // Confirm the correct API endpoint

export async function GET(_req: Request) {
  try {
    const response = await axios.get(`${BASE_URL}/currencies`, {
      headers: {
        Authorization: `Bearer ${API_KEY}`,
        "Content-Type": "application/json",
      },
    });

    return NextResponse.json(response.data, { status: 200 });
  } catch (error: any) {
    return NextResponse.json(
      { message: "Error fetching currencies insights", error: error.message },
      { status: error.response?.status || 500 }
    );
  }
}
