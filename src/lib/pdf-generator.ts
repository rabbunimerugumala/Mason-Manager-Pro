'use client';

import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { Place } from './types';
import { format, getWeek, getYear, parseISO, startOfWeek, endOfWeek } from 'date-fns';

interface AutoTableDoc extends jsPDF {
  autoTable: (options: any) => jsPDF;
}

export function generatePdf(place: Place) {
  const doc = new jsPDF() as AutoTableDoc;
  const workerRate = place.workerRate || 0;
  const labourerRate = place.labourerRate || 0;

  // Header
  doc.setFontSize(20);
  doc.text('Work Site History Report', 14, 22);
  doc.setFontSize(12);
  doc.text(`Site Name: ${place.name}`, 14, 30);
  doc.text(`Date Generated: ${format(new Date(), 'MMM d, yyyy')}`, 14, 36);
  doc.text(`Rates: Worker - Rs: ${workerRate}/day, Labourer - Rs: ${labourerRate}/day`, 14, 42);

  const weeklyGroupedRecords = place.records.reduce((acc, record) => {
    const recordDate = parseISO(record.date);
    const weekNumber = getWeek(recordDate, { weekStartsOn: 1 });
    const year = getYear(recordDate);
    const weekKey = `${year}-W${weekNumber}`;
    if (!acc[weekKey]) {
      const start = startOfWeek(recordDate, { weekStartsOn: 1 });
      const end = endOfWeek(recordDate, { weekStartsOn: 1 });
      acc[weekKey] = {
        records: [],
        weekLabel: `Week of ${format(start, 'MMM d')} - ${format(end, 'MMM d, yyyy')}`,
        total: 0,
      };
    }
    acc[weekKey].records.push(record);
    return acc;
  }, {} as Record<string, { records: any[], weekLabel: string, total: number }>);
  
  const sortedWeeks = Object.keys(weeklyGroupedRecords).sort((a, b) => b.localeCompare(a));
  let finalY = 50;
  let grandTotal = 0;

  sortedWeeks.forEach(weekKey => {
    const weekData = weeklyGroupedRecords[weekKey];
    const weekTotal = weekData.records.reduce((sum, record) => {
        const workerCost = record.workers * workerRate;
        const labourerCost = record.labourers * labourerRate;
        const additionalCostsTotal = (record.additionalCosts || []).reduce((s, c) => s + c.amount, 0);
        return sum + workerCost + labourerCost + additionalCostsTotal;
    }, 0);
    grandTotal += weekTotal;

    const head = [['Date', 'Workers', 'Labourers', 'Other Costs', 'Daily Total (Rs:)']];
    const body = weekData.records
      .sort((a,b) => b.date.localeCompare(a.date))
      .map(record => {
        const workerCost = record.workers * workerRate;
        const labourerCost = record.labourers * labourerRate;
        const additionalCostsTotal = (record.additionalCosts || []).reduce((s, c) => s + c.amount, 0);
        const dailyTotal = workerCost + labourerCost + additionalCostsTotal;
        const costsString = (record.additionalCosts || [])
          .map(c => `${c.description}: ${c.amount.toFixed(2)}`)
          .join('\n') || 'N/A';
        
        return [
          format(parseISO(record.date), 'EEE, dd MMM'),
          record.workers,
          record.labourers,
          costsString,
          dailyTotal.toFixed(2),
        ];
    });

    // Add a summary row for the week total
    body.push([
      { content: 'Week Total', colSpan: 4, styles: { fontStyle: 'bold', halign: 'right' } },
      { content: weekTotal.toFixed(2), styles: { fontStyle: 'bold' } },
    ]);

    doc.autoTable({
      startY: finalY + 2,
      head: [[{content: weekData.weekLabel, colSpan: 5, styles: {halign: 'center', fontStyle: 'bold', fillColor: [230, 230, 230]}}]],
      theme: 'grid',
    });

    doc.autoTable({
      startY: doc.autoTable.previous.finalY,
      head: head,
      body: body,
      theme: 'grid',
      headStyles: { fillColor: [52, 73, 94] },
      didParseCell: function (data) {
        if (data.row.section === 'body' && data.column.index === 3) {
           data.cell.styles.fontSize = 8;
        }
      }
    });
    finalY = doc.autoTable.previous.finalY;
  });

  // Grand Total
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Grand Total:', 14, finalY + 15);
  doc.text(`Rs: ${grandTotal.toFixed(2)}`, doc.internal.pageSize.getWidth() - 14, finalY + 15, { align: 'right' });


  // Footer
  const pageCount = doc.internal.pages.length;
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(10);
    doc.text(`Page ${i} of ${pageCount}`, doc.internal.pageSize.getWidth() / 2, 287, { align: 'center' });
  }

  doc.save(`History-Report-${place.name.replace(/\s/g, '_')}-${format(new Date(), 'yyyy-MM-dd')}.pdf`);
}
