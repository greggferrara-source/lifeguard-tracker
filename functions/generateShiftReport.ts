import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';
import { jsPDF } from 'npm:jspdf@4.0.0';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { start_date, end_date, location_id, format_type = 'pdf' } = await req.json();

    // Fetch data
    const shifts = await base44.entities.Shift.list('-date', 500);
    const employees = await base44.entities.Employee.list();
    const locations = await base44.entities.Location.list();

    // Filter shifts by date range and location
    const filteredShifts = shifts.filter(s => {
      const shiftDate = new Date(s.date);
      const startDate = new Date(start_date);
      const endDate = new Date(end_date);
      const locationMatch = !location_id || s.location_id === location_id;
      return shiftDate >= startDate && shiftDate <= endDate && locationMatch;
    });

    // Calculate stats
    const totalShifts = filteredShifts.length;
    const openShifts = filteredShifts.filter(s => s.status === 'open').length;
    const completedShifts = filteredShifts.filter(s => s.status === 'completed').length;
    const noShowShifts = filteredShifts.filter(s => s.status === 'no_show').length;

    const hoursData = {};
    filteredShifts.forEach(s => {
      if (s.employee_id) {
        const emp = employees.find(e => e.id === s.employee_id);
        if (emp) {
          const empName = `${emp.first_name} ${emp.last_name}`;
          const [startHour, startMin] = s.start_time.split(':').map(Number);
          const [endHour, endMin] = s.end_time.split(':').map(Number);
          const hours = endHour - startHour + (endMin - startMin) / 60;
          hoursData[empName] = (hoursData[empName] || 0) + hours;
        }
      }
    });

    // Generate PDF
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    let yPos = 15;

    // Header
    doc.setFontSize(24);
    doc.setFont(undefined, 'bold');
    doc.text('Shift Report', pageWidth / 2, yPos, { align: 'center' });
    yPos += 12;

    // Date range and location
    doc.setFontSize(11);
    doc.setFont(undefined, 'normal');
    doc.text(`Period: ${start_date} to ${end_date}`, pageWidth / 2, yPos, { align: 'center' });
    yPos += 6;
    
    if (location_id) {
      const loc = locations.find(l => l.id === location_id);
      if (loc) {
        doc.text(`Location: ${loc.name}`, pageWidth / 2, yPos, { align: 'center' });
        yPos += 6;
      }
    }
    
    doc.text(`Generated: ${new Date().toLocaleDateString()}`, pageWidth / 2, yPos, { align: 'center' });
    yPos += 12;

    // Summary Stats
    doc.setFontSize(12);
    doc.setFont(undefined, 'bold');
    doc.text('Summary', 15, yPos);
    yPos += 8;

    doc.setFontSize(10);
    doc.setFont(undefined, 'normal');
    const stats = [
      [`Total Shifts: ${totalShifts}`],
      [`Completed: ${completedShifts}`],
      [`Open Positions: ${openShifts}`],
      [`No-Shows: ${noShowShifts}`],
    ];

    stats.forEach(stat => {
      doc.text(stat[0], 20, yPos);
      yPos += 6;
    });

    yPos += 4;

    // Employee Hours
    doc.setFontSize(12);
    doc.setFont(undefined, 'bold');
    doc.text('Employee Hours', 15, yPos);
    yPos += 8;

    doc.setFontSize(9);
    doc.setFont(undefined, 'normal');
    const sortedEmployees = Object.entries(hoursData)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 15);

    sortedEmployees.forEach(([name, hours]) => {
      const line = `${name}: ${hours.toFixed(1)} hrs`;
      if (yPos > pageHeight - 20) {
        doc.addPage();
        yPos = 15;
      }
      doc.text(line, 20, yPos);
      yPos += 5;
    });

    // Shift Details Table
    yPos += 6;
    if (yPos > pageHeight - 40) {
      doc.addPage();
      yPos = 15;
    }

    doc.setFontSize(12);
    doc.setFont(undefined, 'bold');
    doc.text('Shift Details', 15, yPos);
    yPos += 8;

    doc.setFontSize(8);
    doc.setFont(undefined, 'normal');
    doc.text('Date', 15, yPos);
    doc.text('Employee', 40, yPos);
    doc.text('Location', 90, yPos);
    doc.text('Time', 135, yPos);
    doc.text('Status', 170, yPos);
    yPos += 5;

    doc.setLineWidth(0.1);
    doc.line(15, yPos, pageWidth - 15, yPos);
    yPos += 4;

    filteredShifts.slice(0, 30).forEach(shift => {
      if (yPos > pageHeight - 15) {
        doc.addPage();
        yPos = 15;
      }
      const emp = employees.find(e => e.id === shift.employee_id);
      const loc = locations.find(l => l.id === shift.location_id);
      
      doc.text(shift.date, 15, yPos);
      doc.text(emp ? `${emp.first_name} ${emp.last_name}` : 'Open', 40, yPos);
      doc.text(loc?.name || 'N/A', 90, yPos);
      doc.text(`${shift.start_time}-${shift.end_time}`, 135, yPos);
      doc.text(shift.status, 170, yPos);
      yPos += 4;
    });

    const pdfBytes = doc.output('arraybuffer');

    return new Response(pdfBytes, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename=shift-report-${start_date}-to-${end_date}.pdf`,
      },
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});