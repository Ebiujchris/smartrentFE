'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { reportsService, MaintenanceReport as MaintenanceData } from '@/services/reports.service';
import { FileSpreadsheet, FileText, Download, Loader2 } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { exportToExcel, exportToPDF, formatDate } from '@/lib/exportUtils';
import { toast } from 'sonner';

const STATUS_COLORS: Record<string, string> = {
  PENDING: '#F59E0B',
  IN_PROGRESS: '#3B82F6',
  COMPLETED: '#10B981',
  CANCELLED: '#6B7280',
};

export default function MaintenanceReport() {
  const [data, setData] = useState<MaintenanceData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const result = await reportsService.getMaintenance(startDate, endDate);
      setData(result);
    } catch (error) {
      console.error('Failed to fetch maintenance report:', error);
      toast.error('Failed to load maintenance report');
    } finally {
      setIsLoading(false);
    }
  };

  const handleExportExcel = () => {
    if (!data) return;
    const excelData = data.requests.map(r => ({
      Title: r.title,
      Description: r.description,
      Status: r.status,
      Priority: r.priority,
      Tenant: r.tenant,
      Property: r.property,
      Unit: r.unit,
      'Created': formatDate(r.createdAt),
      'Resolved': r.resolvedAt ? formatDate(r.resolvedAt) : 'N/A',
    }));
    exportToExcel(excelData, 'Maintenance_Report', 'Requests');
    toast.success('Excel file downloaded');
  };

  const handleExportPDF = () => {
    if (!data) return;
    const headers = ['Title', 'Status', 'Priority', 'Property', 'Unit', 'Created'];
    const pdfData = data.requests.map(r => [
      r.title,
      r.status,
      r.priority,
      r.property,
      r.unit,
      formatDate(r.createdAt),
    ]);
    exportToPDF('Maintenance Report', headers, pdfData, 'Maintenance_Report');
    toast.success('PDF file downloaded');
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
      </div>
    );
  }

  if (!data) {
    return <Card><CardContent className="py-10 text-center text-slate-500">No data available</CardContent></Card>;
  }

  const chartData = [
    { name: 'Pending', value: data.summary.pending, color: STATUS_COLORS.PENDING },
    { name: 'In Progress', value: data.summary.inProgress, color: STATUS_COLORS.IN_PROGRESS },
    { name: 'Completed', value: data.summary.completed, color: STATUS_COLORS.COMPLETED },
    { name: 'Cancelled', value: data.summary.cancelled, color: STATUS_COLORS.CANCELLED },
  ].filter(item => item.value > 0);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Filter by Date Range</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="startDate">Start Date</Label>
              <Input
                id="startDate"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="endDate">End Date</Label>
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

      <div className="flex flex-wrap gap-3">
        <Button onClick={handleExportExcel} variant="outline" className="gap-2">
          <FileSpreadsheet className="h-4 w-4" />
          Export Excel
        </Button>
        <Button onClick={handleExportPDF} variant="outline" className="gap-2">
          <FileText className="h-4 w-4" />
          Export PDF
        </Button>
        <Button onClick={() => window.print()} variant="outline" className="gap-2">
          <Download className="h-4 w-4" />
          Print
        </Button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-slate-600 mb-1">Total</p>
            <p className="text-2xl font-bold">{data.summary.total}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-slate-600 mb-1">Pending</p>
            <p className="text-2xl font-bold text-orange-600">{data.summary.pending}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-slate-600 mb-1">In Progress</p>
            <p className="text-2xl font-bold text-blue-600">{data.summary.inProgress}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-slate-600 mb-1">Completed</p>
            <p className="text-2xl font-bold text-green-600">{data.summary.completed}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-slate-600 mb-1">Avg Resolution</p>
            <p className="text-2xl font-bold">{data.summary.avgResolutionDays}d</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Status Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={(entry) => `${entry.name}: ${entry.value}`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Maintenance Requests</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-3 text-sm font-semibold">Title</th>
                  <th className="text-left p-3 text-sm font-semibold">Property / Unit</th>
                  <th className="text-center p-3 text-sm font-semibold">Priority</th>
                  <th className="text-center p-3 text-sm font-semibold">Status</th>
                  <th className="text-left p-3 text-sm font-semibold">Created</th>
                </tr>
              </thead>
              <tbody>
                {data.requests.map((request) => (
                  <tr key={request.id} className="border-b hover:bg-slate-50">
                    <td className="p-3">
                      <div>
                        <p className="font-medium">{request.title}</p>
                        <p className="text-sm text-slate-500">{request.tenant}</p>
                      </div>
                    </td>
                    <td className="p-3">
                      <div>
                        <p className="font-medium">{request.property}</p>
                        <p className="text-sm text-slate-500">Unit {request.unit}</p>
                      </div>
                    </td>
                    <td className="p-3 text-center">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        request.priority === 'HIGH' ? 'bg-red-100 text-red-700' :
                        request.priority === 'MEDIUM' ? 'bg-orange-100 text-orange-700' :
                        'bg-green-100 text-green-700'
                      }`}>
                        {request.priority}
                      </span>
                    </td>
                    <td className="p-3 text-center">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        request.status === 'COMPLETED' ? 'bg-green-100 text-green-700' :
                        request.status === 'IN_PROGRESS' ? 'bg-blue-100 text-blue-700' :
                        request.status === 'CANCELLED' ? 'bg-slate-100 text-slate-700' :
                        'bg-orange-100 text-orange-700'
                      }`}>
                        {request.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="p-3 text-sm">{formatDate(request.createdAt)}</td>
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
