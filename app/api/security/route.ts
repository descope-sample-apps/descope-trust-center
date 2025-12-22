import { NextResponse } from 'next/server';

// Mock security status data
const securityStatus = {
  overall: 'operational',
  lastUpdated: '2024-12-22T10:30:00Z',
  services: [
    {
      name: 'Authentication Service',
      status: 'operational',
      description: 'User authentication and authorization',
      uptime: '99.99%',
      responseTime: '45ms',
    },
    {
      name: 'API Gateway',
      status: 'operational',
      description: 'API request routing and rate limiting',
      uptime: '99.98%',
      responseTime: '32ms',
    },
    {
      name: 'Database',
      status: 'operational',
      description: 'Primary database and replication',
      uptime: '99.95%',
      responseTime: '12ms',
    },
    {
      name: 'CDN',
      status: 'operational',
      description: 'Content delivery network',
      uptime: '99.99%',
      responseTime: '28ms',
    },
  ],
  incidents: [
    {
      id: 'inc-2024-001',
      title: 'Scheduled Maintenance',
      status: 'resolved',
      severity: 'maintenance',
      start: '2024-12-20T02:00:00Z',
      end: '2024-12-20T04:00:00Z',
      description: 'Scheduled database maintenance completed successfully',
      affectedServices: ['Database'],
    },
  ],
  compliance: {
    soc2: {
      status: 'compliant',
      lastAudit: '2024-11-15',
      nextAudit: '2025-11-15',
      reportUrl: '/documents/soc2-type2.pdf',
    },
    iso27001: {
      status: 'certified',
      lastAudit: '2024-10-20',
      nextAudit: '2025-10-20',
      certificateUrl: '/documents/iso27001.pdf',
    },
    gdpr: {
      status: 'compliant',
      lastReview: '2024-09-30',
      nextReview: '2025-09-30',
      statementUrl: '/documents/gdpr-compliance.pdf',
    },
  },
};



/**
 * Security Status API Route - Next.js implementation
 * 
 * This route provides real-time security and compliance status information.
 * Converted from potential Bun serve patterns to Next.js API routes.
 */

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const service = searchParams.get('service');
  const type = searchParams.get('type');
  
  // Return specific service status
  if (service) {
    const serviceData = securityStatus.services.find(s => 
      s.name.toLowerCase().includes(service.toLowerCase())
    );
    
    if (!serviceData) {
      return NextResponse.json(
        {
          error: 'Service not found',
          message: `No service found matching: ${service}`,
          availableServices: securityStatus.services.map(s => s.name),
          timestamp: new Date().toISOString(),
        },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      service: serviceData,
      overall: securityStatus.overall,
      lastUpdated: securityStatus.lastUpdated,
      timestamp: new Date().toISOString(),
      framework: 'Next.js App Router',
      migratedFrom: 'Bun serve',
    });
  }
  
  // Return specific type of data
  if (type === 'incidents') {
    return NextResponse.json({
      incidents: securityStatus.incidents,
      total: securityStatus.incidents.length,
      timestamp: new Date().toISOString(),
      framework: 'Next.js App Router',
      migratedFrom: 'Bun serve',
    });
  }
  
  if (type === 'compliance') {
    return NextResponse.json({
      compliance: securityStatus.compliance,
      timestamp: new Date().toISOString(),
      framework: 'Next.js App Router',
      migratedFrom: 'Bun serve',
    });
  }
  
  // Return full security status
  return NextResponse.json({
    ...securityStatus,
    timestamp: new Date().toISOString(),
    framework: 'Next.js App Router',
    migratedFrom: 'Bun serve',
    endpoints: {
      'GET /api/security': 'Full security status',
      'GET /api/security?service=<name>': 'Specific service status',
      'GET /api/security?type=incidents': 'Recent incidents',
      'GET /api/security?type=compliance': 'Compliance status',
    },
  });
}