'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { reportsService, PropertyReport as PropertyData } from '@/services/reports.service';
import { Download, FileSpreadsheet, FileText, Loader2 } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { exportToExcel, exportToPDF, formatCurrency, formatPercentage } from '@/lib/exportUtils';
import { toast } from 'sonner';

export default function PropertyReport() {
  const [data, setData] = useState<PropertyData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const result = await reportsService.getProperty();
      setData(result);
    } catch (error) {
      console.error('Failed to fetch property report:', error);
      toast.error('Failed to load property report');
    } finally {
      setIsLoading(false);
    }
  };

  const handleExportExcel = () => {
    if (!data || !data.properties) return;
    const excelData = data.properties.map(p => ({
      Property: p.name,
      Address: p.address,
      'Total Units': p.totalUnits,
      'Occupied': p.occupiedUnits,
      'Vacant': p.vacantUnits,
      'Occupancy Rate': `${p.occupancyRate}%`,
      'Total Rent': p.totalRent,
      'Collected Rent': p.collectedRent,
    }));
    exportToExcel(excelData, 'Property_Report', 'Properties');
    toast.success('Excel file downloaded');
  };

  const handleExportPDF = () => {
    if (!data || !data.properties) return;
    const headers = ['Property', 'Total Units', 'Occupied', 'Vacant', 'Occupancy', 'Total Rent'];
    const pdfData = data.properties.map(p => [
      p.name,
      p.totalUnits.toString(),
      p.occupiedUnits.toString(),
      p.vacantUnits.toString(),
      `${p.occupancyRate}%`,
      formatCurrency(p.totalRent),
    ]);
    exportToPDF('Property Report', headers, pdfData, 'Property_Report');
    toast.success('PDF file downloaded');
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
      </div>
    );
  }

  if (!data || !data.properties || !data.summary) {
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
            <p className="text-sm text-slate-600 mb-1">Total Properties</p>
            <p className="text-2xl font-bold">{data.summary.totalProperties}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-slate-600 mb-1">Total Units</p>
            <p className="text-2xl font-bold">{data.summary.totalUnits}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-slate-600 mb-1">Occupied Units</p>
            <p className="text-2xl font-bold text-green-600">{data.summary.totalOccupied}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-slate-600 mb-1">Overall Occupancy</p>
            <p className="text-2xl font-bold text-emerald-600">{data.summary.overallOccupancy}%</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Occupancy Rate by Property</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data.properties}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="occupancyRate" fill="#10B981" name="Occupancy %" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Property Details</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-3 text-sm font-semibold">Property</th>
                  <th className="text-center p-3 text-sm font-semibold">Total Units</th>
                  <th className="text-center p-3 text-sm font-semibold">Occupied</th>
                  <th className="text-center p-3 text-sm font-semibold">Vacant</th>
                  <th className="text-center p-3 text-sm font-semibold">Occupancy</th>
                  <th className="text-right p-3 text-sm font-semibold">Total Rent</th>
                </tr>
              </thead>
              <tbody>
                {data.properties.map((property) => (
                  <tr key={property.id} className="border-b hover:bg-slate-50">
                    <td className="p-3">
                      <div>
                        <p className="font-medium">{property.name}</p>
                        <p className="text-sm text-slate-500">{property.address}</p>
                      </div>
                    </td>
                    <td className="p-3 text-center">{property.totalUnits}</td>
                    <td className="p-3 text-center text-green-600">{property.occupiedUnits}</td>
                    <td className="p-3 text-center text-orange-600">{property.vacantUnits}</td>
                    <td className="p-3 text-center">
                      <span className={`font-semibold ${property.occupancyRate >= 80 ? 'text-green-600' : property.occupancyRate >= 50 ? 'text-orange-600' : 'text-red-600'}`}>
                        {property.occupancyRate}%
                      </span>
                    </td>
                    <td className="p-3 text-right font-medium">{formatCurrency(property.totalRent)}</td>
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
