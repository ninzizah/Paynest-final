import { NextResponse } from 'next/server';
import { getSalaryAdvancesForEmployee } from '@/lib/api';

export async function GET(request: Request, { params }: { params: { id: string } }) {
  const advances = getSalaryAdvancesForEmployee(params.id);
  return NextResponse.json(advances);
}
