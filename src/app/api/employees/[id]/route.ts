import { NextResponse } from 'next/server';
import { getEmployeeById, updateEmployee } from '@/lib/api';

export async function GET(request: Request, { params }: { params: { id: string } }) {
  const employee = getEmployeeById(params.id);
  if (!employee) {
    return NextResponse.json({ error: 'Employee not found' }, { status: 404 });
  }
  return NextResponse.json(employee);
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  const body = await request.json();
  const updatedEmployee = updateEmployee(params.id, body);
  if (!updatedEmployee) {
    return NextResponse.json({ error: 'Employee not found' }, { status: 404 });
  }
  return NextResponse.json(updatedEmployee);
}
