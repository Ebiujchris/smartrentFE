'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { reportsService, OverviewReport as OverviewData } from '@/services/reports.service';
import { Building2, Home, Users, TrendingUp, AlertCircle, Calendar, Loader2 } from 'lucide-react';
import { formatCurrency } from '@/lib/exportUtils';
import { toast } from 'sonner';

export default function OverviewReport() {
  const [data, setData] = useState<OverviewData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const result = await reportsService.getOverview();
      setData(result);
    } catch (error) {
      console.error('Failed to fetch overview:', error);
      toast.error('Failed to load overview report');
    } finally {
      setIsLoading(false);
    }
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

  const stats = [
    {
      title: 'Properties',
      value: data.stats.properties,
      icon: Building2,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
    },
    {
      title: 'Units',
      value: data.stats.units,
      icon: Home,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
    },
    {
      title: 'Tenants',
      value: data.stats.tenants,
      icon: Users,
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-100',
    },
    {
      title: 'Total Revenue',
      value: formatCurrency(data.stats.totalRevenue),
      icon: TrendingUp,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
    },
    {
      title: 'Pending Payments',
      value: data.stats.pendingPayments,
      icon: AlertCircle,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100',
    },
    {
      title: 'Maintenance Requests',
      value: data.stats.maintenanceRequests,
      icon: AlertCircle,
      color: 'text-red-600',
      bgColor: 'bg-red-100',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Subscription Card */}
      <Card className="bg-gradient-to-r from-emerald-500 to-emerald-600 text-white">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <Calendar className="h-5 w-5" />
            Current Subscription
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <p className="text-sm text-emerald-100">Plan</p>
              <p className="text-2xl font-bold">{data.subscription.plan}</p>
            </div>
            <div>
              <p className="text-sm text-emerald-100">Days Remaining</p>
              <p className="text-2xl font-bold">{data.subscription.daysRemaining} days</p>
            </div>
            <div>
              <p className="text-sm text-emerald-100">Expiry Date</p>
              <p className="text-lg font-semibold">
                {new Date(data.subscription.expiryDate).toLocaleDateString()}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600 mb-1">{stat.title}</p>
                  <p className="text-2xl font-bold text-slate-900">{stat.value}</p>
                </div>
                <div className={`${stat.bgColor} p-3 rounded-lg`}>
                  <stat.icon className={`h-6 w-6 ${stat.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
