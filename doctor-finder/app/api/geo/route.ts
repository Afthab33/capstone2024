import { NextResponse } from 'next/server';
import { headers } from 'next/headers';

export async function GET() {
  try {
    const headersList = await headers();
    
    // only get client IP in production environment
    let clientIP = '';
    if (process.env.NODE_ENV === 'production') {
      const forwardedFor = headersList.get('x-forwarded-for');
      const realIP = headersList.get('x-real-ip');
      clientIP = forwardedFor?.split(',')[0] || realIP || '0.0.0.0';
    }

    const url = `https://api.ipgeolocation.io/ipgeo?apiKey=${process.env.IPGEOLOCATION_API_KEY}${clientIP ? `&ip=${clientIP}` : ''}`;

    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
      },
      cache: 'no-store'
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP error - status: ${response.status}, message: ${errorText}`);
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Detailed Geo API Error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch location data', 
        details: error instanceof Error ? error.message : 'Unknown error'
      }, 
      { status: 500 }
    );
  }
} 