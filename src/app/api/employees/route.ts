import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { addEmployee } from '@/lib/api';

export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db("paynest"); // Choose a name for your database

    const employees = await db
      .collection("employees") // Create a "employees" collection
      .find({})
      .sort({ name: 1 })
      .toArray();

    return NextResponse.json(employees);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to fetch employees' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const newEmployee = addEmployee(body);
    // In a real scenario, you would insert this into the database
    // For now, it just returns the object created in memory
    return NextResponse.json(newEmployee, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create employee' }, { status: 500 });
  }
}
