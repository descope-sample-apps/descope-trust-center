import { NextResponse } from 'next/server';

// Simple validation without external dependencies
interface ContactFormData {
  name: string;
  email: string;
  company?: string;
  message: string;
  topic: 'general' | 'security' | 'compliance' | 'technical' | 'partnership';
}

function sanitizeForLogging(value: unknown): unknown {
  if (typeof value === 'string') {
    // Remove newline and carriage return characters to prevent log injection
    return value.replace(/[\r\n]/g, '');
  }

  if (Array.isArray(value)) {
    return value.map((item) => sanitizeForLogging(item));
  }

  if (value && typeof value === 'object') {
    const sanitized: Record<string, unknown> = {};
    for (const [key, val] of Object.entries(value as Record<string, unknown>)) {
      sanitized[key] = sanitizeForLogging(val);
    }
    return sanitized;
  }

  return value;
}

function validateContactForm(data: unknown): { success: true; data: ContactFormData } | { success: false; errors: string[] } {
  const errors: string[] = [];
  
  if (!data || typeof data !== 'object') {
    return { success: false, errors: ['Invalid request body'] };
  }
  
  const obj = data as Record<string, unknown>;
  
  // Name validation
  if (!obj.name || typeof obj.name !== 'string') {
    errors.push('Name is required');
  } else if (obj.name.length < 2) {
    errors.push('Name must be at least 2 characters');
  }
  
  // Email validation
  if (!obj.email || typeof obj.email !== 'string') {
    errors.push('Email is required');
  } else {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(obj.email)) {
      errors.push('Invalid email address');
    }
  }
  
  // Message validation
  if (!obj.message || typeof obj.message !== 'string') {
    errors.push('Message is required');
  } else if (obj.message.length < 10) {
    errors.push('Message must be at least 10 characters');
  }
  
  // Topic validation
  const validTopics = ['general', 'security', 'compliance', 'technical', 'partnership'];
  if (!obj.topic || typeof obj.topic !== 'string') {
    errors.push('Topic is required');
  } else if (!validTopics.includes(obj.topic)) {
    errors.push('Please select a valid topic');
  }
  
  // Company is optional
  if (obj.company && typeof obj.company !== 'string') {
    errors.push('Company must be a string');
  }
  
  if (errors.length > 0) {
    return { success: false, errors };
  }
  
  return { 
    success: true, 
    data: obj as unknown as ContactFormData 
  };
}



/**
 * Contact Form API Route - Next.js implementation
 * 
 * This route handles contact form submissions for the Descope Trust Center.
 * Converted from potential Bun serve patterns to Next.js API routes.
 */

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // Validate the request body
    const validationResult = validateContactForm(body);
    
    if (!validationResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: 'Validation failed',
          details: validationResult.errors,
          timestamp: new Date().toISOString(),
        },
        { status: 400 }
      );
    }
    
    const validatedData = validationResult.data;
    
    // In a real implementation, you would:
    // 1. Save to database
    // 2. Send email notification
    // 3. Create support ticket
    // 4. Log the submission
    
    // For demo purposes, we'll just return success
    console.log('Contact form submission:', sanitizeForLogging(validatedData));
    
    return NextResponse.json({
      success: true,
      message: 'Contact form submitted successfully',
      timestamp: new Date().toISOString(),
      submissionId: generateSubmissionId(),
      receivedData: {
        name: validatedData.name,
        email: validatedData.email,
        company: validatedData.company,
        topic: validatedData.topic,
        messageLength: validatedData.message.length,
      },
    });
    
  } catch (error) {
    console.error('Contact form submission error:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error',
        message: 'Failed to process contact form submission',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Contact Form API - Next.js implementation',
    timestamp: new Date().toISOString(),
    method: 'GET',
    framework: 'Next.js App Router',
    migratedFrom: 'Bun serve',
    endpoints: {
      POST: '/api/contact - Submit contact form',
    },
    schema: {
      name: 'string (min 2 chars)',
      email: 'string (valid email)',
      company: 'string (optional)',
      message: 'string (min 10 chars)',
      topic: 'enum (general, security, compliance, technical, partnership)',
    },
  });
}

// Helper function to generate submission ID
function generateSubmissionId(): string {
  const timestamp = Date.now().toString(36);
  const randomStr = Math.random().toString(36).substring(2, 8);
  return `sub_${timestamp}_${randomStr}`;
}