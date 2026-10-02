'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { reportsService, FinancialReport as FinancialData } from '@/services/reports.service';
import { Download, FileSpreadsheet, FileText, Loader2, DollarSign, CheckCircle, Clock, AlertTriangle } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { exportToExcel, exportToPDF, formatCurrency, formatDate } from '@/lib/exportUtils';
import { toast } from 'sonner';

const STATUS_COLORS = {
  PAID: '#10B981',
  PENDING: '#F59E0B',
  OVERDUE: '#EF4444',
};

export default function FinancialReport() {
  const [data, setData] = useState<FinancialData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  useEffect(() => {
    reportsService.getFinancial()
      .then(setData)
      .catch((error) => {
        console.error('Failed to fetch financial report:', error);
        toast.error('Failed to load financial report');
      })
      .finally(() => setIsLoading(false));
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const result = await reportsService.getFinancial(startDate, endDate);
      setData(result);
    } catch (error) {
      console.error('Failed to fetch financial report:', error);
      toast.error('Failed to load financial report');
    } finally {
      setIsLoading(false);
    }
  };

  const handleExportExcel = () => {
    if (!data) return;
    
    const excelData = data.payments.map(p => ({
      'Due Date': formatDate(p.dueDate),
      'Paid Date': p.paidDate ? formatDate(p.paidDate) : '',
      Tenant: p.tenant,
      Property: p.property,
      Unit: p.unit,
      Amount: p.amount,
      Status: p.status,
    }));
    
    exportToExcel(excelData, 'Financial_Report', 'Payments');
    toast.success('Excel file downloaded');
  };

  const handleExportPDF = () => {
    if (!data) return;
    
    const headers = ['Due Date', 'Paid Date', 'Tenant', 'Property', 'Unit', 'Amount', 'Status'];
    const pdfData = data.payments.map(p => [
      formatDate(p.dueDate),
      p.paidDate ? formatDate(p.paidDate) : '-',
      p.tenant,
      p.property,
      p.unit,
      formatCurrency(p.amount),
      p.status,
    ]);
    
    exportToPDF('Financial Report', headers, pdfData, 'Financial_Report');
    toast.success('PDF file downloaded');
  };

  const handlePrint = () => {
    window.print();
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
      </div>
    );
  }

  if (!data) {
    return (
      <Card>
        <CardContent className="py-10 text-center text-slate-500">
          No data available
        </CardContent>
      </Card>
    );
  }

  const statusData = [
    { name: 'Paid', value: data.payments.filter(payment => payment.status === 'PAID').length, color: STATUS_COLORS.PAID },
    { name: 'Pending', value: data.payments.filter(payment => payment.status === 'PENDING').length, color: STATUS_COLORS.PENDING },
    { name: 'Overdue', value: data.payments.filter(payment => payment.status === 'OVERDUE').length, color: STATUS_COLORS.OVERDUE },
  ];
  const monthlyData = Array.from({ length: 6 }, (_, index) => {
    const monthDate = new Date();
    monthDate.setDate(1);
    monthDate.setMonth(monthDate.getMonth() - (5 - index));
    const key = `${monthDate.getFullYear()}-${monthDate.getMonth()}`;
    const payments = data.payments.filter(payment => {
      const dueDate = new Date(payment.dueDate);
      return `${dueDate.getFullYear()}-${dueDate.getMonth()}` === key;
    });

    return {
      month: monthDate.toLocaleDateString('en', { month: 'short' }),
      PAID: payments.filter(payment => payment.status === 'PAID').reduce((total, payment) => total + payment.amount, 0),
      PENDING: payments.filter(payment => payment.status === 'PENDING').reduce((total, payment) => total + payment.amount, 0),
      OVERDUE: payments.filter(payment => payment.status === 'OVERDUE').reduce((total, payment) => total + payment.amount, 0),
    };
  });

  return (
    <div className="space-y-6">
      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filter by Date Range</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="startDate">Due from</Label>
              <Input
                id="startDate"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="endDate">Due through</Label>
              <Input
                id="endDate"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
            <div className="flex items-end">
              <Button onClick={fetchData} className="w-full">
                Apply Filter
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Export Buttons */}
      <div className="flex flex-wrap gap-3">
        <Button onClick={handleExportExcel} variant="outline" className="gap-2">
          <FileSpreadsheet className="h-4 w-4" />
          Export Excel
        </Button>
        <Button onClick={handleExportPDF} variant="outline" className="gap-2">
          <FileText className="h-4 w-4" />
          Export PDF
        </Button>
        <Button onClick={handlePrint} variant="outline" className="gap-2">
          <Download className="h-4 w-4" />
          Print
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 mb-1">Total Collected</p>
                <p className="text-xl font-bold text-slate-900">
                  {formatCurrency(data.totalPaid)}
                </p>
              </div>
              <div className="bg-green-100 p-3 rounded-lg">
                <DollarSign className="h-5 w-5 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 mb-1">Pending</p>
                <p className="text-xl font-bold text-orange-600">{formatCurrency(data.totalPending)}</p>
              </div>
              <div className="bg-green-100 p-3 rounded-lg">
                <CheckCircle className="h-5 w-5 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 mb-1">Overdue</p>
                <p className="text-xl font-bold text-red-600">{formatCurrency(data.totalOverdue)}</p>
              </div>
              <div className="bg-orange-100 p-3 rounded-lg">
                <Clock className="h-5 w-5 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 mb-1">Recorded rent due</p>
                <p className="text-xl font-bold text-slate-900">{formatCurrency(data.totalExpected)}</p>
              </div>
              <div className="bg-red-100 p-3 rounded-lg">
                <AlertTriangle className="h-5 w-5 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Rent due by month</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value) => formatCurrency(Number(value ?? 0))} />
                <Legend />
                <Bar dataKey="PAID" stackId="rent" fill={STATUS_COLORS.PAID} name="Paid" />
                <Bar dataKey="PENDING" stackId="rent" fill={STATUS_COLORS.PENDING} name="Pending" />
                <Bar dataKey="OVERDUE" stackId="rent" fill={STATUS_COLORS.OVERDUE} name="Overdue" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Payment Status Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={(entry) => `${entry.name}: ${entry.value}`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Payments Table */}
      <Card>
        <CardHeader>
          <CardTitle>Payment Details</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-3 text-sm font-semibold text-slate-700">Due date</th>
                  <th className="text-left p-3 text-sm font-semibold text-slate-700">Tenant</th>
                  <th className="text-left p-3 text-sm font-semibold text-slate-700">Property</th>
                  <th className="text-left p-3 text-sm font-semibold text-slate-700">Unit</th>
                  <th className="text-right p-3 text-sm font-semibold text-slate-700">Amount</th>
                  <th className="text-center p-3 text-sm font-semibold text-slate-700">Status</th>
                </tr>
              </thead>
              <tbody>
                {data.payments.map((payment) => (
                  <tr key={payment.id} className="border-b hover:bg-slate-50">
                    <td className="p-3 text-sm">{formatDate(payment.dueDate)}</td>
                    <td className="p-3 text-sm">{payment.tenant}</td>
                    <td className="p-3 text-sm">{payment.property}</td>
                    <td className="p-3 text-sm">{payment.unit}</td>
                    <td className="p-3 text-sm text-right font-medium">
                      {formatCurrency(payment.amount)}
                    </td>
                    <td className="p-3 text-center">
                      <span
                        className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                          payment.status === 'PAID'
                            ? 'bg-green-100 text-green-700'
                            : payment.status === 'PENDING'
                            ? 'bg-orange-100 text-orange-700'
                            : 'bg-red-100 text-red-700'
                        }`}
                      >
                        {payment.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
