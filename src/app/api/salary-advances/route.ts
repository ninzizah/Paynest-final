import { NextResponse } from 'next/server';
import { getSalaryAdvances, addSalaryAdvance } from '@/lib/api';

export async function GET() {
  const requests = getSalaryAdvances();
  return NextResponse.json(requests);
}

export async function POST(request: Request) {
  const body = await request.json();
  const newRequest = addSalaryAdvance(body);
  return NextResponse.json(newRequest, { status: 201 });
}
