import { NextResponse } from 'next/server';
import { getPayslipsForEmployee } from '@/lib/api';
import { URL } from 'url';

export async function GET(request: Request, { params }: { params: { id: string } }) {
  const { searchParams } = new URL(request.url);
  const limit = searchParams.get('limit');
  const payslips = getPayslipsForEmployee(params.id, limit ? parseInt(limit, 10) : undefined);
  return NextResponse.json(payslips);
}
