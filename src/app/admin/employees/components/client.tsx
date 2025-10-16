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
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { Employee, Department } from '@/lib/data';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { MoreHorizontal, PlusCircle } from 'lucide-react';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { useEffect } from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useRouter } from 'next/navigation';
import { useActiveEmployee } from '@/hooks/use-active-employee';
import useSWR from 'swr';
import { useToast } from '@/hooks/use-toast';

interface EmployeesClientProps {
  currentUserRole: 'admin' | 'hr' | 'employee';
}

const fetcher = (url: string) => fetch(url).then(res => res.json());

export function EmployeesClient({ currentUserRole }: EmployeesClientProps) {
  const router = useRouter();
  const { toast } = useToast();
  const { data: employees, error: employeesError, mutate: mutateEmployees } = useSWR<Employee[]>('/api/employees', fetcher);
  const { data: departments, error: departmentsError } = useSWR<Department[]>('/api/departments', fetcher);
  
  const { setActiveEmployeeId } = useActiveEmployee();
  
  const [filteredData, setFilteredData] = React.useState<Employee[]>([]);
  const [filter, setFilter] = React.useState('');
  const [departmentFilter, setDepartmentFilter] = React.useState('all');
  const [open, setOpen] = React.useState(false);

  const [isEditDialogOpen, setIsEditDialogOpen] = React.useState(false);
  const [isDeactivateDialogOpen, setIsDeactivateDialogOpen] = React.useState(false);
  const [selectedEmployee, setSelectedEmployee] = React.useState<Employee | null>(null);

  useEffect(() => {
    const storedDepartmentFilter = sessionStorage.getItem('departmentFilter');
    if (storedDepartmentFilter) {
      setDepartmentFilter(storedDepartmentFilter);
      sessionStorage.removeItem('departmentFilter'); // Clear it after use
    }
  }, []);
  

  React.useEffect(() => {
    if (employees) {
      let result = employees;
      if (filter) {
        result = result.filter(
          (employee) =>
            employee.name.toLowerCase().includes(filter.toLowerCase()) ||
            employee.email.toLowerCase().includes(filter.toLowerCase())
        );
      }
      if (departmentFilter !== 'all') {
        result = result.filter(
          (employee) => employee.department === departmentFilter
        );
      }
      setFilteredData(result);
    }
  }, [filter, departmentFilter, employees]);
  
  const departmentNames = departments ? [...new Set(departments.map((item) => item.name))] : [];

  const handleAddEmployee = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);
    const name = formData.get('name') as string;
    const email = formData.get('email') as string;
    const phone = formData.get('phone') as string;
    const department = formData.get('department') as string;
    const role = formData.get('role') as string;
    const password = formData.get('password') as string;

    if (name && email && phone && department && role && password) {
        const res = await fetch('/api/employees', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, email, phone, department, role, password }),
        });
        if (res.ok) {
            const newEmployee = await res.json();
            mutateEmployees([...(employees || []), newEmployee]);
            toast({ title: 'Success', description: 'Employee added.' });
            setOpen(false);
            form.reset();
        } else {
            toast({ variant: 'destructive', title: 'Error', description: 'Failed to add employee.' });
        }
    }
  };

  const handleEditEmployee = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!selectedEmployee) return;

    const form = event.currentTarget;
    const formData = new FormData(form);
    const name = formData.get('name') as string;
    const email = formData.get('email') as string;
    const phone = formData.get('phone') as string;
    const department = formData.get('department') as string;
    const role = formData.get('role') as string;
    const password = formData.get('password') as string;
    const updates: Partial<Employee> = { name, email, phone, department, role };
    if (password) {
        updates.password = password;
    }


    if (name && email && phone && department && role) {
      const res = await fetch(`/api/employees/${selectedEmployee.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updates),
      });
      if (res.ok) {
          const updatedEmployee = await res.json();
          mutateEmployees(employees?.map(e => e.id === updatedEmployee.id ? updatedEmployee : e));
          toast({ title: 'Success', description: 'Employee updated.' });
          setIsEditDialogOpen(false);
          setSelectedEmployee(null);
      } else {
          toast({ variant: 'destructive', title: 'Error', description: 'Failed to update employee.' });
      }
    }
  };

  const handleDeactivateEmployee = async () => {
    if (!selectedEmployee) return;
    const res = await fetch(`/api/employees/${selectedEmployee.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'Inactive' }),
    });
    if (res.ok) {
        const updatedEmployee = await res.json();
        mutateEmployees(employees?.map(e => e.id === updatedEmployee.id ? updatedEmployee : e));
        toast({ title: 'Success', description: 'Employee deactivated.' });
        setIsDeactivateDialogOpen(false);
        setSelectedEmployee(null);
    } else {
        toast({ variant: 'destructive', title: 'Error', description: 'Failed to deactivate employee.' });
    }
  };
  
  const openEditDialog = (employee: Employee) => {
    setSelectedEmployee(employee);
    setIsEditDialogOpen(true);
  };

  const openDeactivateDialog = (employee: Employee) => {
    setSelectedEmployee(employee);
    setIsDeactivateDialogOpen(true);
  };

  const handleViewProfile = (employeeId: string) => {
    setActiveEmployeeId(employeeId);
    router.push('/employee/profile');
  };

  if (employeesError || departmentsError) return <div>Failed to load</div>
  if (!employees || !departments) return <div>Loading...</div>


  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
              <div>
                  <CardTitle>All Employees</CardTitle>
                  <CardDescription>
                  A list of all employees in your organization.
                  </CardDescription>
              </div>
              {currentUserRole === 'admin' && (
                <Dialog open={open} onOpenChange={setOpen}>
                <DialogTrigger asChild>
                    <Button>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Add Employee
                    </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                    <form onSubmit={handleAddEmployee}>
                      <DialogHeader>
                      <DialogTitle>Add New Employee</DialogTitle>
                      <DialogDescription>
                          Fill in the details below to create a new employee account.
                      </DialogDescription>
                      </DialogHeader>
                      <div className="grid gap-4 py-4">
                      <div className="grid grid-cols-4 items-center gap-4">
                          <Label htmlFor="name" className="text-right">
                          Name
                          </Label>
                          <Input id="name" name="name" placeholder="John Doe" className="col-span-3" required />
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                          <Label htmlFor="email" className="text-right">
                          Email
                          </Label>
                          <Input id="email" name="email" type="email" placeholder="john.doe@example.com" className="col-span-3" required />
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                          <Label htmlFor="phone" className="text-right">
                          Phone
                          </Label>
                          <Input id="phone" name="phone" type="tel" placeholder="+1 (555) 123-4567" className="col-span-3" required />
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                          <Label htmlFor="department" className="text-right">
                          Department
                          </Label>
                          <Select name="department" required>
                              <SelectTrigger className="col-span-3">
                                  <SelectValue placeholder="Select a department" />
                              </SelectTrigger>
                              <SelectContent>
                                  {departmentNames.map((dep) => (
                                      <SelectItem key={dep} value={dep}>
                                          {dep}
                                      </SelectItem>
                                  ))}
                              </SelectContent>
                          </Select>
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                          <Label htmlFor="role" className="text-right">
                          Role
                          </Label>
                          <Input id="role" name="role" placeholder="e.g. Software Engineer" className="col-span-3" required />
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                          <Label htmlFor="password" className="text-right">
                          Password
                          </Label>
                          <Input id="password" name="password" type="password" className="col-span-3" required />
                      </div>
                      </div>
                      <DialogFooter>
                      <Button variant="outline" type="button" onClick={() => setOpen(false)}>Cancel</Button>
                      <Button type="submit">Create Employee</Button>
                      </DialogFooter>
                    </form>
                </DialogContent>
                </Dialog>
              )}
          </div>

          <div className="flex items-center gap-2 pt-4">
            <Input
              placeholder="Filter by name or email..."
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="max-w-sm"
            />
            <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Department" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Departments</SelectItem>
                {departmentNames.map((dep) => (
                  <SelectItem key={dep} value={dep}>
                    {dep}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Employee</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>
                  <span className="sr-only">Actions</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredData.map((employee) => (
                <TableRow key={employee.id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-3">
                      <div className="grid gap-0.5">
                        <span className="font-medium">{employee.name}</span>
                        <span className="text-sm text-muted-foreground">
                          {employee.email}
                        </span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{employee.department}</TableCell>
                  <TableCell>{employee.role}</TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        employee.status === 'Active' ? 'default' : 'destructive'
                      }
                    >
                      {employee.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button aria-haspopup="true" size="icon" variant="ghost">
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">Toggle menu</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem onClick={() => openEditDialog(employee)}>Edit</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleViewProfile(employee.id)}>View Profile</DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive" onClick={() => openDeactivateDialog(employee)}>
                          Deactivate
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {filteredData.length === 0 && (
            <div className="text-center py-10 text-muted-foreground">
              No employees found.
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <form onSubmit={handleEditEmployee}>
            <DialogHeader>
              <DialogTitle>Edit Employee</DialogTitle>
              <DialogDescription>
                Update the details for {selectedEmployee?.name}.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name-edit" className="text-right">
                  Name
                </Label>
                <Input id="name-edit" name="name" defaultValue={selectedEmployee?.name} className="col-span-3" required />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="email-edit" className="text-right">
                  Email
                </Label>
                <Input id="email-edit" name="email" type="email" defaultValue={selectedEmployee?.email} className="col-span-3" required />
              </div>
               <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="phone" className="text-right">
                  Phone
                  </Label>
                  <Input id="phone" name="phone" type="tel" defaultValue={selectedEmployee?.phone} className="col-span-3" required />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="department-edit" className="text-right">
                  Department
                </Label>
                <Select name="department" defaultValue={selectedEmployee?.department} required>
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select a department" />
                  </SelectTrigger>
                  <SelectContent>
                    {departmentNames.map((dep) => (
                      <SelectItem key={dep} value={dep}>
                        {dep}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="role-edit" className="text-right">
                  Role
                </Label>
                <Input id="role-edit" name="role" defaultValue={selectedEmployee?.role} className="col-span-3" required />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="password-edit" className="text-right">
                  Password
                </Label>
                <Input id="password-edit" name="password" type="password" placeholder="Leave blank to keep current password" className="col-span-3" />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" type="button" onClick={() => setIsEditDialogOpen(false)}>Cancel</Button>
              <Button type="submit">Save Changes</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={isDeactivateDialogOpen} onOpenChange={setIsDeactivateDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will set the status of <strong>{selectedEmployee?.name}</strong> to &quot;Inactive&quot;.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setSelectedEmployee(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeactivateEmployee} className="bg-destructive hover:bg-destructive/90">
              Deactivate
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
