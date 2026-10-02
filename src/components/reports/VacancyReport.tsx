'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { reportsService, VacancyReport as VacancyData } from '@/services/reports.service';
import { FileSpreadsheet, FileText, Download, Loader2, Eye, Home, Megaphone } from 'lucide-react';
import { exportToExcel, exportToPDF, formatCurrency } from '@/lib/exportUtils';
import { toast } from 'sonner';

export default function VacancyReport() {
  const [data, setData] = useState<VacancyData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    reportsService.getVacancy()
      .then(setData)
      .catch((error) => {
        console.error('Failed to fetch vacancy report:', error);
        toast.error('Failed to load vacancy report');
      })
      .finally(() => setIsLoading(false));
  }, []);

  const lostMonthlyRent = data.reduce((total, unit) => total + unit.rentAmount, 0);
  const totalViews = data.reduce((total, unit) => total + unit.listingViews, 0);

  const handleExportExcel = () => {
    exportToExcel(data.map((unit) => ({
      Property: unit.property,
      Unit: unit.unitNumber,
      Bedrooms: unit.bedrooms,
      Bathrooms: unit.bathrooms,
      'Monthly Rent at Risk': unit.rentAmount,
      'Listing Active': unit.listingActive ? 'Yes' : 'No',
      'Listing Views': unit.listingViews,
    })), 'Vacancy_Report', 'Vacant Units');
    toast.success('Excel file downloaded');
  };

  const handleExportPDF = () => {
    exportToPDF('Vacancy Report', ['Property', 'Unit', 'Beds / Baths', 'Monthly Rent', 'Listing', 'Views'], data.map((unit) => [
      unit.property,
      unit.unitNumber,
      `${unit.bedrooms} / ${unit.bathrooms}`,
      formatCurrency(unit.rentAmount),
      unit.listingActive ? 'Active' : unit.hasListing ? 'Inactive' : 'Not listed',
      unit.listingViews.toString(),
    ]), 'Vacancy_Report');
    toast.success('PDF file downloaded');
  };

  if (isLoading) {
    return <div className="flex justify-center items-center py-20"><Loader2 className="h-8 w-8 animate-spin text-emerald-600" /></div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-3">
        <Button onClick={handleExportExcel} variant="outline" className="gap-2" disabled={!data.length}><FileSpreadsheet className="h-4 w-4" /> Export Excel</Button>
        <Button onClick={handleExportPDF} variant="outline" className="gap-2" disabled={!data.length}><FileText className="h-4 w-4" /> Export PDF</Button>
        <Button onClick={() => window.print()} variant="outline" className="gap-2"><Download className="h-4 w-4" /> Print</Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card><CardContent className="pt-6"><p className="text-sm text-slate-600 mb-1">Vacant units</p><p className="text-2xl font-bold">{data.length}</p></CardContent></Card>
        <Card><CardContent className="pt-6"><p className="text-sm text-slate-600 mb-1">Monthly rent at risk</p><p className="text-2xl font-bold text-amber-700">{formatCurrency(lostMonthlyRent)}</p></CardContent></Card>
        <Card><CardContent className="pt-6"><p className="text-sm text-slate-600 mb-1">Active listings</p><p className="text-2xl font-bold text-emerald-700">{data.filter((unit) => unit.listingActive).length} / {data.length}</p></CardContent></Card>
      </div>

      <Card>
        <CardHeader><CardTitle className="flex items-center justify-between gap-3"><span className="flex items-center gap-2"><Home className="h-5 w-5" />Vacant units</span><span className="text-sm font-normal text-slate-500">{totalViews} listing views</span></CardTitle></CardHeader>
        <CardContent>
          {data.length === 0 ? <p className="py-8 text-center text-slate-500">All units are currently occupied.</p> : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[680px]">
                <thead><tr className="border-b text-left text-sm text-slate-600"><th className="p-3 font-semibold">Property / Unit</th><th className="p-3 text-center font-semibold">Configuration</th><th className="p-3 text-right font-semibold">Monthly rent</th><th className="p-3 text-center font-semibold">Listing status</th><th className="p-3 text-right font-semibold">Views</th></tr></thead>
                <tbody>{data.map((unit) => (
                  <tr key={unit.id} className="border-b last:border-0 hover:bg-slate-50">
                    <td className="p-3"><p className="font-medium">{unit.property}</p><p className="text-sm text-slate-500">Unit {unit.unitNumber}</p></td>
                    <td className="p-3 text-center">{unit.bedrooms} bd <span className="text-slate-400">/</span> {unit.bathrooms} ba</td>
                    <td className="p-3 text-right font-medium">{formatCurrency(unit.rentAmount)}</td>
                    <td className="p-3 text-center"><span className={`inline-flex items-center gap-1.5 text-sm ${unit.listingActive ? 'text-emerald-700' : 'text-amber-700'}`}><Megaphone className="h-4 w-4" />{unit.listingActive ? 'Active' : unit.hasListing ? 'Inactive' : 'Not listed'}</span></td>
                    <td className="p-3 text-right"><span className="inline-flex items-center justify-end gap-1.5"><Eye className="h-4 w-4 text-slate-400" />{unit.listingViews}</span></td>
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