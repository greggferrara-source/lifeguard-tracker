import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';
import { jsPDF } from 'npm:jspdf@4.0.0';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const { reportType, format, dateStart, dateEnd, locationId, reportData } = await req.json();
    
    if (format === 'csv') {
      // Generate CSV
      const csv = generateCSV(reportData);
      return new Response(csv, {
        status: 200,
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename="${reportType}_${dateStart}_${dateEnd}.csv"`
        }
      });
    } else if (format === 'pdf') {
      // Generate PDF
      const doc = new jsPDF();
      
      // Title
      doc.setFontSize(18);
      doc.text(`${reportType} Report`, 20, 20);
      
      // Date range
      doc.setFontSize(10);
      doc.text(`Period: ${dateStart} to ${dateEnd}`, 20, 30);
      doc.text(`Generated: ${new Date().toLocaleDateString()}`, 20, 35);
      
      // Report content
      doc.setFontSize(12);
      let y = 50;
      
      if (reportData.metrics) {
        doc.text('Key Metrics:', 20, y);
        y += 10;
        doc.setFontSize(10);
        Object.entries(reportData.metrics).forEach(([key, value]) => {
          doc.text(`${key}: ${value}`, 30, y);
          y += 7;
        });
      }
      
      if (reportData.data && Array.isArray(reportData.data)) {
        y += 10;
        doc.setFontSize(12);
        doc.text('Data:', 20, y);
        y += 10;
        doc.setFontSize(9);
        
        reportData.data.forEach((row, idx) => {
          if (y > 270) {
            doc.addPage();
            y = 20;
          }
          const text = Object.values(row).join(' | ');
          doc.text(text.substring(0, 80), 20, y);
          y += 7;
        });
      }
      
      const pdfBytes = doc.output('arraybuffer');
      return new Response(pdfBytes, {
        status: 200,
        headers: {
          'Content-Type': 'application/pdf',
          'Content-Disposition': `attachment; filename="${reportType}_${dateStart}_${dateEnd}.pdf"`
        }
      });
    }
    
    return Response.json({ error: 'Invalid format' }, { status: 400 });
    
  } catch (error) {
    console.error('Report generation error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});

function generateCSV(data) {
  if (!data || !data.data || !Array.isArray(data.data)) {
    return '';
  }
  
  const rows = data.data;
  if (rows.length === 0) return '';
  
  const headers = Object.keys(rows[0]);
  const csvLines = [
    headers.join(','),
    ...rows.map(row => headers.map(h => {
      const val = row[h];
      if (typeof val === 'string' && val.includes(',')) {
        return `"${val}"`;
      }
      return val;
    }).join(','))
  ];
  
  return csvLines.join('\n');
}