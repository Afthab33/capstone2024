import { NextResponse } from 'next/server';

// get the user's location 
export async function GET() {
  try {
    const response = await fetch(
      `https://api.ipgeolocation.io/ipgeo?apiKey=${process.env.IPGEOLOCATION_API_KEY}`,
      {
        headers: {
          'Content-Type': 'application/json',
        },
        cache: 'no-store'
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error - status: ${response.status}`);
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Geo API Error:', error);
    return NextResponse.json({ error: 'Failed to fetch location data' }, { status: 500 });
  }
} 