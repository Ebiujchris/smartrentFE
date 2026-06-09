'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { reportsService, VacancyReport as VacancyData } from '@/services/reports.service';
import { FileSpreadsheet, FileText, Download, Loader2, Eye } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { exportToExcel, exportToPDF, formatCurrency, formatDate } from '@/lib/exportUtils';
import { toast } from 'sonner';

export default function VacancyReport() {
  const [data, setData] = useState<VacancyData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const result = await reportsService.getVacancy();
      setData(result);
    } catch (error) {
      console.error('Failed to fetch vacancy report:', error);
      toast.error('Failed to load vacancy report');
    } finally {
      setIsLoading(false);
    }
  };

  const handleExportExcel = () => {
    if (!data) return;
    const excelData = data.listings.map(l => ({
      Title: l.title,
      Property: l.property,
      Unit: l.unit,
      Rent: l.rent,
      Views: l.views,
      'Posted Date': formatDate(l.postedDate),
      Status: l.status,
    }));
    exportToExcel(excelData, 'Vacancy_Report', 'Listings');
    toast.success('Excel file downloaded');
  };

  const handleExportPDF = () => {
    if (!data) return;
    const headers = ['Title', 'Property', 'Unit', 'Rent', 'Views', 'Status'];
    const pdfData = data.listings.map(l => [
      l.title,
      l.property,
      l.unit,
      formatCurrency(l.rent),
      l.views.toString(),
      l.status,
    ]);
    exportToPDF('Vacancy Report', headers, pdfData, 'Vacancy_Report');
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

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-slate-600 mb-1">Total Listings</p>
            <p className="text-2xl font-bold">{data.summary.totalListings}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-slate-600 mb-1">Active Listings</p>
            <p className="text-2xl font-bold text-green-600">{data.summary.activeListings}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-slate-600 mb-1">Total Views</p>
            <p className="text-2xl font-bold text-blue-600">{data.summary.totalViews}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-slate-600 mb-1">Avg Views</p>
            <p className="text-2xl font-bold">{data.summary.avgViews}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Views per Listing</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data.listings}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="title" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="views" fill="#3B82F6" name="Views" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Vacancy Listings</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-3 text-sm font-semibold">Title</th>
                  <th className="text-left p-3 text-sm font-semibold">Property / Unit</th>
                  <th className="text-right p-3 text-sm font-semibold">Rent</th>
                  <th className="text-center p-3 text-sm font-semibold">Views</th>
                  <th className="text-center p-3 text-sm font-semibold">Status</th>
                  <th className="text-left p-3 text-sm font-semibold">Posted</th>
                </tr>
              </thead>
              <tbody>
                {data.listings.map((listing) => (
                  <tr key={listing.id} className="border-b hover:bg-slate-50">
                    <td className="p-3 font-medium">{listing.title}</td>
                    <td className="p-3">
                      <div>
                        <p className="font-medium">{listing.property}</p>
                        <p className="text-sm text-slate-500">Unit {listing.unit}</p>
                      </div>
                    </td>
                    <td className="p-3 text-right font-medium">{formatCurrency(listing.rent)}</td>
                    <td className="p-3 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <Eye className="h-4 w-4 text-slate-400" />
                        <span className="font-semibold">{listing.views}</span>
                      </div>
                    </td>
                    <td className="p-3 text-center">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        listing.status === 'ACTIVE' 
                          ? 'bg-green-100 text-green-700' 
                          : 'bg-slate-100 text-slate-700'
                      }`}>
                        {listing.status}
                      </span>
                    </td>
                    <td className="p-3 text-sm">{formatDate(listing.postedDate)}</td>
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
