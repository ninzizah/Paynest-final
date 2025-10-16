
'use client';

import * as React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowRight, User, CreditCard, HandCoins } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { formatCurrency } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from './ui/textarea';
import { type Employee, type Payslip, type LeaveRequest } from '@/lib/data';
import { DatePicker } from './date-picker';
import { format } from 'date-fns';
import { Download } from 'lucide-react';
import useSWR from 'swr';

interface EmployeeDashboardProps {
    user: Employee;
}

const fetcher = (url: string) => fetch(url).then(res => res.json());

export function EmployeeDashboard({ user }: EmployeeDashboardProps) {
  const { toast } = useToast();
  const [isLeaveDialogOpen, setIsLeaveDialogOpen] = React.useState(false);
  const [leaveStartDate, setLeaveStartDate] = React.useState<Date | undefined>();
  const [leaveEndDate, setLeaveEndDate] = React.useState<Date | undefined>();
  
  const { data: recentPayslips, error: payslipsError } = useSWR<Payslip[]>(user?.id ? `/api/employees/${user.id}/payslips?limit=3` : null, fetcher);
  const { mutate: mutateLeaveRequests } = useSWR<LeaveRequest[]>('/api/leave-requests');


  const handleDownload = (payslip: Payslip) => {
    const payslipContent = `
      Payslip ID: ${payslip.id}
      Payment Date: ${payslip.date}
      ---
      Gross Pay: ${formatCurrency(payslip.gross)}
      Taxes: ${formatCurrency(payslip.taxes)}
      ---
      Net Pay: ${formatCurrency(payslip.net)}
    `;
    const blob = new Blob([payslipContent.trim()], { type: 'text/plain;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.href = url;
    link.setAttribute('download', `${payslip.id}.txt`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    toast({
      title: "Payslip Downloaded",
      description: `Payslip ${payslip.id} has been downloaded.`,
    });
  };

  const handleLeaveRequestSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);
    const reason = formData.get('reason') as string;

    if (!user || !user.id || !leaveStartDate || !leaveEndDate) {
        toast({
            variant: 'destructive',
            title: 'Incomplete Information',
            description: 'Please select both a start and end date.',
        });
        return;
    }

    const res = await fetch('/api/leave-requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            employeeId: user.id,
            employeeName: user.name,
            startDate: format(leaveStartDate, 'yyyy-MM-dd'),
            endDate: format(leaveEndDate, 'yyyy-MM-dd'),
            reason: reason,
        }),
    });

    if (res.ok) {
        mutateLeaveRequests();
        toast({
            title: 'Leave Request Submitted',
            description: 'Your request has been sent for approval.'
        });
        setIsLeaveDialogOpen(false);
        setLeaveStartDate(undefined);
        setLeaveEndDate(undefined);
        form.reset();
    } else {
        toast({
            variant: 'destructive',
            title: 'Submission Failed',
            description: 'There was an error submitting your request.',
        });
    }
  }

  if (payslipsError) return <div>Failed to load data.</div>
  if (!user) {
    return <div>Loading dashboard...</div>
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card className="lg:col-span-2">
            <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>Manage your information and requests.</CardDescription>
            </CardHeader>
            <CardContent className="grid sm:grid-cols-3 gap-4">
                <Link href="/employee/profile">
                    <div className="p-4 border rounded-lg hover:bg-muted transition-colors h-full flex flex-col items-center text-center">
                        <User className="h-8 w-8 mb-2 text-primary"/>
                        <p className="font-semibold">My Profile</p>
                        <p className="text-sm text-muted-foreground">View and update your personal information.</p>
                    </div>
                </Link>
                <Link href="/employee/payroll">
                    <div className="p-4 border rounded-lg hover:bg-muted transition-colors h-full flex flex-col items-center text-center">
                        <CreditCard className="h-8 w-8 mb-2 text-primary"/>
                        <p className="font-semibold">View Payslips</p>
                        <p className="text-sm text-muted-foreground">Access your payroll history and details.</p>
                    </div>
                </Link>
                <Link href="/employee/salary-advance">
                    <div className="p-4 border rounded-lg hover:bg-muted transition-colors h-full flex flex-col items-center text-center">
                        <HandCoins className="h-8 w-8 mb-2 text-primary"/>
                        <p className="font-semibold">Salary Advance</p>
                        <p className="text-sm text-muted-foreground">Request an advance on your salary.</p>
                    </div>
                </Link>
            </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Leave Balance</CardTitle>
            <CardDescription>Your available time off.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className='flex justify-between items-baseline'>
                <p className='font-medium'>Annual Leave</p>
                <p className='text-2xl font-bold'>12 <span className='text-sm font-normal text-muted-foreground'>days</span></p>
            </div>
            <div className='flex justify-between items-baseline'>
                <p className='font-medium'>Sick Leave</p>
                <p className='text-2xl font-bold'>8 <span className='text-sm font-normal text-muted-foreground'>days</span></p>
            </div>
             <Dialog open={isLeaveDialogOpen} onOpenChange={setIsLeaveDialogOpen}>
                <DialogTrigger asChild>
                    <Button className="w-full mt-2">Request Leave</Button>
                </DialogTrigger>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>New Leave Request</DialogTitle>
                        <DialogDescription>Select the dates and provide a reason for your leave.</DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleLeaveRequestSubmit} className="grid gap-4 py-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="start-date">Start Date</Label>
                                <DatePicker date={leaveStartDate} onDateChange={setLeaveStartDate} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="end-date">End Date</Label>
                                <DatePicker date={leaveEndDate} onDateChange={setLeaveEndDate} />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="reason">Reason (Optional)</Label>
                            <Textarea id="reason" name="reason" placeholder="e.g., Family vacation" />
                        </div>
                        <DialogFooter>
                            <Button variant="outline" type="button" onClick={() => setIsLeaveDialogOpen(false)}>Cancel</Button>
                            <Button type="submit">Submit Request</Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
          </CardContent>
        </Card>
      </div>

       <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Recent Payslips</CardTitle>
            <CardDescription>
              A summary of your recent salary payments.
            </CardDescription>
          </div>
          <Button variant="outline" size="sm" asChild>
            <Link href="/employee/payroll">
              View All <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Payslip ID</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recentPayslips?.map((payslip) => (
                <TableRow key={payslip.id}>
                  <TableCell className="font-medium">{payslip.id}</TableCell>
                  <TableCell>{payslip.date}</TableCell>
                  <TableCell>{formatCurrency(payslip.net)}</TableCell>
                  <TableCell><Badge variant="secondary">{payslip.status}</Badge></TableCell>
                  <TableCell className="text-right">
                    <Button variant="outline" size="icon" onClick={() => handleDownload(payslip)}>
                        <Download className="h-4 w-4" />
                        <span className="sr-only">Download payslip</span>
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
