'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Download } from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { getPayrollRunDetails } from '@/lib/api';
import { formatCurrency } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

export default function PayrollRunDetailsPage() {
  const params = useParams();
  const runId = params.runId as string;
  const runDetails = getPayrollRunDetails(runId);
  const { toast } = useToast();

  const handleExport = () => {
    if (!runDetails) return;
    const headers = ["ID", "Name", "Department", "Gross Pay", "Deductions", "Net Pay"];
    const csvContent = [
      headers.join(','),
      ...runDetails.employeeData.map(emp => 
        [emp.id, emp.name, emp.department, emp.grossPay, emp.deductions, emp.netPay].join(',')
      )
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.href = url;
    link.setAttribute('download', `payroll_run_${runId}_details.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast({ title: 'Exported', description: 'Payroll run details have been exported.' });
  }

  if (!runDetails) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center">
        <h1 className="text-2xl font-bold">Payroll Run Not Found</h1>
        <p className="text-muted-foreground">The payroll run you are looking for does not exist.</p>
        <Button asChild variant="link" className="mt-4">
          <Link href="/admin/payroll">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Payroll
          </Link>
        </Button>
      </div>
    );
  }

  const { id, period, completedDate, employeeCount, total, employeeData } = runDetails;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button asChild variant="outline" size="icon">
          <Link href="/admin/payroll">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Payroll Run: {id}</h1>
          <p className="text-muted-foreground">Details for the pay period of {period}.</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Summary</CardTitle>
        </CardHeader>
        <CardContent className="grid md:grid-cols-4 gap-4">
          <div className="flex flex-col p-4 border rounded-lg">
            <span className="text-sm text-muted-foreground">Pay Period</span>
            <span className="text-lg font-semibold">{period}</span>
          </div>
          <div className="flex flex-col p-4 border rounded-lg">
            <span className="text-sm text-muted-foreground">Completion Date</span>
            <span className="text-lg font-semibold">{completedDate}</span>
          </div>
          <div className="flex flex-col p-4 border rounded-lg">
            <span className="text-sm text-muted-foreground">Total Employees</span>
            <span className="text-lg font-semibold">{employeeCount}</span>
          </div>
          <div className="flex flex-col p-4 border rounded-lg">
            <span className="text-sm text-muted-foreground">Total Payroll</span>
            <span className="text-lg font-semibold">{formatCurrency(total)}</span>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Employee Breakdown</CardTitle>
            <CardDescription>Detailed salary breakdown for each employee in this run.</CardDescription>
          </div>
          <Button variant="outline" onClick={handleExport}>
            <Download className="mr-2 h-4 w-4" />
            Export Details
          </Button>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Employee</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>Gross Pay</TableHead>
                <TableHead>Deductions</TableHead>
                <TableHead>Net Pay</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {employeeData.map(emp => (
                <TableRow key={emp.id}>
                  <TableCell className="font-medium">{emp.name}</TableCell>
                  <TableCell>{emp.department}</TableCell>
                  <TableCell>{formatCurrency(emp.grossPay)}</TableCell>
                  <TableCell>{formatCurrency(emp.deductions)}</TableCell>
                  <TableCell className="font-semibold">{formatCurrency(emp.netPay)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
