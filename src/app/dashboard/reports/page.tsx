'use client';

import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart3, TrendingUp, Building2, Users, Wrench, Home } from 'lucide-react';
import FinancialReport from '@/components/reports/FinancialReport';
import PropertyReport from '@/components/reports/PropertyReport';
import TenantReport from '@/components/reports/TenantReport';
import MaintenanceReport from '@/components/reports/MaintenanceReport';
import VacancyReport from '@/components/reports/VacancyReport';
import OverviewReport from '@/components/reports/OverviewReport';

export default function ReportsPage() {
  const [activeTab, setActiveTab] = useState('overview');

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Reports & Analytics</h1>
        <p className="text-slate-600">
          Comprehensive insights into your rental business performance
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid grid-cols-6 w-full h-auto p-1 bg-slate-100">
          <TabsTrigger value="overview" className="flex flex-col items-center gap-1 py-3">
            <BarChart3 className="h-5 w-5" />
            <span className="text-xs">Overview</span>
          </TabsTrigger>
          <TabsTrigger value="financial" className="flex flex-col items-center gap-1 py-3">
            <TrendingUp className="h-5 w-5" />
            <span className="text-xs">Financial</span>
          </TabsTrigger>
          <TabsTrigger value="property" className="flex flex-col items-center gap-1 py-3">
            <Building2 className="h-5 w-5" />
            <span className="text-xs">Properties</span>
          </TabsTrigger>
          <TabsTrigger value="tenant" className="flex flex-col items-center gap-1 py-3">
            <Users className="h-5 w-5" />
            <span className="text-xs">Tenants</span>
          </TabsTrigger>
          <TabsTrigger value="maintenance" className="flex flex-col items-center gap-1 py-3">
            <Wrench className="h-5 w-5" />
            <span className="text-xs">Maintenance</span>
          </TabsTrigger>
          <TabsTrigger value="vacancy" className="flex flex-col items-center gap-1 py-3">
            <Home className="h-5 w-5" />
            <span className="text-xs">Vacancies</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <OverviewReport />
        </TabsContent>

        <TabsContent value="financial">
          <FinancialReport />
        </TabsContent>

        <TabsContent value="property">
          <PropertyReport />
        </TabsContent>

        <TabsContent value="tenant">
          <TenantReport />
        </TabsContent>

        <TabsContent value="maintenance">
          <MaintenanceReport />
        </TabsContent>

        <TabsContent value="vacancy">
          <VacancyReport />
        </TabsContent>
      </Tabs>
    </div>
  );
}
