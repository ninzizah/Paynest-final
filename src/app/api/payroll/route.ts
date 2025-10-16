import { NextResponse } from 'next/server';
import { getPayrollRuns, runPayroll } from '@/lib/api';

export async function GET() {
  const runs = getPayrollRuns();
  return NextResponse.json(runs);
}

export async function POST(request: Request) {
  const body = await request.json();
  const { dateRange } = body;
  const newRun = runPayroll(dateRange);
  return NextResponse.json(newRun, { status: 201 });
}
