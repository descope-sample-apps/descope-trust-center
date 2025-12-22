import { NextResponse } from 'next/server';

// Mock document data for the trust center
const mockDocuments = [
  {
    id: 'soc2-type2',
    title: 'SOC 2 Type II Report',
    category: 'compliance',
    description: 'System and Organization Controls 2 Type II compliance report',
    lastUpdated: '2024-11-15',
    downloadUrl: '/documents/soc2-type2.pdf',
    type: 'PDF',
    size: '2.4 MB',
  },
  {
    id: 'iso27001',
    title: 'ISO 27001 Certification',
    category: 'compliance',
    description: 'International Organization for Standardization 27001 security certification',
    lastUpdated: '2024-10-20',
    downloadUrl: '/documents/iso27001.pdf',
    type: 'PDF',
    size: '1.8 MB',
  },
  {
    id: 'gdpr-compliance',
    title: 'GDPR Compliance Statement',
    category: 'privacy',
    description: 'General Data Protection Regulation compliance documentation',
    lastUpdated: '2024-09-30',
    downloadUrl: '/documents/gdpr-compliance.pdf',
    type: 'PDF',
    size: '856 KB',
  },
  {
    id: 'security-whitepaper',
    title: 'Security Architecture Whitepaper',
    category: 'security',
    description: 'Detailed overview of Descope\'s security architecture and practices',
    lastUpdated: '2024-11-01',
    downloadUrl: '/documents/security-whitepaper.pdf',
    type: 'PDF',
    size: '3.2 MB',
  },
  {
    id: 'subprocessor-list',
    title: 'Subprocessor List',
    category: 'privacy',
    description: 'Current list of Descope subprocessors and their compliance status',
    lastUpdated: '2024-11-10',
    downloadUrl: '/documents/subprocessor-list.pdf',
    type: 'PDF',
    size: '425 KB',
  },
];



/**
 * Documents API Route - Next.js implementation
 * 
 * This route provides access to trust center documents.
 * Converted from potential Bun serve patterns to Next.js API routes.
 */

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get('category');
  const id = searchParams.get('id');
  
  // Return specific document by ID
  if (id) {
    const document = mockDocuments.find(doc => doc.id === id);
    
    if (!document) {
      return NextResponse.json(
        {
          error: 'Document not found',
          message: `No document found with ID: ${id}`,
          timestamp: new Date().toISOString(),
        },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      document,
      timestamp: new Date().toISOString(),
      framework: 'Next.js App Router',
      migratedFrom: 'Bun serve',
    });
  }
  
  // Filter by category if specified
  let filteredDocuments = mockDocuments;
  if (category) {
    filteredDocuments = mockDocuments.filter(doc => doc.category === category);
  }
  
  // Return documents list
  return NextResponse.json({
    documents: filteredDocuments,
    total: filteredDocuments.length,
    categories: ['compliance', 'privacy', 'security'],
    timestamp: new Date().toISOString(),
    framework: 'Next.js App Router',
    migratedFrom: 'Bun serve',
    filters: {
      category: category || 'all',
    },
  });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // In a real implementation, this would handle document uploads
    // For demo purposes, we'll just return a success response
    
    return NextResponse.json({
      success: true,
      message: 'Document upload endpoint - Next.js implementation',
      timestamp: new Date().toISOString(),
      note: 'This is a demo endpoint. Actual document upload would require file handling.',
      receivedData: {
        title: body.title,
        category: body.category,
        description: body.description,
      },
      framework: 'Next.js App Router',
      migratedFrom: 'Bun serve',
    });
    
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: 'Invalid JSON in request body',
        message: 'Failed to parse document upload data',
        timestamp: new Date().toISOString(),
      },
      { status: 400 }
    );
  }
}