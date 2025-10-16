'use client';

import * as React from 'react';
import { EmployeesClient } from './components/client';

export default function EmployeesPage() {
  return (
    <div className="space-y-6">
      <div>
          <h1 className="text-3xl font-bold tracking-tight">Employees</h1>
          <p className="text-muted-foreground">
            Manage all employee accounts and their information.
          </p>
      </div>
      <EmployeesClient 
        currentUserRole="admin"
      />
    </div>
  );
}
