'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { reportsService, TenantReport as TenantData } from '@/services/reports.service';
import { FileSpreadsheet, FileText, Download, Loader2 } from 'lucide-react';
import { exportToExcel, exportToPDF, formatCurrency, formatDate } from '@/lib/exportUtils';
import { toast } from 'sonner';

export default function TenantReport() {
  const [data, setData] = useState<TenantData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const result = await reportsService.getTenant();
      setData(result);
    } catch (error) {
      console.error('Failed to fetch tenant report:', error);
      toast.error('Failed to load tenant report');
    } finally {
      setIsLoading(false);
    }
  };

  const handleExportExcel = () => {
    if (!data) return;
    const excelData = data.tenants.map(t => ({
      Name: t.name,
      Email: t.email,
      Phone: t.phone,
      Property: t.property,
      Unit: t.unit,
      'Lease Start': formatDate(t.leaseStart),
      'Lease End': formatDate(t.leaseEnd),
      'Total Payments': t.totalPayments,
      'Paid': t.paidPayments,
      'Late': t.latePayments,
      'Total Paid': t.totalPaid,
    }));
    exportToExcel(excelData, 'Tenant_Report', 'Tenants');
    toast.success('Excel file downloaded');
  };

  const handleExportPDF = () => {
    if (!data) return;
    const headers = ['Name', 'Phone', 'Property', 'Unit', 'Paid Payments', 'Total Paid'];
    const pdfData = data.tenants.map(t => [
      t.name,
      t.phone,
      t.property,
      t.unit,
      t.paidPayments.toString(),
      formatCurrency(t.totalPaid),
    ]);
    exportToPDF('Tenant Report', headers, pdfData, 'Tenant_Report');
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

  return (
    <div className="space-y-6">
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

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-slate-600 mb-1">Total Tenants</p>
            <p className="text-2xl font-bold">{data.summary.totalTenants}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-slate-600 mb-1">Active Tenants</p>
            <p className="text-2xl font-bold text-green-600">{data.summary.activeTenants}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-slate-600 mb-1">Inactive Tenants</p>
            <p className="text-2xl font-bold text-slate-400">{data.summary.inactiveTenants}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Tenant Details</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-3 text-sm font-semibold">Tenant</th>
                  <th className="text-left p-3 text-sm font-semibold">Property / Unit</th>
                  <th className="text-center p-3 text-sm font-semibold">Lease Period</th>
                  <th className="text-center p-3 text-sm font-semibold">Payments</th>
                  <th className="text-right p-3 text-sm font-semibold">Total Paid</th>
                </tr>
              </thead>
              <tbody>
                {data.tenants.map((tenant) => (
                  <tr key={tenant.id} className="border-b hover:bg-slate-50">
                    <td className="p-3">
                      <div>
                        <p className="font-medium">{tenant.name}</p>
                        <p className="text-sm text-slate-500">{tenant.phone}</p>
                      </div>
                    </td>
                    <td className="p-3">
                      <div>
                        <p className="font-medium">{tenant.property}</p>
                        <p className="text-sm text-slate-500">Unit {tenant.unit}</p>
                      </div>
                    </td>
                    <td className="p-3 text-center text-sm">
                      <div>
                        <p>{formatDate(tenant.leaseStart)}</p>
                        <p className="text-slate-500">to</p>
                        <p>{formatDate(tenant.leaseEnd)}</p>
                      </div>
                    </td>
                    <td className="p-3 text-center">
                      <div className="text-sm">
                        <p><span className="text-green-600 font-semibold">{tenant.paidPayments}</span> paid</p>
                        {tenant.latePayments > 0 && (
                          <p><span className="text-red-600 font-semibold">{tenant.latePayments}</span> late</p>
                        )}
                      </div>
                    </td>
                    <td className="p-3 text-right font-medium">{formatCurrency(tenant.totalPaid)}</td>
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
