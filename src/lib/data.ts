export type Employee = {
  id: string;
  name: string;
  email: string;
  role: string;
  department: string;
  status: 'Active' | 'Inactive';
  password: string;
  phone: string;
  hireDate?: string;
};

export type Department = {
    id: string;
    name:string;
    head: string;
    employeeCount: number;
};

export type PayrollRun = {
  id: string;
  period: string;
  status: 'Completed' | 'In Progress' | 'Failed';
  completedDate: string;
  employeeCount: number;
  total: number;
};

export type SalaryAdvance = {
  id: string;
  employeeId: string;
  employeeName: string;
  date: string;
  amount: number;
  status: 'Pending Approval' | 'Approved' | 'Rejected' | 'Paid Back';
  reason?: string;
};

export type LeaveRequest = {
  id: string;
  employeeId: string;
  employeeName: string;
  startDate: string;
  endDate: string;
  reason?: string;
  status: 'Pending' | 'Approved' | 'Rejected';
};

export type Payslip = {
    id: string;
    employeeId: string;
    date: string;
    gross: number;
    taxes: number;
    net: number;
    status: 'Paid';
};

export type MockUser = {
  role: 'admin' | 'hr';
  name: string;
  email: string;
  password?: string;
  phone: string;
  id?: string;
  employeeId?: string;
  hireDate?: string;
  department?: string;
  roleTitle?: string;
}

export const employees: Employee[] = [
  { id: 'EMP001', name: 'Alice Johnson', email: 'alice.johnson@example.com', role: 'Software Engineer', department: 'Engineering', status: 'Active', password: 'password-a1b2c3d4-x', phone: '+1 (111) 222-3333', hireDate: '2022-08-15' },
  { id: 'EMP002', name: 'Bob Williams', email: 'bob.williams@example.com', role: 'Project Manager', department: 'Product', status: 'Active', password: 'password-e5f6g7h8-y', phone: '+1 (222) 333-4444', hireDate: '2021-05-20' },
  { id: 'EMP003', name: 'Charlie Brown', email: 'charlie.brown@example.com', role: 'UI/UX Designer', department: 'Design', status: 'Active', password: 'password-i9j0k1l2-z', phone: '+1 (333) 444-5555', hireDate: '2023-01-10' },
  { id: 'EMP004', name: 'Diana Miller', email: 'diana.miller@example.com', role: 'Marketing Specialist', department: 'Marketing', status: 'Active', password: 'password-m3n4o5p6-a', phone: '+1 (444) 555-6666', hireDate: '2022-11-30' },
  { id: 'EMP005', name: 'Ethan Davis', email: 'ethan.davis@example.com', role: 'HR Generalist', department: 'Human Resources', status: 'Active', password: 'password-q7r8s9t0-b', phone: '+1 (555) 666-7777', hireDate: '2023-03-22' },
  { id: 'EMP006', name: 'Fiona Clark', email: 'fiona.clark@example.com', role: 'Backend Developer', department: 'Engineering', status: 'Inactive', password: 'password-u1v2w3x4-c', phone: '+1 (666) 777-8888', hireDate: '2021-09-01' },
  { id: 'EMP007', name: 'George Hall', email: 'george.hall@example.com', role: 'Data Scientist', department: 'Data', status: 'Active', password: 'password-y5z6a7b8-d', phone: '+1 (777) 888-9999', hireDate: '2022-07-18' },
];

export const departments: Department[] = [
    { id: 'DEP01', name: 'Engineering', head: 'Alice Johnson', employeeCount: 25 },
    { id: 'DEP02', name: 'Product', head: 'Bob Williams', employeeCount: 10 },
    { id: 'DEP03', name: 'Design', head: 'Charlie Brown', employeeCount: 8 },
    { id: 'DEP04', name: 'Marketing', head: 'Diana Miller', employeeCount: 15 },
    { id: 'DEP05', name: 'Human Resources', head: 'Ethan Davis', employeeCount: 5 },
    { id: 'DEP06', name: 'Data', head: 'George Hall', employeeCount: 12 },
    { id: 'DEP07', name: 'Sales', head: 'Hannah White', employeeCount: 30 },
];

export const payrollRuns: PayrollRun[] = [
    { id: 'RUN-0624', period: 'June 2024', status: 'Completed', completedDate: 'July 1, 2024', employeeCount: 245, total: 1600000000 },
    { id: 'RUN-0524', period: 'May 2024', status: 'Completed', completedDate: 'June 1, 2024', employeeCount: 240, total: 1550000000 },
    { id: 'RUN-0424', period: 'April 2024', status: 'Completed', completedDate: 'May 1, 2024', employeeCount: 238, total: 1530000000 },
    { id: 'RUN-0324', period: 'March 2024', status: 'Completed', completedDate: 'April 1, 2024', employeeCount: 235, total: 1500000000 },
];

export const salaryAdvances: SalaryAdvance[] = [
    { id: 'ADV-0124', employeeId: 'EMP003', employeeName: 'Charlie Brown', date: '2024-01-15', amount: 650000, status: 'Paid Back', reason: 'Medical emergency' },
    { id: 'ADV-0424', employeeId: 'EMP005', employeeName: 'Ethan Davis', date: '2024-04-10', amount: 390000, status: 'Paid Back', reason: 'School fees' },
    { id: 'ADV-0624', employeeId: 'EMP002', employeeName: 'Bob Williams', date: '2024-06-20', amount: 520000, status: 'Pending Approval', reason: 'Urgent home repairs' },
];

export const leaveRequests: LeaveRequest[] = [
    { id: 'LR-001', employeeId: 'EMP004', employeeName: 'Diana Miller', startDate: '2024-07-20', endDate: '2024-07-25', status: 'Approved', reason: 'Vacation' },
    { id: 'LR-002', employeeId: 'EMP001', employeeName: 'Alice Johnson', startDate: '2024-08-01', endDate: '2024-08-02', status: 'Pending', reason: 'Personal appointment' },
    { id: 'LR-003', employeeId: 'EMP007', employeeName: 'George Hall', startDate: '2024-07-10', endDate: '2024-07-11', status: 'Rejected', reason: 'Not enough notice' },
];

export const MOCK_USERS: Record<'admin' | 'hr', MockUser> = {
  admin: {
    role: 'admin',
    name: 'Admin User',
    email: 'admin@paynest.com',
    password: 'admin',
    roleTitle: 'System Administrator',
    phone: '+1 (000) 000-0000',
  },
  hr: {
    role: 'hr',
    name: 'HR Manager',
    email: 'hr@paynest.com',
    password: 'hrpass',
    roleTitle: 'HR Manager',
    phone: '+1 (000) 000-0001',
  },
};

export const payslips: Payslip[] = [
    { id: 'PAY-0624-001', employeeId: 'EMP001', date: 'June 1, 2024', gross: 6500000, taxes: 650000, net: 5850000, status: 'Paid' },
    { id: 'PAY-0524-001', employeeId: 'EMP001', date: 'May 1, 2024', gross: 6500000, taxes: 650000, net: 5850000, status: 'Paid' },
    { id: 'PAY-0624-002', employeeId: 'EMP002', date: 'June 1, 2024', gross: 7000000, taxes: 750000, net: 6250000, status: 'Paid' },
    { id: 'PAY-0524-002', employeeId: 'EMP002', date: 'May 1, 2024', gross: 7000000, taxes: 750000, net: 6250000, status: 'Paid' },
];

export function getLeaveRequests(): LeaveRequest[] {
    return leaveRequests;
}

export function getSalaryAdvances(): SalaryAdvance[] {
    return salaryAdvances;
}
