import { NextResponse } from 'next/server';
import { getLeaveRequests, addLeaveRequest } from '@/lib/api';

export async function GET() {
  const requests = getLeaveRequests();
  return NextResponse.json(requests);
}

export async function POST(request: Request) {
  const body = await request.json();
  const newRequest = addLeaveRequest(body);
  return NextResponse.json(newRequest, { status: 201 });
}
