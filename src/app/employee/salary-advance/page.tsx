
'use client';

import * as React from 'react';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { type SalaryAdvance, type Employee } from '@/lib/data';
import { useToast } from '@/hooks/use-toast';
import { formatCurrency } from '@/lib/utils';
import { useActiveEmployee } from '@/hooks/use-active-employee';
import useSWR from 'swr';

const fetcher = (url: string) => fetch(url).then(res => res.json());

export default function SalaryAdvancePage() {
    const { activeEmployeeId } = useActiveEmployee();
    const { data: user, error: userError } = useSWR<Employee>(activeEmployeeId ? `/api/employees/${activeEmployeeId}` : null, fetcher);
    const { data: history, error: historyError, mutate } = useSWR<SalaryAdvance[]>(activeEmployeeId ? `/api/employees/${activeEmployeeId}/salary-advances` : null, fetcher);

    const { toast } = useToast();

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const form = e.currentTarget;
        const formData = new FormData(form);
        const amount = Number(formData.get('amount'));
        const reason = formData.get('reason') as string;

        if (!user || !user.id) return;

        if (amount <= 0 || amount > 650000) {
            toast({
                variant: 'destructive',
                title: 'Invalid Amount',
                description: `Please enter an amount between 1 and ${formatCurrency(650000)}.`,
            });
            return;
        }

        const res = await fetch('/api/salary-advances', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                employeeId: user.id,
                employeeName: user.name,
                amount,
                reason,
            }),
        });

        if (res.ok) {
            const newRequest = await res.json();
            mutate([...(history || []), newRequest]);
            toast({
                title: 'Request Submitted',
                description: `Your request for ${formatCurrency(amount)} has been submitted for approval.`,
            });
            form.reset();
        } else {
             toast({
                variant: 'destructive',
                title: 'Submission Failed',
                description: 'There was an error submitting your request.',
            });
        }
    };
    
    if (userError || historyError) return <div>Failed to load data.</div>
    if (!user || !history) {
        return <div>Loading...</div>
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Salary Advance</h1>
                <p className="text-muted-foreground">Request an advance on your salary when you need it.</p>
            </div>
            <div className="grid md:grid-cols-3 gap-6">
                <div className="md:col-span-2 space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>New Salary Advance Request</CardTitle>
                            <CardDescription>
                                Your available advance is calculated based on your employment record.
                                The advanced amount will be deducted from your next salary.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form className="space-y-4" onSubmit={handleSubmit}>
                                <div className="space-y-2">
                                    <Label htmlFor="amount">Amount</Label>
                                    <Input id="amount" name="amount" type="number" placeholder="Enter amount in RWF" required/>
                                </div>
                                 <div className="space-y-2">
                                    <Label htmlFor="reason">Reason (Optional)</Label>
                                    <Input id="reason" name="reason" placeholder="e.g., Emergency medical expense" />
                                </div>
                                <Button type="submit">Submit Request</Button>
                            </form>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Request History</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Request ID</TableHead>
                                        <TableHead>Date</TableHead>
                                        <TableHead>Amount</TableHead>
                                        <TableHead className="text-right">Status</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {history.map(item => (
                                        <TableRow key={item.id}>
                                            <TableCell className="font-medium">{item.id}</TableCell>
                                            <TableCell>{item.date}</TableCell>
                                            <TableCell>{formatCurrency(item.amount)}</TableCell>
                                            <TableCell className="text-right">
                                                <Badge variant={item.status === 'Pending Approval' ? 'destructive' : item.status === 'Paid Back' ? 'secondary' : 'default'}>
                                                    {item.status}
                                                </Badge>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                             {history.length === 0 && (
                                <p className="text-center text-muted-foreground py-4">No advance history found.</p>
                            )}
                        </CardContent>
                    </Card>

                </div>

                <div className="md:col-span-1">
                    <Card className="bg-muted">
                        <CardHeader>
                            <CardTitle>Eligibility</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                           <div className="flex justify-between items-center">
                                <span className="text-sm font-medium text-muted-foreground">Available for Advance</span>
                                <span className="font-bold text-lg">{formatCurrency(1950000)}</span>
                           </div>
                           <div className="flex justify-between items-center">
                                <span className="text-sm font-medium text-muted-foreground">Max per Request</span>
                                <span className="font-bold text-lg">{formatCurrency(650000)}</span>
                           </div>
                           <div className="flex justify-between items-center">
                                <span className="text-sm font-medium text-muted-foreground">Service Fee</span>
                                <span className="font-bold text-lg">2%</span>
                           </div>
                           <p className="text-xs text-muted-foreground pt-4">
                                Eligibility and limits are set by your employer. Terms and conditions apply.
                           </p>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
