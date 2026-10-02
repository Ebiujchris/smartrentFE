'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { reportsService, OverviewReport as OverviewData, FinancialReport, PropertyReport, TenantReport, MaintenanceReport, VacancyReport } from '@/services/reports.service';
import { AlertTriangle, ArrowRight, Building2, CheckCircle2, Clock3, Home, Loader2, TrendingUp, Users, Wrench } from 'lucide-react';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { formatCurrency } from '@/lib/exportUtils';
import { toast } from 'sonner';

type OverviewState = {
  overview: OverviewData;
  financial: FinancialReport;
  properties: PropertyReport;
  tenants: TenantReport[];
  maintenance: MaintenanceReport;
  vacancies: VacancyReport[];
};

type ReportTab = 'financial' | 'property' | 'tenant' | 'maintenance' | 'vacancy';

export default function OverviewReport({ onNavigate }: { onNavigate?: (tab: ReportTab) => void }) {
  const [data, setData] = useState<OverviewState | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      reportsService.getOverview(),
      reportsService.getFinancial(),
      reportsService.getProperty(),
      reportsService.getTenant(),
      reportsService.getMaintenance(),
      reportsService.getVacancy(),
    ]).then(([overview, financial, properties, tenants, maintenance, vacancies]) => {
      setData({ overview, financial, properties, tenants, maintenance, vacancies });
    }).catch((error) => {
      console.error('Failed to fetch portfolio overview:', error);
      toast.error('Failed to load portfolio overview');
    }).finally(() => setIsLoading(false));
  }, []);

  if (isLoading) {
    return <div className="flex justify-center items-center py-20"><Loader2 className="h-8 w-8 animate-spin text-emerald-600" /></div>;
  }

  if (!data) {
    return <Card><CardContent className="py-10 text-center text-slate-500">Portfolio data is unavailable. Please try again later.</CardContent></Card>;
  }

  const collectionRate = data.financial.totalExpected > 0
    ? Math.round((data.financial.totalPaid / data.financial.totalExpected) * 100)
    : 0;
  const totalVacantRent = data.vacancies.reduce((total, unit) => total + unit.rentAmount, 0);
  const urgentWork = data.maintenance.requests.filter((request) =>
    ['PENDING', 'IN_PROGRESS'].includes(request.status) && ['URGENT', 'HIGH'].includes(request.priority),
  ).length;
  const overduePayments = data.financial.payments.filter((payment) => payment.status === 'OVERDUE');
  const monthBuckets = Array.from({ length: 6 }, (_, index) => {
    const month = new Date();
    month.setDate(1);
    month.setMonth(month.getMonth() - (5 - index));
    const key = `${month.getFullYear()}-${month.getMonth()}`;
    const amount = data.financial.payments.reduce((total, payment) => {
      if (payment.status !== 'PAID' || !payment.paidDate) return total;
      const paidDate = new Date(payment.paidDate);
      return `${paidDate.getFullYear()}-${paidDate.getMonth()}` === key ? total + payment.amount : total;
    }, 0);
    return { month: month.toLocaleDateString('en', { month: 'short' }), collected: amount };
  });
  const attentionItems = [
    { label: 'Overdue rent', value: overduePayments.length, detail: formatCurrency(data.financial.totalOverdue), tab: 'financial' as const, icon: AlertTriangle, tone: 'text-rose-700 bg-rose-50' },
    { label: 'Vacant units', value: data.vacancies.length, detail: `${formatCurrency(totalVacantRent)} monthly rent at risk`, tab: 'vacancy' as const, icon: Home, tone: 'text-amber-700 bg-amber-50' },
    { label: 'Open maintenance', value: data.overview.pendingMaintenance, detail: `${urgentWork} high or urgent priority`, tab: 'maintenance' as const, icon: Wrench, tone: 'text-orange-700 bg-orange-50' },
    { label: 'Tenants with balances', value: data.tenants.filter((tenant) => tenant.totalDue > 0).length, detail: 'Require payment follow-up', tab: 'tenant' as const, icon: Users, tone: 'text-blue-700 bg-blue-50' },
  ];

  return (
    <div className="space-y-6">
      <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 border-y border-slate-200 bg-white">
        <div className="p-5 sm:border-r border-b sm:border-b-0 border-slate-200">
          <p className="text-sm text-slate-600">Rent collected</p>
          <p className="mt-2 text-2xl font-semibold text-slate-950">{formatCurrency(data.financial.totalPaid)}</p>
          <p className="mt-2 text-sm text-slate-500">{collectionRate}% of recorded rent due</p>
        </div>
        <div className="p-5 xl:border-r border-b sm:border-b-0 border-slate-200">
          <p className="text-sm text-slate-600">Outstanding rent</p>
          <p className="mt-2 text-2xl font-semibold text-amber-700">{formatCurrency(data.financial.totalPending + data.financial.totalOverdue)}</p>
          <p className="mt-2 text-sm text-slate-500">{formatCurrency(data.financial.totalOverdue)} overdue</p>
        </div>
        <div className="p-5 sm:border-r border-slate-200">
          <p className="text-sm text-slate-600">Portfolio occupancy</p>
          <p className="mt-2 text-2xl font-semibold text-slate-950">{data.overview.occupancyRate.toFixed(1)}%</p>
          <p className="mt-2 text-sm text-slate-500">{data.overview.totalUnits - data.overview.vacantUnits} occupied of {data.overview.totalUnits} units</p>
        </div>
        <div className="p-5">
          <p className="text-sm text-slate-600">Monthly vacancy exposure</p>
          <p className="mt-2 text-2xl font-semibold text-rose-700">{formatCurrency(totalVacantRent)}</p>
          <p className="mt-2 text-sm text-slate-500">Across {data.vacancies.length} vacant {data.vacancies.length === 1 ? 'unit' : 'units'}</p>
        </div>
      </section>

      <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1.6fr)_minmax(300px,1fr)] gap-6">
        <Card className="min-w-0">
          <CardHeader className="flex flex-row items-start justify-between gap-3">
            <div><CardTitle>Rent collected</CardTitle><p className="mt-1 text-sm text-slate-500">Paid transactions by payment date, last six months</p></div>
            <Button variant="ghost" size="sm" onClick={() => onNavigate?.('financial')} className="gap-1">Details <ArrowRight className="h-4 w-4" /></Button>
          </CardHeader>
          <CardContent>
            <div className="h-[260px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthBuckets} margin={{ top: 8, right: 8, left: 8, bottom: 0 }}>
                  <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                  <YAxis axisLine={false} tickLine={false} width={72} tick={{ fill: '#64748b', fontSize: 11 }} tickFormatter={(value) => value >= 1000000 ? `${(value / 1000000).toFixed(1)}m` : `${Math.round(value / 1000)}k`} />
                  <Tooltip formatter={(value) => formatCurrency(Number(value))} cursor={{ fill: '#f1f5f9' }} />
                  <Bar dataKey="collected" name="Collected" fill="#0f766e" radius={[3, 3, 0, 0]} maxBarSize={48} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Needs attention</CardTitle><p className="text-sm text-slate-500">Current exceptions across your portfolio</p></CardHeader>
          <CardContent className="space-y-1">
            {attentionItems.map((item) => (
              <button key={item.label} type="button" onClick={() => onNavigate?.(item.tab)} className="flex w-full items-center gap-3 border-b border-slate-100 py-3 text-left last:border-0 hover:bg-slate-50">
                <span className={`grid h-9 w-9 shrink-0 place-items-center rounded-md ${item.tone}`}><item.icon className="h-4 w-4" /></span>
                <span className="min-w-0 flex-1"><span className="block text-sm font-medium text-slate-900">{item.label}</span><span className="block truncate text-xs text-slate-500">{item.detail}</span></span>
                <span className="text-lg font-semibold tabular-nums text-slate-900">{item.value}</span>
              </button>
            ))}
            {attentionItems.every((item) => item.value === 0) && <div className="flex items-center gap-2 py-6 text-sm text-emerald-700"><CheckCircle2 className="h-5 w-5" />No outstanding portfolio exceptions</div>}
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1.6fr)_minmax(300px,1fr)] gap-6">
        <Card>
          <CardHeader className="flex flex-row items-start justify-between gap-3">
            <div><CardTitle>Property performance</CardTitle><p className="mt-1 text-sm text-slate-500">Occupancy and unit-rent potential by property</p></div>
            <Button variant="ghost" size="sm" onClick={() => onNavigate?.('property')} className="gap-1">Properties <ArrowRight className="h-4 w-4" /></Button>
          </CardHeader>
          <CardContent>
            {data.properties.properties.length === 0 ? <p className="py-8 text-center text-sm text-slate-500">No properties to report yet.</p> : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[580px]">
                  <thead><tr className="border-b text-left text-xs uppercase tracking-wide text-slate-500"><th className="pb-3 font-medium">Property</th><th className="pb-3 text-center font-medium">Units</th><th className="pb-3 text-left font-medium">Occupancy</th><th className="pb-3 text-right font-medium">Unit-rent potential</th></tr></thead>
                  <tbody>{data.properties.properties.map((property) => (
                    <tr key={property.id} className="border-b last:border-0">
                      <td className="py-3 pr-3"><span className="block font-medium text-slate-900">{property.name}</span><span className="block text-xs text-slate-500">{property.address}</span></td>
                      <td className="py-3 text-center text-sm">{property.occupiedUnits}/{property.totalUnits}</td>
                      <td className="py-3 pr-5">
                        <div className="flex items-center gap-3"><div className="h-2 min-w-20 flex-1 overflow-hidden rounded-sm bg-slate-100"><div className="h-full bg-teal-700" style={{ width: `${Math.max(0, Math.min(100, property.occupancyRate))}%` }} /></div><span className="w-11 text-right text-sm tabular-nums">{property.occupancyRate}%</span></div>
                      </td>
                      <td className="py-3 text-right text-sm font-medium">{formatCurrency(property.totalRent)}</td>
                    </tr>
                  ))}</tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Portfolio at a glance</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3"><Building2 className="h-4 w-4 text-slate-500" /><span className="flex-1 text-sm text-slate-600">Properties</span><span className="font-semibold tabular-nums">{data.overview.totalProperties}</span></div>
            <div className="flex items-center gap-3"><Home className="h-4 w-4 text-slate-500" /><span className="flex-1 text-sm text-slate-600">Units</span><span className="font-semibold tabular-nums">{data.overview.totalUnits}</span></div>
            <div className="flex items-center gap-3"><Users className="h-4 w-4 text-slate-500" /><span className="flex-1 text-sm text-slate-600">Active tenants</span><span className="font-semibold tabular-nums">{data.overview.totalTenants}</span></div>
            <div className="flex items-center gap-3"><Clock3 className="h-4 w-4 text-slate-500" /><span className="flex-1 text-sm text-slate-600">Pending rent</span><span className="font-semibold tabular-nums">{formatCurrency(data.financial.totalPending)}</span></div>
            <div className="flex items-center gap-3"><TrendingUp className="h-4 w-4 text-slate-500" /><span className="flex-1 text-sm text-slate-600">All-time rent collected</span><span className="font-semibold tabular-nums">{formatCurrency(data.overview.totalRevenue)}</span></div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}