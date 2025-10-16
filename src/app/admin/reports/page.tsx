
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
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import type { Employee, Department } from '@/lib/data';
import { DateRangePicker } from '@/components/date-range-picker';
import { Download } from 'lucide-react';
import { DateRange } from 'react-day-picker';
import useSWR from 'swr';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';

type ReportData = {
    id: string;
    name: string;
    department: string;
    role: string;
    hireDate?: string;
    terminationDate: string;
};

const fetcher = (url: string) => fetch(url).then(res => res.json());

export default function ReportsPage() {
    const { toast } = useToast();
    const { data: employees, error: employeesError } = useSWR<Employee[]>('/api/employees', fetcher);
    const { data: departments, error: departmentsError } = useSWR<Department[]>('/api/departments', fetcher);

    const [reportType, setReportType] = React.useState('hiring');
    const [departmentFilter, setDepartmentFilter] = React.useState('all');
    const [dateRange, setDateRange] = React.useState<DateRange | undefined>({
        from: new Date(new Date().getFullYear(), 0, 1),
        to: new Date(),
    });
    const [generatedReport, setGeneratedReport] = React.useState<ReportData[]>([]);
    const [reportTitle, setReportTitle] = React.useState('');

    const handleGenerateReport = () => {
        if (!employees) return;

        let filteredEmployees = employees;

        if (departmentFilter !== 'all') {
            const selectedDept = departments?.find(d => d.id === departmentFilter);
            if(selectedDept) {
                filteredEmployees = filteredEmployees.filter(e => e.department === selectedDept.name);
            }
        }
        
        const report = filteredEmployees.map(e => ({
            ...e,
            terminationDate: e.status === 'Inactive' ? '2024-03-20' : '-', // Example static date
        }));

        setGeneratedReport(report);
        
        const selectedDeptName = departments?.find(d => d.id === departmentFilter)?.name || 'All Departments';
        const fromDate = dateRange?.from ? format(dateRange.from, 'MMM dd, yyyy') : 'start';
        const toDate = dateRange?.to ? format(dateRange.to, 'MMM dd, yyyy') : 'end';
        
        setReportTitle(`Report: Hiring & Terminations for ${selectedDeptName} (${fromDate} - ${toDate})`);
        
        toast({
            title: 'Report Generated',
            description: `Showing ${report.length} records.`,
        });
    };

    const handleExport = () => {
        if (generatedReport.length === 0) {
            toast({ variant: 'destructive', title: 'No data to export', description: 'Please generate a report first.'});
            return;
        };

        const headers = ["ID", "Name", "Department", "Role", "Hire Date", "Termination Date"];
        const csvContent = [
            headers.join(','),
            ...generatedReport.map(item => 
                [item.id, item.name, item.department, item.role, item.hireDate, item.terminationDate].join(',')
            )
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.href = url;
        link.setAttribute('download', `report.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        toast({ title: 'Exported', description: 'The report has been exported as a CSV file.' });
    }
    
    if (employeesError || departmentsError) return <div>Failed to load data.</div>;
    if (!employees || !departments) return <div>Loading...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Reports</h1>
          <p className="text-muted-foreground">
            Generate and export reports on hiring, terminations, and more.
          </p>
        </div>
         <Button variant="outline" onClick={handleExport}>
            <Download className="mr-2 h-4 w-4" />
            Export
        </Button>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Generate Report</CardTitle>
          <CardDescription>
            Select filters to generate a specific report.
          </CardDescription>
        </CardHeader>
        <CardContent>
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
                <Select value={reportType} onValueChange={setReportType}>
                    <SelectTrigger className="w-full sm:w-[200px]">
                        <SelectValue placeholder="Report Type" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="hiring">Hiring & Terminations</SelectItem>
                        <SelectItem value="payroll" disabled>Payroll Summary</SelectItem>
                        <SelectItem value="leave" disabled>Leave Balance</SelectItem>
                    </SelectContent>
                </Select>
                <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
                    <SelectTrigger className="w-full sm:w-[200px]">
                        <SelectValue placeholder="Department" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Departments</SelectItem>
                        {departments.map(dep => <SelectItem key={dep.id} value={dep.id}>{dep.name}</SelectItem>)}
                    </SelectContent>
                </Select>
                 <DateRangePicker date={dateRange} onDateChange={setDateRange} />
                 <Button className="w-full sm:w-auto" onClick={handleGenerateReport}>Generate</Button>
            </div>

            {reportTitle && <p className='text-sm font-medium mb-4'>{reportTitle}</p>}
            
             <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Employee Name</TableHead>
                        <TableHead>Department</TableHead>
                        <TableHead>Role</TableHead>
                        <TableHead>Hire Date</TableHead>
                        <TableHead>Termination Date</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {generatedReport.length > 0 ? (
                        generatedReport.map((item) => (
                            <TableRow key={item.id}>
                                <TableCell className="font-medium">{item.name}</TableCell>
                                <TableCell>{item.department}</TableCell>
                                <TableCell>{item.role}</TableCell>
                                <TableCell>{item.hireDate}</TableCell>
                                <TableCell>{item.terminationDate}</TableCell>
                            </TableRow>
                        ))
                    ) : (
                        <TableRow>
                            <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                                No report data. Click "Generate" to see results.
                            </TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>
        </CardContent>
      </Card>
    </div>
  );
}

    