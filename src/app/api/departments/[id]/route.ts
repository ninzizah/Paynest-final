import { NextResponse } from 'next/server';
import { getDepartmentById, updateDepartment, deleteDepartment } from '@/lib/api';

export async function GET(request: Request, { params }: { params: { id: string } }) {
  const department = getDepartmentById(params.id);
  if (!department) {
    return NextResponse.json({ error: 'Department not found' }, { status: 404 });
  }
  return NextResponse.json(department);
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  const body = await request.json();
  const updatedDepartment = updateDepartment(params.id, body);
  if (!updatedDepartment) {
    return NextResponse.json({ error: 'Department not found' }, { status: 404 });
  }
  return NextResponse.json(updatedDepartment);
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  const result = deleteDepartment(params.id);
  if (!result.success) {
    return NextResponse.json({ error: 'Department not found' }, { status: 404 });
  }
  return NextResponse.json({ success: true }, { status: 200 });
}
