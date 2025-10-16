import { NextResponse } from 'next/server';
import { getDepartments, addDepartment } from '@/lib/api';

export async function GET() {
  const departments = getDepartments();
  return NextResponse.json(departments);
}

export async function POST(request: Request) {
  const body = await request.json();
  const { name, head } = body;
  if (!name || !head) {
    return NextResponse.json({ error: 'Missing name or head' }, { status: 400 });
  }
  const newDepartment = addDepartment({ name, head });
  return NextResponse.json(newDepartment, { status: 201 });
}
