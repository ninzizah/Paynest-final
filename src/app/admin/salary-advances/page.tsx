'use client';

import * as React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { SalaryAdvance } from '@/lib/data';
import { Check, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { formatCurrency } from '@/lib/utils';
import useSWR from 'swr';

const fetcher = (url: string) => fetch(url).then(res => res.json());

export default function SalaryAdvancesPage() {
    const { data: salaryAdvances, error, mutate } = useSWR<SalaryAdvance[]>('/api/salary-advances', fetcher);
    const { toast } = useToast();

    const handleStatusChange = async (requestId: string, newStatus: 'Approved' | 'Rejected') => {
        const res = await fetch(`/api/salary-advances/${requestId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: newStatus }),
        });

        if (res.ok) {
            const updatedRequest = await res.json();
            mutate(salaryAdvances?.map(r => r.id === updatedRequest.id ? updatedRequest : r));
            toast({
                title: `Request ${newStatus}`,
                description: `The salary advance request has been ${newStatus.toLowerCase()}.`
            });
        } else {
            toast({ variant: 'destructive', title: 'Error', description: 'Failed to update request.' });
        }
    };

    if (error) return <div>Failed to load salary advances.</div>
    if (!salaryAdvances) return <div>Loading...</div>

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Salary Advance Requests</h1>
        <p className="text-muted-foreground">
          Review and manage salary advance requests from employees.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Requests</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Employee</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Reason</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {salaryAdvances.map((request) => (
                <TableRow key={request.id}>
                  <TableCell className="font-medium">{request.employeeName}</TableCell>
                  <TableCell>{request.date}</TableCell>
                  <TableCell>{formatCurrency(request.amount)}</TableCell>
                  <TableCell>{request.reason}</TableCell>
                  <TableCell>
                    <Badge variant={request.status === 'Pending Approval' ? 'destructive' : request.status === 'Paid Back' ? 'secondary' : 'default'}>
                        {request.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    {request.status === 'Pending Approval' && (
                      <div className="flex gap-2 justify-end">
                        <Button variant="outline" size="icon" className="text-green-600 hover:text-green-700" onClick={() => handleStatusChange(request.id, 'Approved')}>
                          <Check className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="icon" className="text-red-600 hover:text-red-700" onClick={() => handleStatusChange(request.id, 'Rejected')}>
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
           {salaryAdvances.length === 0 && (
            <div className="text-center py-10 text-muted-foreground">
              No salary advance requests found.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
