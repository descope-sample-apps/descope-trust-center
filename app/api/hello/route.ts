import { NextResponse } from 'next/server';

export const dynamic = 'force-static';
export const revalidate = false;

export async function GET() {
  return NextResponse.json({
    message: 'Hello from Next.js API!',
    timestamp: new Date().toISOString(),
    method: 'GET',
  });
}

export async function PUT(request: Request) {
  const body = await request.json();
  
  return NextResponse.json({
    message: 'Hello from Next.js API!',
    timestamp: new Date().toISOString(),
    method: 'PUT',
    receivedData: body,
  });
}