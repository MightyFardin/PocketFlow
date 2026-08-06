import React, { useState } from 'react';
import { useFinance } from '../context/FinanceContext';
import { FileText, Download, FileSpreadsheet, FileIcon as FilePdfIcon, Calendar, Filter } from 'lucide-react';
import { format, subMonths, startOfMonth, endOfMonth, startOfYear, endOfYear, isWithinInterval, startOfDay, endOfDay, startOfWeek, endOfWeek, subWeeks } from 'date-fns';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import * as XLSX from 'xlsx';
import CustomSelect from '../components/CustomSelect';

const Reports = () => {
  const { transactions, formatMoney, settings } = useFinance();
  const [reportType, setReportType] = useState('all'); // all, income, expense
  const [dateRange, setDateRange] = useState('this_month'); // this_month, last_month, this_year, all_time

  const getFilteredTransactions = () => {
    const now = new Date();
    let start, end;
    if (dateRange === 'today') {
      start = startOfDay(now);
      end = endOfDay(now);
    } else if (dateRange === 'this_week') {
      start = startOfWeek(now);
      end = endOfWeek(now);
    } else if (dateRange === 'last_week') {
      const lastW = subWeeks(now, 1);
      start = startOfWeek(lastW);
      end = endOfWeek(lastW);
    } else if (dateRange === 'this_month') {
      start = startOfMonth(now);
      end = endOfMonth(now);
    } else if (dateRange === 'last_month') {
      const lastM = subMonths(now, 1);
      start = startOfMonth(lastM);
      end = endOfMonth(lastM);
    } else if (dateRange === 'this_year') {
      start = startOfYear(now);
      end = endOfYear(now);
    }

    return transactions.filter(t => {
      // Type filter
      if (reportType !== 'all' && t.type !== reportType) return false;
      
      // Date filter
      if (dateRange !== 'all_time') {
        if (!isWithinInterval(new Date(t.date), { start, end })) return false;
      }
      return true;
    }).sort((a, b) => new Date(b.date) - new Date(a.date));
  };

  const filteredData = getFilteredTransactions();

  const handleExportCSV = () => {
    if (filteredData.length === 0) return alert('No data to export.');
    const headers = ['Date', 'Type', 'Category', 'Note', 'Amount'];
    const rows = filteredData.map(t => [
      format(new Date(t.date), 'yyyy-MM-dd'),
      t.type,
      t.category,
      t.note || '',
      t.amount
    ]);
    
    const csvContent = [
      headers.join(','),
      ...rows.map(e => e.join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `pocketflow_report_${format(new Date(), 'yyyyMMdd')}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportExcel = () => {
    if (filteredData.length === 0) return alert('No data to export.');
    const worksheet = XLSX.utils.json_to_sheet(filteredData.map(t => ({
      Date: format(new Date(t.date), 'yyyy-MM-dd'),
      Type: t.type.toUpperCase(),
      Category: t.category,
      Note: t.note,
      Amount: t.amount,
      Currency: settings.currency || 'BDT'
    })));
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Report");
    XLSX.writeFile(workbook, `pocketflow_report_${format(new Date(), 'yyyyMMdd')}.xlsx`);
  };

  const handleExportPDF = () => {
    if (filteredData.length === 0) return alert('No data to export.');
    const doc = new jsPDF();
    
    doc.setFontSize(18);
    doc.text('PocketFlow Financial Report', 14, 22);
    
    doc.setFontSize(11);
    doc.setTextColor(100);
    doc.text(`Generated on ${format(new Date(), 'MMM dd, yyyy')}`, 14, 30);
    doc.text(`Period: ${dateRange.replace('_', ' ').toUpperCase()} | Type: ${reportType.toUpperCase()}`, 14, 36);

    const tableColumn = ["Date", "Type", "Category", "Note", "Amount"];
    const tableRows = [];

    let totalIn = 0;
    let totalOut = 0;

    filteredData.forEach(t => {
      if (t.type === 'income') totalIn += t.amount;
      else totalOut += t.amount;

      const row = [
        format(new Date(t.date), 'MMM dd, yyyy'),
        t.type,
        t.category,
        t.note || '-',
        `${t.type === 'income' ? '+' : '-'}${t.amount}`
      ];
      tableRows.push(row);
    });

    doc.autoTable({
      head: [tableColumn],
      body: tableRows,
      startY: 45,
      styles: { fontSize: 9 },
      headStyles: { fillColor: [79, 70, 229] } // Indigo 600
    });

    const finalY = doc.lastAutoTable.finalY || 45;
    doc.text(`Total Income: ${totalIn}`, 14, finalY + 10);
    doc.text(`Total Expense: ${totalOut}`, 14, finalY + 16);
    doc.text(`Net: ${totalIn - totalOut}`, 14, finalY + 22);

    doc.save(`pocketflow_report_${format(new Date(), 'yyyyMMdd')}.pdf`);
  };

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Reports & Export</h2>
          <p className="text-slate-500 dark:text-slate-400">Generate statements and download your financial data.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Configuration Panel */}
        <div className="md:col-span-1 space-y-6">
          <div className="card-minimal p-6">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center">
              <Filter className="w-5 h-5 mr-2 text-indigo-500" />
              Report Settings
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Report Type</label>
                <CustomSelect 
                  options={[
                    { label: 'All Transactions', value: 'all' },
                    { label: 'Income Only', value: 'income' },
                    { label: 'Expenses Only', value: 'expense' }
                  ]}
                  value={reportType}
                  onChange={(val) => setReportType(val)}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Date Range</label>
                <CustomSelect 
                  options={[
                    { label: 'Today (Daily)', value: 'today' },
                    { label: 'This Week', value: 'this_week' },
                    { label: 'Last Week', value: 'last_week' },
                    { label: 'This Month', value: 'this_month' },
                    { label: 'Last Month', value: 'last_month' },
                    { label: 'This Year', value: 'this_year' },
                    { label: 'All Time', value: 'all_time' }
                  ]}
                  value={dateRange}
                  onChange={(val) => setDateRange(val)}
                />
              </div>
            </div>
            
            <div className="mt-8 p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl border border-indigo-100 dark:border-indigo-900/50">
              <p className="text-sm text-indigo-800 dark:text-indigo-300">
                <strong>{filteredData.length}</strong> transactions found for this period.
              </p>
            </div>
          </div>
        </div>

        {/* Export Options Panel */}
        <div className="md:col-span-2 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            <button 
              onClick={handleExportPDF}
              disabled={filteredData.length === 0}
              className="card-minimal p-6 flex flex-col items-center justify-center text-center hover:border-rose-300 dark:hover:border-rose-700 hover:shadow-rose-500/10 transition-all group disabled:opacity-50 disabled:pointer-events-none"
            >
              <div className="w-16 h-16 rounded-full bg-rose-50 dark:bg-rose-900/30 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <FilePdfIcon className="w-8 h-8 text-rose-500" />
              </div>
              <h4 className="font-bold text-slate-900 dark:text-white">Export as PDF</h4>
              <p className="text-sm text-slate-500 mt-2">Professional formatted document ideal for printing or sharing.</p>
            </button>

            <button 
              onClick={handleExportExcel}
              disabled={filteredData.length === 0}
              className="card-minimal p-6 flex flex-col items-center justify-center text-center hover:border-emerald-300 dark:hover:border-emerald-700 hover:shadow-emerald-500/10 transition-all group disabled:opacity-50 disabled:pointer-events-none"
            >
              <div className="w-16 h-16 rounded-full bg-emerald-50 dark:bg-emerald-900/30 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <FileSpreadsheet className="w-8 h-8 text-emerald-500" />
              </div>
              <h4 className="font-bold text-slate-900 dark:text-white">Export as Excel</h4>
              <p className="text-sm text-slate-500 mt-2">Full spreadsheet with structured data for deep analysis (.xlsx).</p>
            </button>

            <button 
              onClick={handleExportCSV}
              disabled={filteredData.length === 0}
              className="card-minimal p-6 flex flex-col items-center justify-center text-center hover:border-blue-300 dark:hover:border-blue-700 hover:shadow-blue-500/10 transition-all group disabled:opacity-50 disabled:pointer-events-none sm:col-span-2 md:col-span-1"
            >
              <div className="w-16 h-16 rounded-full bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <FileText className="w-8 h-8 text-blue-500" />
              </div>
              <h4 className="font-bold text-slate-900 dark:text-white">Export as CSV</h4>
              <p className="text-sm text-slate-500 mt-2">Simple comma-separated values compatible with any software.</p>
            </button>

          </div>
        </div>

      </div>
    </div>
  );
};

export default Reports;
