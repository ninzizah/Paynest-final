'use client';

import { AdminDashboard } from '@/components/admin-dashboard';

export default function DashboardPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
        <p className="text-muted-foreground">Here's a summary of what's happening.</p>
      </div>

      <AdminDashboard />
    </div>
  );
}
