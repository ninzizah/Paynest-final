import { NextResponse } from 'next/server';
import { getSalaryAdvanceById, updateSalaryAdvance } from '@/lib/api';

export async function GET(request: Request, { params }: { params: { id: string } }) {
  const advance = getSalaryAdvanceById(params.id);
  if (!advance) {
    return NextResponse.json({ error: 'Salary advance not found' }, { status: 404 });
  }
  return NextResponse.json(advance);
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  const body = await request.json();
  const updatedAdvance = updateSalaryAdvance(params.id, body);
  if (!updatedAdvance) {
    return NextResponse.json({ error: 'Salary advance not found' }, { status: 404 });
  }
  return NextResponse.json(updatedAdvance);
}
