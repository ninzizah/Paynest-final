'use client';

import { Download } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
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
import { formatCurrency } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import React from 'react';
import { Payslip } from '@/lib/data';
import { useActiveEmployee } from '@/hooks/use-active-employee';
import useSWR from 'swr';

const fetcher = (url: string) => fetch(url).then(res => res.json());

export default function PayrollPage() {
  const { toast } = useToast();
  const { activeEmployeeId } = useActiveEmployee();
  
  const { data: payslips, error } = useSWR<Payslip[]>(activeEmployeeId ? `/api/employees/${activeEmployeeId}/payslips` : null, fetcher);

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
  
    if (error) return <div>Failed to load payslips</div>
    if (!payslips) {
        return <div>Loading...</div>
    }

  return (
    <div className="space-y-6">
        <div>
            <h1 className="text-3xl font-bold tracking-tight">My Payroll</h1>
            <p className="text-muted-foreground">Access your payslip history and payment details.</p>
        </div>
        <Card>
            <CardHeader>
                <CardTitle>Payslip History</CardTitle>
                <CardDescription>A complete record of your salary payments.</CardDescription>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Payslip ID</TableHead>
                            <TableHead>Payment Date</TableHead>
                            <TableHead>Gross Pay</TableHead>
                            <TableHead>Taxes</TableHead>
                            <TableHead>Net Pay</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Action</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {payslips.map((payslip) => (
                            <TableRow key={payslip.id}>
                                <TableCell className="font-medium">{payslip.id}</TableCell>
                                <TableCell>{payslip.date}</TableCell>
                                <TableCell>{formatCurrency(payslip.gross)}</TableCell>
                                <TableCell>{formatCurrency(payslip.taxes)}</TableCell>
                                <TableCell className="font-semibold">{formatCurrency(payslip.net)}</TableCell>
                                <TableCell>
                                    <Badge variant="secondary">{payslip.status}</Badge>
                                </TableCell>
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
                {payslips.length === 0 && (
                    <div className="text-center py-10 text-muted-foreground">
                        No payslip history found.
                    </div>
                )}
            </CardContent>
        </Card>
    </div>
  );
}
