'use client';

import * as React from 'react';
import { DepartmentsClient } from '@/app/admin/departments/components/client';
import { getDepartments } from '@/lib/api';

export default function DepartmentsPage() {
  const departments = getDepartments();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Departments</h1>
          <p className="text-muted-foreground">
            Manage your organization's departments.
          </p>
        </div>
      </div>
      <DepartmentsClient data={departments} />
    </div>
  );
}
