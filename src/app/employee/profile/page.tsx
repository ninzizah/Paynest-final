'use client';

import * as React from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from '@/hooks/use-toast';
import type { Employee } from '@/lib/data';
import { Eye, EyeOff } from 'lucide-react';
import { useActiveEmployee } from '@/hooks/use-active-employee';
import useSWR from 'swr';

const fetcher = (url: string) => fetch(url).then(res => res.json());

export default function ProfilePage() {
    const { toast } = useToast();
    const { activeEmployeeId } = useActiveEmployee();
    const { data: user, error, mutate } = useSWR<Employee>(activeEmployeeId ? `/api/employees/${activeEmployeeId}` : null, fetcher);
    
    const [formData, setFormData] = React.useState<Partial<Employee>>({});
    const [showPassword, setShowPassword] = React.useState(false);

    React.useEffect(() => {
        if (user) {
            setFormData(user);
        }
    }, [user]);

    if (error) return <div>Failed to load profile.</div>
    if (!user) {
        return <div>Loading profile...</div>;
    }

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { id, value } = e.target;
        setFormData(prev => ({ ...prev, [id]: value }));
    };
    
    const handleSaveChanges = async () => {
        if (!user) return;
        
        const res = await fetch(`/api/employees/${user.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData),
        });

        if (res.ok) {
            const updatedUser = await res.json();
            mutate(updatedUser);
            toast({
                title: "Profile Updated",
                description: "Your information has been successfully saved.",
            });
        } else {
             toast({
                variant: 'destructive',
                title: "Update Failed",
                description: "There was an error saving your profile.",
            });
        }
    };
    
    const handleDiscardChanges = () => {
        if (user) {
            setFormData(user);
        }
        toast({
            variant: "default",
            title: "Changes Discarded",
            description: "Your profile information has been reverted.",
        });
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">My Profile</h1>
                <p className="text-muted-foreground">View and manage your personal and employment details.</p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Personal Information</CardTitle>
                    <CardDescription>This information is visible across the platform.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <Label htmlFor="name">Full Name</Label>
                            <Input id="name" value={formData.name || ''} onChange={handleInputChange} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="email">Email Address</Label>
                            <Input id="email" type="email" value={formData.email || ''} onChange={handleInputChange} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="phone">Phone Number</Label>
                            <Input id="phone" type="tel" value={formData.phone || ''} onChange={handleInputChange} placeholder="+1 (555) 123-4567"/>
                        </div>
                         <div className="space-y-2 relative">
                            <Label htmlFor="password">Password</Label>
                            <Input 
                                id="password" 
                                type={showPassword ? 'text' : 'password'} 
                                value={formData.password || ''} 
                                onChange={handleInputChange} 
                                className="pr-10"
                                placeholder="Enter new password to update"
                            />
                            <Button 
                                type="button"
                                variant="ghost" 
                                size="icon" 
                                className="absolute right-1 top-7 h-7 w-7 text-muted-foreground"
                                onClick={() => setShowPassword(prev => !prev)}
                            >
                                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                <span className="sr-only">{showPassword ? 'Hide password' : 'Show password'}</span>
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Employment Details</CardTitle>
                    <CardDescription>Your current role and department information.</CardDescription>
                </CardHeader>
                <CardContent className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <Label>Employee ID</Label>
                        <p className="text-sm font-medium p-2 h-10 border border-input rounded-md flex items-center bg-muted">{formData.id || 'N/A'}</p>
                    </div>
                    <div className="space-y-2">
                        <Label>Date of Hire</Label>
                        <p className="text-sm font-medium p-2 h-10 border border-input rounded-md flex items-center bg-muted">{formData.hireDate || 'N/A'}</p>
                    </div>
                    <div className="space-y-2">
                        <Label>Department</Label>
                        <p className="text-sm font-medium p-2 h-10 border border-input rounded-md flex items-center bg-muted">{formData.department || 'N/A'}</p>
                    </div>
                    <div className="space-y-2">
                        <Label>Role</Label>
                        <p className="text-sm font-medium p-2 h-10 border border-input rounded-md flex items-center bg-muted">{formData.role || 'N/A'}</p>
                    </div>
                </CardContent>
            </Card>
            
            <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={handleDiscardChanges}>Discard Changes</Button>
                <Button onClick={handleSaveChanges}>Save Changes</Button>
            </div>

        </div>
    );
}
