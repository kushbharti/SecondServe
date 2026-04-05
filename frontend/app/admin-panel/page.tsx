'use client';
import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { Check, X, ShieldAlert, Users } from 'lucide-react';
import { useAuthStore } from '@/store/useAuthStore';
import { useRouter } from 'next/navigation';

export default function AdminDashboardPage() {
    const [pending, setPending] = useState([]);
    const [loading, setLoading] = useState(true);
    const { user } = useAuthStore();
    const router = useRouter();

    useEffect(() => {
        if (!user) return;
        // Basic protection check on frontend
        if (user.role !== 'admin') {
           router.push('/login');
           return;
        }
        fetchPending();
    }, [user, router]);

    const fetchPending = async () => {
        try {
            const res = await api.get('/admin/receivers/');
            setPending(res.data?.data || res.data || []);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleAction = async (id: string, action: 'approve' | 'reject') => {
        try {
            await api.patch(`/admin/receivers/${id}/${action}/`);
            fetchPending();
        } catch (err) {
            console.error(err);
            alert(`Failed to ${action} receiver`);
        }
    };

    if (loading) return <div className="flex h-[50vh] items-center justify-center text-muted-foreground">Loading admin dashboard...</div>;

    return (
        <div className="container mx-auto p-8 max-w-5xl animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center gap-3 mb-8">
                <ShieldAlert className="h-8 w-8 text-primary" />
                <h1 className="text-3xl font-bold tracking-tight">Admin Control Panel</h1>
            </div>

            <div className="bg-card rounded-2xl border shadow-sm p-6 overflow-hidden">
                <div className="flex items-center gap-2 mb-6 border-b pb-4">
                    <Users className="h-5 w-5 text-muted-foreground" />
                    <h2 className="text-xl font-semibold">Pending Receiver Approvals</h2>
                </div>

                {pending.length === 0 ? (
                    <div className="text-center py-16 px-4">
                        <div className="bg-muted h-16 w-16 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Check className="h-8 w-8 text-muted-foreground" />
                        </div>
                        <h3 className="font-semibold text-lg mb-1">All Caught Up!</h3>
                        <p className="text-muted-foreground text-sm">There are no pending applications found at this time.</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {pending.map((req: any) => (
                            <div key={req.id} className="flex flex-col md:flex-row md:items-center justify-between p-5 bg-muted/40 rounded-xl border border-border/50 hover:border-border transition-colors">
                                <div>
                                    <div className="flex items-center gap-3 mb-1">
                                        <h3 className="font-semibold text-lg">{req.organization_name || req.hospital_name || req.full_name}</h3>
                                        <span className="px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800 text-xs font-bold uppercase tracking-wider">{req.role.replace(/_/g, ' ')}</span>
                                    </div>
                                    <div className="text-sm text-muted-foreground space-y-1.5 mt-3">
                                        <div className="flex items-center gap-2"><span className="font-medium text-foreground">Email:</span> {req.email}</div>
                                        <div className="flex items-center gap-2"><span className="font-medium text-foreground">Reg No:</span> {req.registration_number || req.cci_registration_number || req.hospital_registration_number || req.government_license_number || 'N/A'}</div>
                                        <div className="flex items-center gap-2"><span className="font-medium text-foreground">Address:</span> {req.address_line1}, {req.city}, {req.state} - {req.pincode}</div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 mt-5 md:mt-0">
                                    <button onClick={() => handleAction(req.id, 'approve')} className="flex items-center gap-2 bg-emerald-600 text-white px-5 py-2.5 rounded-xl text-sm font-semibold shadow-sm hover:bg-emerald-700 hover:shadow transition-all active:scale-95">
                                        <Check className="h-4 w-4" /> Approve
                                    </button>
                                    <button onClick={() => handleAction(req.id, 'reject')} className="flex items-center gap-2 bg-destructive/10 text-destructive px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-destructive/20 transition-all active:scale-95">
                                        <X className="h-4 w-4" /> Reject
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
