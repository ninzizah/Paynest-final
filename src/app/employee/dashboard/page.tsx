
'use client';

import { EmployeeDashboard } from '@/components/employee-dashboard';
import React from 'react';
import { useActiveEmployee } from '@/hooks/use-active-employee';
import useSWR from 'swr';
import { Employee } from '@/lib/data';

const fetcher = (url: string) => fetch(url).then(res => res.json());

export default function DashboardPage() {
  const { activeEmployeeId } = useActiveEmployee();
  const { data: user, error } = useSWR<Employee>(activeEmployeeId ? `/api/employees/${activeEmployeeId}`: null, fetcher);


  if (error) return <div>Failed to load user data</div>
  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Employee Dashboard</h1>
        <p className="text-muted-foreground">Here's a summary of what's happening.</p>
      </div>

      <EmployeeDashboard user={user} />
    </div>
  );
}
