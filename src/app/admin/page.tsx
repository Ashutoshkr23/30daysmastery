"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { PremiumButton } from "@/components/ui/PremiumButton";
import { Check, X, Loader2 } from "lucide-react";
import { GlassCard } from "@/components/ui/GlassCard";
import Link from "next/link";

interface PaymentRequest {
    id: string;
    user_id: string;
    transaction_id: string;
    amount: number;
    status: 'pending' | 'approved' | 'rejected';
    created_at: string;
    email?: string; // Optional if we join
}

export default function AdminDashboard() {
    const [requests, setRequests] = useState<PaymentRequest[]>([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState<string | null>(null);

    const supabase = createClient();

    useEffect(() => {
        fetchRequests();
    }, []);

    const fetchRequests = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('payment_requests')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) {
            console.error("Error fetching requests:", error);
        } else {
            setRequests(data as PaymentRequest[]);
        }
        setLoading(false);
    };

    const handleAction = async (requestId: string, userId: string, action: 'approved' | 'rejected') => {
        setActionLoading(requestId);
        try {
            // 1. Update Request Status
            const { error: reqError } = await supabase
                .from('payment_requests')
                .update({ status: action })
                .eq('id', requestId);

            if (reqError) throw reqError;

            // 2. If Approved, Upgrade User
            if (action === 'approved') {
                // Update Profile 'is_premium'
                const { error: profileError } = await supabase
                    .from('profiles')
                    .update({ is_premium: true })
                    .eq('id', userId);

                // If profile doesn't exist, try creating it? Or handle error.
                if (profileError) console.error("Profile update error:", profileError);
            }

            // Refresh
            await fetchRequests();

        } catch (error) {
            console.error("Action failed:", error);
            alert("Action failed");
        } finally {
            setActionLoading(null);
        }
    };

    return (
        <div className="min-h-screen bg-black text-white p-8 font-sans">
            <header className="mb-8 flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent">
                        Admin Dashboard
                    </h1>
                    <p className="text-muted-foreground">Manage payment verification requests</p>
                </div>
                <Link href="/dashboard" className="text-sm underline text-zinc-400 hover:text-white">
                    Back to App
                </Link>
            </header>

            {loading ? (
                <div className="flex justify-center p-12">
                    <Loader2 className="h-8 w-8 animate-spin text-amber-500" />
                </div>
            ) : (
                <div className="space-y-6">
                    <GlassCard className="p-6">
                        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-yellow-500 animate-pulse" />
                            Pending Requests ({requests.filter(r => r.status === 'pending').length})
                        </h2>

                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm">
                                <thead className="text-muted-foreground border-b border-white/10">
                                    <tr>
                                        <th className="p-3">Date</th>
                                        <th className="p-3">UTR / Transaction ID</th>
                                        <th className="p-3">Amount</th>
                                        <th className="p-3">User ID</th>
                                        <th className="p-3">Status</th>
                                        <th className="p-3 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5">
                                    {requests.map((req) => (
                                        <tr key={req.id} className="hover:bg-white/5 transition-colors">
                                            <td className="p-3 font-mono text-zinc-400">
                                                {new Date(req.created_at).toLocaleDateString()}
                                            </td>
                                            <td className="p-3 font-mono font-bold text-white tracking-wide">
                                                {req.transaction_id}
                                            </td>
                                            <td className="p-3 text-green-400">₹{req.amount}</td>
                                            <td className="p-3 font-mono text-xs text-zinc-500 truncate max-w-[100px]" title={req.user_id}>
                                                {req.user_id}
                                            </td>
                                            <td className="p-3">
                                                <span className={`px-2 py-1 rounded-full text-xs font-bold ${req.status === 'pending' ? 'bg-yellow-500/20 text-yellow-500' :
                                                        req.status === 'approved' ? 'bg-green-500/20 text-green-500' :
                                                            'bg-red-500/20 text-red-500'
                                                    }`}>
                                                    {req.status.toUpperCase()}
                                                </span>
                                            </td>
                                            <td className="p-3 text-right space-x-2">
                                                {req.status === 'pending' && (
                                                    <>
                                                        <button
                                                            onClick={() => handleAction(req.id, req.user_id, 'approved')}
                                                            disabled={!!actionLoading}
                                                            className="p-2 bg-green-500/20 text-green-500 rounded-lg hover:bg-green-500 hover:text-black transition-colors disabled:opacity-50"
                                                            title="Approve"
                                                        >
                                                            {actionLoading === req.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                                                        </button>
                                                        <button
                                                            onClick={() => handleAction(req.id, req.user_id, 'rejected')}
                                                            disabled={!!actionLoading}
                                                            className="p-2 bg-red-500/20 text-red-500 rounded-lg hover:bg-red-500 hover:text-black transition-colors disabled:opacity-50"
                                                            title="Reject"
                                                        >
                                                            <X className="h-4 w-4" />
                                                        </button>
                                                    </>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                    {requests.length === 0 && (
                                        <tr>
                                            <td colSpan={6} className="p-8 text-center text-muted-foreground">
                                                No requests found.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </GlassCard>
                </div>
            )}
        </div>
    );
}
