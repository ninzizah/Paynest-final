
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MOCK_USERS, employees } from "@/lib/data";
import { usePathname } from 'next/navigation';
import type { MockUser } from '@/lib/data';
import React from "react";

export default function SettingsPage() {
    const pathname = usePathname();
    const [user, setUser] = React.useState<MockUser | undefined>(undefined);

    React.useEffect(() => {
        const currentRole = pathname.split('/')[1] || 'admin';
        let currentUser: MockUser | undefined;

        if (currentRole === 'admin') {
            currentUser = MOCK_USERS.admin;
        } else if (currentRole === 'hr') {
            currentUser = MOCK_USERS.hr;
        } else if (currentRole === 'employee') {
            const employeeUser = employees.find(e => e.id === 'EMP001');
            if (employeeUser) {
                currentUser = {
                    role: 'employee' as const,
                    name: employeeUser.name,
                    email: employeeUser.email,
                    phone: employeeUser.phone,
                    id: employeeUser.id,
                };
            }
        }
        setUser(currentUser);
    }, [pathname]);
    
    if (!user) {
        return (
            <div className="space-y-6">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
                    <p className="text-muted-foreground">Manage your account settings.</p>
                </div>
                 <Card>
                    <CardHeader>
                        <CardTitle>Account</CardTitle>
                        <CardDescription>Loading user information...</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <p>Loading settings...</p>
                    </CardContent>
                </Card>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
                <p className="text-muted-foreground">Manage your account settings.</p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Account</CardTitle>
                    <CardDescription>Your account information.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                     <div className="space-y-2">
                        <Label htmlFor="name">Name</Label>
                        <Input id="name" defaultValue={user.name} readOnly />
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input id="email" type="email" defaultValue={user.email} readOnly />
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
