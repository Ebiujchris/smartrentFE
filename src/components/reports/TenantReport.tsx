'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { reportsService, TenantReport as TenantData } from '@/services/reports.service';
import { FileSpreadsheet, FileText, Download, Loader2, Users } from 'lucide-react';
import { exportToExcel, exportToPDF, formatCurrency, formatDate } from '@/lib/exportUtils';
import { toast } from 'sonner';

export default function TenantReport() {
  const [data, setData] = useState<TenantData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    reportsService.getTenant()
      .then(setData)
      .catch((error) => {
        console.error('Failed to fetch tenant report:', error);
        toast.error('Failed to load tenant report');
      })
      .finally(() => setIsLoading(false));
  }, []);

  const handleExportExcel = () => {
    const excelData = data.map((tenant) => ({
      Name: tenant.name,
      Email: tenant.email,
      Phone: tenant.phone,
      Property: tenant.property,
      Unit: tenant.unit,
      'Monthly Rent': tenant.rentAmount,
      'Lease Start': formatDate(tenant.leaseStart),
      'Lease End': formatDate(tenant.leaseEnd),
      'Total Paid': tenant.totalPaid,
      'Outstanding Rent': tenant.totalDue,
      'Payment Status': tenant.paymentStatus,
    }));
    exportToExcel(excelData, 'Tenant_Report', 'Tenants');
    toast.success('Excel file downloaded');
  };

  const handleExportPDF = () => {
    const headers = ['Tenant', 'Property / Unit', 'Monthly Rent', 'Outstanding', 'Status'];
    const pdfData = data.map((tenant) => [
      tenant.name,
      `${tenant.property} / ${tenant.unit}`,
      formatCurrency(tenant.rentAmount),
      formatCurrency(tenant.totalDue),
      tenant.paymentStatus,
    ]);
    exportToPDF('Tenant Report', headers, pdfData, 'Tenant_Report');
    toast.success('PDF file downloaded');
  };

  if (isLoading) {
    return <div className="flex justify-center items-center py-20"><Loader2 className="h-8 w-8 animate-spin text-emerald-600" /></div>;
  }

  const upToDate = data.filter((tenant) => tenant.totalDue <= 0).length;
  const tenantsWithDues = data.length - upToDate;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-3">
        <Button onClick={handleExportExcel} variant="outline" className="gap-2" disabled={!data.length}>
          <FileSpreadsheet className="h-4 w-4" /> Export Excel
        </Button>
        <Button onClick={handleExportPDF} variant="outline" className="gap-2" disabled={!data.length}>
          <FileText className="h-4 w-4" /> Export PDF
        </Button>
        <Button onClick={() => window.print()} variant="outline" className="gap-2">
          <Download className="h-4 w-4" /> Print
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card><CardContent className="pt-6"><p className="text-sm text-slate-600 mb-1">Active tenants</p><p className="text-2xl font-bold">{data.length}</p></CardContent></Card>
        <Card><CardContent className="pt-6"><p className="text-sm text-slate-600 mb-1">Up to date</p><p className="text-2xl font-bold text-emerald-700">{upToDate}</p></CardContent></Card>
        <Card><CardContent className="pt-6"><p className="text-sm text-slate-600 mb-1">With outstanding rent</p><p className="text-2xl font-bold text-amber-700">{tenantsWithDues}</p></CardContent></Card>
      </div>

      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><Users className="h-5 w-5" />Tenant ledger</CardTitle></CardHeader>
        <CardContent>
          {data.length === 0 ? <p className="py-8 text-center text-slate-500">No active tenants to report.</p> : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[760px]">
                <thead><tr className="border-b text-left text-sm text-slate-600">
                  <th className="p-3 font-semibold">Tenant</th><th className="p-3 font-semibold">Property / Unit</th><th className="p-3 text-right font-semibold">Monthly rent</th><th className="p-3 text-right font-semibold">Total paid</th><th className="p-3 text-right font-semibold">Outstanding</th><th className="p-3 text-center font-semibold">Lease ends</th>
                </tr></thead>
                <tbody>{data.map((tenant) => (
                  <tr key={tenant.id} className="border-b last:border-0 hover:bg-slate-50">
                    <td className="p-3"><p className="font-medium text-slate-900">{tenant.name}</p><p className="text-sm text-slate-500">{tenant.email}</p></td>
                    <td className="p-3"><p>{tenant.property}</p><p className="text-sm text-slate-500">Unit {tenant.unit}</p></td>
                    <td className="p-3 text-right">{formatCurrency(tenant.rentAmount)}</td>
                    <td className="p-3 text-right">{formatCurrency(tenant.totalPaid)}</td>
                    <td className={`p-3 text-right font-medium ${tenant.totalDue > 0 ? 'text-amber-700' : 'text-slate-500'}`}>{formatCurrency(tenant.totalDue)}</td>
                    <td className="p-3 text-center text-sm">{formatDate(tenant.leaseEnd)}</td>
                  </tr>
                ))}</tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}