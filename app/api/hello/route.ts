import { NextResponse } from 'next/server';



/**
 * Next.js API Route - Converted from Bun serve pattern
 * 
 * This route demonstrates the conversion from Bun's serve API to Next.js API routes.
 * Key differences:
 * - Bun: Uses Bun.serve() with request handlers
 * - Next.js: Uses file-based routing with HTTP method exports
 */

export async function GET() {
  return NextResponse.json({
    message: 'Hello from Next.js API!',
    timestamp: new Date().toISOString(),
    method: 'GET',
    framework: 'Next.js App Router',
    migratedFrom: 'Bun serve',
  });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    return NextResponse.json({
      message: 'Hello from Next.js API!',
      timestamp: new Date().toISOString(),
      method: 'POST',
      receivedData: body,
      framework: 'Next.js App Router',
      migratedFrom: 'Bun serve',
    });
  } catch (error) {
    return NextResponse.json(
      { 
        error: 'Invalid JSON in request body',
        message: 'Failed to parse JSON data',
        timestamp: new Date().toISOString(),
      },
      { status: 400 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    
    return NextResponse.json({
      message: 'Hello from Next.js API!',
      timestamp: new Date().toISOString(),
      method: 'PUT',
      receivedData: body,
      framework: 'Next.js App Router',
      migratedFrom: 'Bun serve',
    });
  } catch (error) {
    return NextResponse.json(
      { 
        error: 'Invalid JSON in request body',
        message: 'Failed to parse JSON data',
        timestamp: new Date().toISOString(),
      },
      { status: 400 }
    );
  }
}

export async function DELETE() {
  return NextResponse.json({
    message: 'Hello from Next.js API!',
    timestamp: new Date().toISOString(),
    method: 'DELETE',
    framework: 'Next.js App Router',
    migratedFrom: 'Bun serve',
    note: 'DELETE request received - no action taken',
  });
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    
    return NextResponse.json({
      message: 'Hello from Next.js API!',
      timestamp: new Date().toISOString(),
      method: 'PATCH',
      receivedData: body,
      framework: 'Next.js App Router',
      migratedFrom: 'Bun serve',
    });
  } catch (error) {
    return NextResponse.json(
      { 
        error: 'Invalid JSON in request body',
        message: 'Failed to parse JSON data',
        timestamp: new Date().toISOString(),
      },
      { status: 400 }
    );
  }
}