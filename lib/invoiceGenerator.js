import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { STORE } from './storeConfig';

/**
 * Generates and downloads an invoice PDF for a given order.
 * @param {Object} order - The order object from Supabase.
 */
export const generateInvoice = (order) => {
  try {
    if (!order) {
      console.error('No order data provided for invoice generation');
      return;
    }

    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 15;
    let currentY = 20;

    // Helper to format currency
    const formatPrice = (num) => `INR ${parseFloat(num || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

    // --- HEADER ---
    // Logo placeholder (small blue icon similar to image)
    doc.setFillColor(10, 22, 40); // Dark blue from theme
    doc.roundedRect(margin, currentY, 15, 15, 3, 3, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(8);
    doc.text('OG', margin + 7.5, currentY + 9, { align: 'center' });

    // Store Info
    doc.setTextColor(60, 60, 60);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.text(STORE.name, margin + 20, currentY + 4);
    
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.text(STORE.phone, margin + 20, currentY + 9);
    doc.text(STORE.address.split(', ').slice(0, 2).join(', '), margin + 20, currentY + 14);
    doc.text(STORE.address.split(', ').slice(2).join(', '), margin + 20, currentY + 19);

    // Order Details (Right Aligned)
    const orderId = order.id?.slice(0, 8)?.toUpperCase() || 'N/A';
    const dateStr = new Date(order.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.text(`# ${orderId}`, pageWidth - margin, currentY + 4, { align: 'right' });
    
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text(dateStr, pageWidth - margin, currentY + 11, { align: 'right' });

    currentY += 30;

    // Horizontal Line
    doc.setDrawColor(200, 200, 200);
    doc.setLineWidth(0.5);
    doc.line(margin, currentY, pageWidth - margin, currentY);
    
    currentY += 15;

    // --- TITLE ---
    doc.setTextColor(30, 30, 30);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(28);
    doc.text('INVOICE', margin, currentY);
    
    currentY += 15;

    // --- SECTIONS (BILL TO, SHIP TO, PAYMENT) ---
    const sectionColWidth = (pageWidth - (margin * 2)) / 3;
    
    // BILL TO
    doc.setTextColor(130, 130, 130);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.text('BILL TO', margin, currentY);
    
    doc.setTextColor(40, 40, 40);
    doc.setFontSize(9);
    doc.text(order.full_name || 'N/A', margin, currentY + 5);
    doc.setFont('helvetica', 'normal');
    doc.text(order.phone || 'N/A', margin, currentY + 10);
    
    const addrLines = doc.splitTextToSize(order.address || 'N/A', sectionColWidth - 5);
    doc.text(addrLines, margin, currentY + 15);
    doc.text(`Pincode ${order.pincode || 'N/A'}`, margin, currentY + 15 + (addrLines.length * 4));

    // SHIP TO
    doc.setTextColor(130, 130, 130);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.text('SHIP TO', margin + sectionColWidth, currentY);
    
    doc.setTextColor(40, 40, 40);
    doc.setFontSize(9);
    doc.text(order.full_name || 'N/A', margin + sectionColWidth, currentY + 5);
    doc.setFont('helvetica', 'normal');
    doc.text(order.phone || 'N/A', margin + sectionColWidth, currentY + 10);
    doc.text(addrLines, margin + sectionColWidth, currentY + 15);
    doc.text(`Pincode ${order.pincode || 'N/A'}`, margin + sectionColWidth, currentY + 15 + (addrLines.length * 4));

    // BILLING
    doc.setTextColor(130, 130, 130);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.text('BILLING', margin + (sectionColWidth * 2), currentY);
    
    doc.setTextColor(40, 40, 40);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.text(`Method: ${order.payment_option || 'N/A'}`, margin + (sectionColWidth * 2), currentY + 5);
    doc.text(`Product Charges`, margin + (sectionColWidth * 2), currentY + 10);

    currentY += 45;

    // --- TABLE ---
    const tableData = [];
    if (order.items && order.items.length > 0) {
      order.items.forEach(item => {
        let name = item.name;
        if (item.variant_info) {
          name += ` (${item.variant_info.ram}GB/${item.variant_info.storage}GB)`;
        }
        tableData.push([
          { content: name, styles: { fontStyle: 'bold' } },
          String(item.quantity || 1),
          formatPrice(item.price),
          formatPrice(item.price * (item.quantity || 1))
        ]);
      });
    } else {
      tableData.push([
        { content: order.product_name || 'Gadget Item', styles: { fontStyle: 'bold' } },
        '1',
        formatPrice(order.base_price || order.final_price),
        formatPrice(order.base_price || order.final_price)
      ]);
    }

    tableData.push([
      { content: 'BACK CASE + TEMPERED GLASS FREE', styles: { fontStyle: 'bold' } },
      '1',
      'INR 0.00',
      'INR 0.00'
    ]);

    autoTable(doc, {
      startY: currentY,
      head: [['ITEM', 'QUANTITY', 'RATE', 'AMOUNT']],
      body: tableData,
      theme: 'plain',
      headStyles: {
        textColor: [130, 130, 130],
        fontSize: 8,
        fontStyle: 'bold',
        cellPadding: { bottom: 5 }
      },
      styles: {
        fontSize: 9,
        cellPadding: 5
      },
      columnStyles: {
        1: { halign: 'center' },
        2: { halign: 'right' },
        3: { halign: 'right' }
      },
      didDrawPage: (data) => {
        currentY = data.cursor.y + 10;
      }
    });

    // --- SUMMARY ---
    const summaryX = pageWidth - margin;
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    
    doc.text('Subtotal', margin, currentY);
    doc.text(formatPrice(order.base_price || order.final_price), summaryX, currentY, { align: 'right' });
    
    currentY += 8;
    doc.text('DISCOUNT', margin, currentY);
    doc.text(`- ${formatPrice(order.discount_amount || 0)}`, summaryX, currentY, { align: 'right' });
    
    currentY += 8;
    doc.text('Tax (0%)', margin, currentY);
    doc.text('INR 0.00', summaryX, currentY, { align: 'right' });
    
    currentY += 8;
    doc.setLineWidth(0.8);
    doc.line(margin, currentY, pageWidth - margin, currentY);
    
    currentY += 10;
    doc.setTextColor(20, 20, 20);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.text('Total', margin, currentY);
    doc.text(formatPrice(order.final_price), summaryX, currentY, { align: 'right' });

    currentY += 20;

    // --- FOOTER / TERMS ---
    doc.setTextColor(130, 130, 130);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.text('TERMS', margin, currentY);
    
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(60, 60, 60);
    doc.text('ONE YEAR BRAND WARRANTY ON MOBILE DEVICES', margin, currentY + 6);
    doc.text('NO RETURNS ONCE SEAL IS BROKEN', margin, currentY + 11);

    // Save PDF
    doc.save(`Invoice_${orderId}.pdf`);
  } catch (error) {
    console.error('Invoice Generation Error:', error);
    alert('Failed to generate invoice. Please try again.');
  }
};
