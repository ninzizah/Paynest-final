/**
 * @file This file is the central API layer for all data operations.
 * It abstracts the data source (currently mock data) from the UI components.
 * When you're ready to connect to a real database (like MongoDB), you will
 * only need to modify the functions in this file.
 */

import { format } from 'date-fns';
import type { DateRange } from 'react-day-picker';
import { 
    employees as initialEmployees, 
    departments as initialDepartments, 
    payrollRuns as initialPayrollRuns, 
    salaryAdvances as initialSalaryAdvances, 
    leaveRequests as initialLeaveRequests,
    MOCK_USERS,
    type Employee,
    type Department,
    type PayrollRun,
    type SalaryAdvance,
    type LeaveRequest,
    type Payslip,
    payslips as allPayslips
} from './data';

// Note: In a real application, these arrays would be replaced by database calls.
// For this mock API, we allow mutations on these arrays.

// --- Employees ---
export function getEmployees() {
  return initialEmployees;
}

export function getEmployeeById(id: string) {
  return initialEmployees.find(e => e.id === id);
}

export function addEmployee(employeeData: Omit<Employee, 'id' | 'status' | 'hireDate'> & {hireDate?: string; phone: string}): Employee {
    const newEmployee: Employee = {
        id: `EMP${Date.now()}${Math.random().toString(36).substring(2, 9)}`,
        status: 'Active',
        ...employeeData,
        hireDate: employeeData.hireDate || format(new Date(), 'yyyy-MM-dd'),
    };
    initialEmployees.push(newEmployee);
    return newEmployee;
}

export function updateEmployee(id: string, updates: Partial<Employee>): Employee | undefined {
    const index = initialEmployees.findIndex(e => e.id === id);
    if (index !== -1) {
        initialEmployees[index] = { ...initialEmployees[index], ...updates };
        return initialEmployees[index];
    }
    return undefined;
}


// --- Departments ---

export function getDepartments(): Department[] {
    return initialDepartments;
}

export function getDepartmentById(id: string) {
    return initialDepartments.find(d => d.id === id);
}

export function addDepartment(deptData: { name: string, head: string }): Department {
    const newDepartment: Department = {
        id: `DEP${Date.now()}${Math.random().toString(36).substring(2, 5)}`,
        employeeCount: 0,
        ...deptData,
    };
    initialDepartments.push(newDepartment);
    return newDepartment;
}

export function updateDepartment(id: string, updates: Partial<Department>): Department | undefined {
    const index = initialDepartments.findIndex(d => d.id === id);
    if (index !== -1) {
        initialDepartments[index] = { ...initialDepartments[index], ...updates };
        return initialDepartments[index];
    }
    return undefined;
}

export function deleteDepartment(id: string): { success: boolean } {
    const index = initialDepartments.findIndex(d => d.id === id);
    if (index !== -1) {
        initialDepartments.splice(index, 1);
        return { success: true };
    }
    return { success: false };
}


// --- Payroll ---

export function getPayrollRuns(): PayrollRun[] {
    return initialPayrollRuns;
}

export function getPayrollRunDetails(runId: string) {
  const run = initialPayrollRuns.find(r => r.id === runId);
  if (!run) return null;

  return {
    ...run,
    employeeData: getEmployees().slice(0, 10).map(emp => ({
      ...emp,
      grossPay: 6500000,
      deductions: 650000,
      netPay: 5850000,
    })),
  };
};

export function runPayroll(dateRange?: DateRange): PayrollRun {
    const newRunId = `RUN-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    const newPeriod = format(dateRange?.from ?? new Date(), 'MMMM yyyy');
    const newRun: PayrollRun = {
      id: newRunId,
      period: newPeriod,
      status: 'Completed',
      completedDate: format(new Date(), 'MMMM d, yyyy'),
      employeeCount: getEmployees().filter(e => e.status === 'Active').length,
      total: 1625000000 // Example data
    };
    initialPayrollRuns.unshift(newRun);
    return newRun;
}

export function getPayslipsForEmployee(employeeId: string, limit?: number): Payslip[] {
    const results = allPayslips.filter(p => p.employeeId === employeeId);
    if (limit) {
        return results.slice(0, limit);
    }
    return results;
}


// --- Salary Advances ---

export function getSalaryAdvances(): SalaryAdvance[] {
    return initialSalaryAdvances;
}

export function getSalaryAdvanceById(id: string) {
    return initialSalaryAdvances.find(sa => sa.id === id);
}


export function getSalaryAdvancesForEmployee(employeeId: string): SalaryAdvance[] {
    return initialSalaryAdvances.filter(sa => sa.employeeId === employeeId);
}

export function addSalaryAdvance(reqData: {employeeId: string, employeeName: string, amount: number, reason?: string}): SalaryAdvance {
    const newRequest: SalaryAdvance = {
        id: `ADV-${Math.random().toString(36).substr(2, 6).toUpperCase()}`,
        date: format(new Date(), 'yyyy-MM-dd'),
        status: 'Pending Approval',
        ...reqData,
    };
    initialSalaryAdvances.unshift(newRequest);
    return newRequest;
}

export function updateSalaryAdvance(id: string, updates: Partial<SalaryAdvance>): SalaryAdvance | undefined {
    const index = initialSalaryAdvances.findIndex(s => s.id === id);
    if (index !== -1) {
        initialSalaryAdvances[index] = { ...initialSalaryAdvances[index], ...updates };
        return initialSalaryAdvances[index];
    }
    return undefined;
}


// --- Leave Requests ---

export function getLeaveRequests(): LeaveRequest[] {
    return initialLeaveRequests;
}

export function getLeaveRequestById(id: string) {
    return initialLeaveRequests.find(lr => lr.id === id);
}

export function addLeaveRequest(reqData: Omit<LeaveRequest, 'id' | 'status'>): LeaveRequest {
    const newRequest: LeaveRequest = {
        id: `LR-${Math.random().toString(36).substr(2, 6).toUpperCase()}`,
        status: 'Pending',
        ...reqData,
    };
    initialLeaveRequests.unshift(newRequest);
    return newRequest;
}

export function updateLeaveRequest(id: string, updates: Partial<LeaveRequest>): LeaveRequest | undefined {
    const index = initialLeaveRequests.findIndex(l => l.id === id);
    if (index !== -1) {
        initialLeaveRequests[index] = { ...initialLeaveRequests[index], ...updates };
        return initialLeaveRequests[index];
    }
    return undefined;
}