import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { formatPrice } from '@/lib/utils';

export const generatePdfReport = (transactions, dateRange, stats, user) => {
  const doc = new jsPDF();
  const pageHeight = doc.internal.pageSize.height || doc.internal.pageSize.get('height');
  const pageWidth = doc.internal.pageSize.width || doc.internal.pageSize.get('width');
  let finalY = 40;

  // Cabeçalho
  if (user?.business_settings?.logo_url) {
    try {
      const img = new Image();
      img.crossOrigin = 'Anonymous';
      img.src = user.business_settings.logo_url;
      img.onload = () => {
        doc.addImage(img, 'PNG', 14, 15, 20, 20);
        addHeaderAndFooter();
        addContent();
        doc.autoPrint();
        doc.output('dataurlnewwindow');
      };
      img.onerror = () => {
        addHeaderAndFooter();
        addContent();
        doc.autoPrint();
        doc.output('dataurlnewwindow');
      };
    } catch (e) {
      addHeaderAndFooter();
      addContent();
      doc.autoPrint();
      doc.output('dataurlnewwindow');
    }
  } else {
    addHeaderAndFooter();
    addContent();
    doc.autoPrint();
    doc.output('dataurlnewwindow');
  }

  function addHeaderAndFooter() {
    // Título
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.text(user?.business_name || 'Relatório Financeiro', 40, 22);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.text(`Relatório de Transações`, 40, 28);
    doc.setDrawColor(234, 88, 12);
    doc.line(14, 38, pageWidth - 14, 38);

    // Rodapé
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(150);
      doc.text(`Página ${i} de ${pageCount}`, pageWidth / 2, pageHeight - 10, { align: 'center' });
      doc.text(`Gerado em: ${format(new Date(), 'dd/MM/yyyy HH:mm')}`, 14, pageHeight - 10);
    }
  }

  function addContent() {
    // Período
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Período do Relatório:', 14, finalY + 10);
    doc.setFont('helvetica', 'normal');
    const from = format(dateRange.from, 'P', { locale: ptBR });
    const to = dateRange.to ? format(dateRange.to, 'P', { locale: ptBR }) : from;
    doc.text(`${from} a ${to}`, 14, finalY + 16);

    // Resumo
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Resumo:', 14, finalY + 26);
    doc.setFont('helvetica', 'normal');
    doc.text(`Vendas no Período: ${formatPrice(stats.salesInPeriod)}`, 14, finalY + 32);
    doc.text(`Saldo Disponível Atual: ${formatPrice(stats.balance)}`, 14, finalY + 38);
    finalY += 50;

    // Tabela de Transações
    const tableColumn = ["Data", "Pedido", "Método", "Bruto", "Taxa", "Líquido", "Status"];
    const tableRows = [];

    transactions.forEach(t => {
      const transactionData = [
        new Date(t.created_at).toLocaleDateString('pt-BR'),
        `#${t.order_id?.slice(-6) || 'N/A'}`,
        t.payment_method,
        formatPrice(t.gross_amount),
        `-${formatPrice(t.fee)}`,
        formatPrice(t.net_amount),
        t.status,
      ];
      tableRows.push(transactionData);
    });

    doc.autoTable({
      head: [tableColumn],
      body: tableRows,
      startY: finalY,
      theme: 'striped',
      headStyles: { fillColor: [234, 88, 12] },
      didDrawPage: (data) => {
        // Adiciona o cabeçalho e rodapé em cada nova página criada pela tabela
        addHeaderAndFooter();
      }
    });
  }
};