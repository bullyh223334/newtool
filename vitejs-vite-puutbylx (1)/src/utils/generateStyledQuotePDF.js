import jsPDF from 'jspdf';
import 'jspdf-autotable';

export const generateStyledQuotePDF = (quote) => {
  const doc = new jsPDF();

  doc.setFontSize(18);
  doc.text(`Quote: ${quote.name || 'Unnamed Quote'}`, 14, 20);

  const tableColumns = ["Model", "Description", "MSRP (€)", "Discount (%)", "Qty", "Line Total (€)"];
  const tableRows = quote.items.map((item, idx) => {
    const msrp = Number(item.msrp) || 0;
    const discount = Number(item.discount) || 0;
    const quantity = Number(item.quantity) || 0;

    const lineTotal = msrp * quantity * (1 - discount / 100);

    return [
      item.model || `Item ${idx + 1}`,
      item.description || "-",
      msrp.toFixed(2),
      discount.toFixed(2),
      quantity,
      lineTotal.toFixed(2),
    ];
  });

  doc.autoTable({
    head: [tableColumns],
    body: tableRows,
    startY: 30,
    theme: 'grid',
    styles: { fontSize: 11, cellPadding: 3 },
  });

  const total = tableRows.reduce((sum, row) => sum + parseFloat(row[5]), 0).toFixed(2);
  doc.setFontSize(14);
  doc.text(`Total Quote: €${total}`, 14, doc.lastAutoTable.finalY + 12);

  doc.save(`${quote.name || 'quote'}.pdf`);
};
