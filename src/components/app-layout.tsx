'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  Home,
  Users,
  Building,
  FileText,
  Settings,
  CreditCard,
  User as UserIcon,
  HandCoins,
  DollarSign,
  CalendarCheck,
  LogOut,
} from 'lucide-react';

import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarTrigger,
  SidebarInset,
} from '@/components/ui/sidebar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Icons } from '@/components/icons';
import React from 'react';
import { useAuth } from '@/hooks/use-auth';
import { useActiveEmployee } from '@/hooks/use-active-employee';
import useSWR from 'swr';
import { Employee, LeaveRequest, SalaryAdvance } from '@/lib/data';

type UserRole = 'admin' | 'hr' | 'employee';

const fetcher = (url: string) => fetch(url).then(res => res.json());

const navItems = [
  // Admin
  { href: '/admin/dashboard', icon: Home, label: 'Dashboard', roles: ['admin'] },
  { href: '/admin/employees', icon: Users, label: 'Employees', roles: ['admin'] },
  { href: '/admin/departments', icon: Building, label: 'Departments', roles: ['admin'] },
  { href: '/admin/payroll', icon: DollarSign, label: 'Payroll', roles: ['admin'] },
  { href: '/admin/leave-requests', icon: CalendarCheck, label: 'Leave Requests', roles: ['admin'], badgeKey: 'leave' },
  { href: '/admin/salary-advances', icon: HandCoins, label: 'Salary Advances', roles: ['admin'], badgeKey: 'advance' },
  { href: '/admin/reports', icon: FileText, label: 'Reports', roles: ['admin'] },
  
  // HR
  { href: '/hr/dashboard', icon: Home, label: 'Dashboard', roles: ['hr'] },
  { href: '/hr/employees', icon: Users, label: 'Employees', roles: ['hr'] },
  { href: '/hr/departments', icon: Building, label: 'Departments', roles: ['hr'] },
  { href: '/hr/leave-requests', icon: CalendarCheck, label: 'Leave Requests', roles: ['hr'], badgeKey: 'leave' },
  { href: '/hr/salary-advances', icon: HandCoins, label: 'Salary Advances', roles: ['hr'], badgeKey: 'advance' },

  // Employee
  { href: '/employee/dashboard', icon: Home, label: 'Dashboard', roles: ['employee'] },
  { href: '/employee/profile', icon: UserIcon, label: 'My Profile', roles: ['employee'] },
  { href: '/employee/payroll', icon: CreditCard, label: 'My Payslips', roles: ['employee'] },
  { href: '/employee/salary-advance', icon: HandCoins, label: 'Salary Advance', roles: ['employee'] },

  // Common
  { href: '/settings', icon: Settings, label: 'Settings', roles: ['admin', 'hr', 'employee'] },
];

interface AppLayoutProps {
    children: React.ReactNode;
}


export function AppLayout({ children }: AppLayoutProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { loggedInUser, logout, isLoading: isAuthLoading } = useAuth();
  const { activeEmployeeId, isLoading: isEmployeeLoading } = useActiveEmployee();
  
  const { data: leaveRequests } = useSWR<LeaveRequest[]>('/api/leave-requests', fetcher);
  const { data: salaryAdvances } = useSWR<SalaryAdvance[]>('/api/salary-advances', fetcher);
  const { data: activeEmployee } = useSWR<Employee>(activeEmployeeId ? `/api/employees/${activeEmployeeId}` : null, fetcher);


  const leaveRequestCount = leaveRequests?.filter(r => r.status === 'Pending').length || 0;
  const salaryAdvanceCount = salaryAdvances?.filter(r => r.status === 'Pending Approval').length || 0;

  const getRoleFromPath = (path: string): UserRole | null => {
    if (path.startsWith('/admin')) return 'admin';
    if (path.startsWith('/hr')) return 'hr';
    if (path.startsWith('/employee')) return 'employee';
    return null;
  }

  const role = loggedInUser?.role || getRoleFromPath(pathname) || 'employee';

  const userDetails = {
      admin: { name: 'Admin User', email: 'admin@paynest.com', initials: 'AU' },
      hr: { name: 'HR Manager', email: 'hr@paynest.com', initials: 'HR' },
      employee: { 
          name: activeEmployee?.name || 'Employee', 
          email: activeEmployee?.email || 'employee@paynest.com', 
          initials: activeEmployee ? `${activeEmployee.name.split(' ')[0][0]}${activeEmployee.name.split(' ')?.[1]?.[0] || ''}`.toUpperCase() : 'EM'
      },
  }

  const currentUser = userDetails[role];
  
  if (pathname.startsWith('/login')) {
    return <>{children}</>;
  }

  if (isAuthLoading || (role === 'employee' && isEmployeeLoading)) {
    return (
        <div className="flex h-screen items-center justify-center">
            <p>Loading...</p>
        </div>
    );
  }
  
  const filteredNavItems = navItems.filter(item => {
    if (item.href === '/settings') {
      return item.roles.includes(role);
    }
    return item.roles.includes(role);
  });
  
  const getBadgeCount = (badgeKey?: string) => {
    if (!['admin', 'hr'].includes(role)) return 0;
    if (badgeKey === 'leave') return leaveRequestCount;
    if (badgeKey === 'advance') return salaryAdvanceCount;
    return 0;
  }
  
  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  const settingsLink = `/${role}/settings`;


  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader className="border-b">
          <div className="flex items-center gap-3 p-2">
            <Icons.logo className="h-7 w-7 text-primary" />
            <span className="text-xl font-semibold">Paynest</span>
          </div>
        </SidebarHeader>
        <SidebarContent>
          <SidebarMenu>
            {filteredNavItems.map((item) => {
                const badgeCount = getBadgeCount(item.badgeKey);
                let href = item.href;
                
                if (item.label === 'Settings') {
                    href = settingsLink;
                }

                return (
              <SidebarMenuItem key={`${role}-${item.href}`}>
                <Link href={href}>
                  <SidebarMenuButton
                    isActive={pathname === href}
                    tooltip={item.label}
                  >
                    <item.icon />
                    <span>{item.label}</span>
                    {badgeCount > 0 && (
                        <div className="ml-auto bg-primary text-primary-foreground rounded-full text-xs w-5 h-5 flex items-center justify-center">
                            {badgeCount}
                        </div>
                    )}
                  </SidebarMenuButton>
                </Link>
              </SidebarMenuItem>
            )})}
          </SidebarMenu>
        </SidebarContent>
        <SidebarFooter className="p-2 border-t">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="w-full justify-start gap-2 p-2 h-auto">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-muted text-muted-foreground">
                        {currentUser.initials}
                    </div>
                    <div className='flex flex-col items-start text-left truncate'>
                        <span className="font-medium text-sm">{currentUser.name}</span>
                        <span className="text-xs text-muted-foreground">{currentUser.email}</span>
                    </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56 mb-2" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{currentUser.name}</p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {currentUser.email}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                    <Link href={settingsLink}><Settings className="mr-2 h-4 w-4" />Settings</Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Logout</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
        </SidebarFooter>
      </Sidebar>
      <SidebarInset>
        <header className="flex h-16 items-center gap-4 border-b bg-background px-4 md:px-6 sticky top-0 z-30">
          <SidebarTrigger className="md:hidden" />
          <div className="flex-1">
            {/* Can add breadcrumbs or page title here */}
          </div>
          <div>
            {/* Other header items */}
          </div>
        </header>
        <main className="flex-1 p-4 md:p-6 lg:p-8 bg-muted/40">
            {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
