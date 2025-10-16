import { NextResponse } from 'next/server';
import { getLeaveRequestById, updateLeaveRequest } from '@/lib/api';

export async function GET(request: Request, { params }: { params: { id: string } }) {
  const leaveRequest = getLeaveRequestById(params.id);
  if (!leaveRequest) {
    return NextResponse.json({ error: 'Leave request not found' }, { status: 404 });
  }
  return NextResponse.json(leaveRequest);
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  const body = await request.json();
  const updatedRequest = updateLeaveRequest(params.id, body);
  if (!updatedRequest) {
    return NextResponse.json({ error: 'Leave request not found' }, { status: 404 });
  }
  return NextResponse.json(updatedRequest);
}
