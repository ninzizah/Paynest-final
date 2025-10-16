'use client';

import * as React from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { PayrollRun } from '@/lib/data';
import { DateRangePicker } from '@/components/date-range-picker';
import { Download, PlayCircle } from 'lucide-react';
import { DateRange } from 'react-day-picker';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { format } from 'date-fns';
import Link from 'next/link';
import { formatCurrency } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import useSWR from 'swr';

const fetcher = (url: string) => fetch(url).then(res => res.json());

export default function AdminPayrollPage() {
    const { data: payrollRuns, error, mutate } = useSWR<PayrollRun[]>('/api/payroll', fetcher);
    const { toast } = useToast();
    const [dateRange, setDateRange] = React.useState<DateRange | undefined>({
      from: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
      to: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0),
    });
    const [isRunning, setIsRunning] = React.useState(false);
    const [progress, setProgress] = React.useState(0);

    React.useEffect(() => {
      let interval: NodeJS.Timeout | undefined;
      if (isRunning) {
        interval = setInterval(() => {
          setProgress(prev => {
            const newProgress = prev + 10;
            if (newProgress >= 100) {
              clearInterval(interval!);
              return 100;
            }
            return newProgress;
          });
        }, 200);
      }
      return () => {
        if(interval) clearInterval(interval);
      };
    }, [isRunning]);

    React.useEffect(() => {
        const run = async () => {
            if (progress === 100) {
                const res = await fetch('/api/payroll', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ dateRange }),
                });

                if (res.ok) {
                    const newRun = await res.json();
                    mutate([...(payrollRuns || []), newRun]);
                    toast({title: 'Payroll Complete', description: `Payroll for ${newRun.period} has been processed.`});
                } else {
                    toast({ variant: 'destructive', title: 'Error', description: 'Failed to run payroll.' });
                }
                
                setIsRunning(false);
                setProgress(0);
            }
        }
        run();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [progress, dateRange, toast]);

    const handleRunPayrollClick = () => {
        setProgress(0);
        setIsRunning(true);
    };

    const handleExport = () => {
        if (!payrollRuns) return;
        const headers = ["Run ID", "Pay Period", "Status", "Completion Date", "Employees", "Total Payroll"];
        const csvContent = [
            headers.join(','),
            ...payrollRuns.map(run => 
                [run.id, run.period, run.status, run.completedDate, run.employeeCount, run.total].join(',')
            )
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.href = url;
        link.setAttribute('download', 'payroll_history.csv');
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        toast({title: 'Exported', description: 'Payroll history has been exported.'})
    };

    if (error) return <div>Failed to load payroll history.</div>
    if (!payrollRuns) return <div>Loading...</div>

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Payroll</h1>
        <p className="text-muted-foreground">
          Run and manage payroll for your organization.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Run a New Payroll</CardTitle>
          <CardDescription>
            Select a pay period to calculate salaries, taxes, and benefits.
          </CardDescription>
        </CardHeader>
        <CardContent>
            {isRunning ? (
                <div className="flex flex-col items-center justify-center gap-4 p-8">
                    <p className="text-muted-foreground">Running payroll for {format(dateRange?.from ?? new Date(), 'MMMM yyyy')}...</p>
                    <Progress value={progress} className="w-full max-w-md" />
                    <p className="font-bold text-lg">{progress}% Complete</p>
                    <p className='text-sm text-center text-muted-foreground'>Calculating salaries, deductions, and benefits for all employees. <br /> This may take a few moments. Do not close this window.</p>
                </div>
            ) : (
                <div className="flex flex-col sm:flex-row gap-4 items-end">
                    <div className='flex-1 space-y-2'>
                        <label className="text-sm font-medium">Pay Period</label>
                        <DateRangePicker date={dateRange} onDateChange={setDateRange} />
                    </div>
                    <Button size="lg" className="w-full sm:w-auto" onClick={handleRunPayrollClick} disabled={!dateRange || !dateRange.from || !dateRange.to}>
                        <PlayCircle className="mr-2 h-5 w-5" />
                        Run Payroll
                    </Button>
                </div>
            )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
            <div>
                <CardTitle>Payroll History</CardTitle>
                <CardDescription>
                    Review past payroll runs and download reports.
                </CardDescription>
            </div>
            <Button variant="outline" onClick={handleExport} disabled={payrollRuns.length === 0}>
                <Download className="mr-2 h-4 w-4" />
                Export History
            </Button>
        </CardHeader>
        <CardContent>
             <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Run ID</TableHead>
                        <TableHead>Pay Period</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Completion Date</TableHead>
                        <TableHead>Employees</TableHead>
                        <TableHead>Total Payroll</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {payrollRuns.map((run) => (
                        <TableRow key={run.id}>
                            <TableCell className="font-medium">{run.id}</TableCell>
                            <TableCell>{run.period}</TableCell>
                            <TableCell><Badge variant={run.status === 'Completed' ? 'secondary' : 'default'}>{run.status}</Badge></TableCell>
                            <TableCell>{run.completedDate}</TableCell>
                            <TableCell>{run.employeeCount}</TableCell>
                            <TableCell>{formatCurrency(run.total)}</TableCell>
                            <TableCell className="text-right">
                                <Button asChild variant="outline" size="sm">
                                  <Link href={`/admin/payroll/${run.id}`}>View Details</Link>
                                </Button>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
             {payrollRuns.length === 0 && (
                <div className="text-center py-10 text-muted-foreground">
                    No payroll history. Run payroll to see results.
                </div>
             )}
        </CardContent>
      </Card>
    </div>
  );
}
