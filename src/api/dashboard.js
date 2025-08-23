import fs from 'fs';
import path from 'path';

export async function GET(request) {
  const url = new URL(request.url);
  const pathSegments = url.pathname.split('/').filter(Boolean);
  
  // Expected format: /api/dashboard/{dashboardName}/{pageName}
  if (pathSegments.length >= 4 && pathSegments[0] === 'api' && pathSegments[1] === 'dashboard') {
    const dashboardName = pathSegments[2];
    const pageName = pathSegments[3];
    
    try {
      const filePath = path.join(process.cwd(), 'dashboards', dashboardName, `${pageName}.svelte`);
      const content = fs.readFileSync(filePath, 'utf-8');
      
      return new Response(content, {
        headers: {
          'Content-Type': 'text/plain',
          'Cache-Control': 'no-cache'
        }
      });
    } catch (error) {
      return new Response('File not found', { status: 404 });
    }
  }
  
  return new Response('Invalid API endpoint', { status: 400 });
}
