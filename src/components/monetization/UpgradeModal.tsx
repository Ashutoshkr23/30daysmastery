"use client";

import { useState, useEffect } from "react";
import { PremiumButton } from "@/components/ui/PremiumButton";
import { Copy, Check, QrCode, Loader2, X } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { trackUpgradeModalView, trackPaymentInitiated, trackUTRSubmitted } from "@/lib/analytics";
import { createPortal } from "react-dom";

interface UpgradeModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function UpgradeModal({ open, onOpenChange }: UpgradeModalProps) {
    const [utr, setUtr] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [hasTrackedPaymentInit, setHasTrackedPaymentInit] = useState(false);
    const [userId, setUserId] = useState<string | null>(null);
    const [premiumUserCount, setPremiumUserCount] = useState<number>(0);
    const [loadingCount, setLoadingCount] = useState(true);

    // Simple toast state since we don't have the hook
    const [toastMessage, setToastMessage] = useState<{ title: string, type: 'success' | 'error' } | null>(null);

    // Pricing configuration
    const EARLY_BIRD_LIMIT = 100;
    const EARLY_BIRD_PRICE = 49;
    const REGULAR_PRICE = 99;
    const UPI_ID = "8209127958@ybl";

    // Calculate current price based on premium user count
    const currentPrice = premiumUserCount < EARLY_BIRD_LIMIT ? EARLY_BIRD_PRICE : REGULAR_PRICE;
    const spotsRemaining = Math.max(0, EARLY_BIRD_LIMIT - premiumUserCount);
    const progressPercentage = Math.min(100, (premiumUserCount / EARLY_BIRD_LIMIT) * 100);

    // Get userId once when component mounts
    useEffect(() => {
        const getUserId = async () => {
            const supabase = createClient();
            const { data: { user } } = await supabase.auth.getUser();
            if (user) setUserId(user.id);
        };
        getUserId();
    }, []);

    // Fetch premium user count when modal opens
    useEffect(() => {
        if (open) {
            const fetchPremiumCount = async () => {
                try {
                    const supabase = createClient();
                    const { count, error } = await supabase
                        .from('user_metrics')
                        .select('*', { count: 'exact', head: true })
                        .eq('is_premium', true);

                    if (!error && count !== null) {
                        setPremiumUserCount(count);
                    }
                } catch (error) {
                    console.error('Error fetching premium count:', error);
                } finally {
                    setLoadingCount(false);
                }
            };
            fetchPremiumCount();
        }
    }, [open]);

    // Track modal view when opened
    useEffect(() => {
        if (open && userId) {
            trackUpgradeModalView(userId);
            setHasTrackedPaymentInit(false); // Reset for new session
        }
    }, [open, userId]);

    const showToast = (title: string, type: 'success' | 'error' = 'success') => {
        setToastMessage({ title, type });
        setTimeout(() => setToastMessage(null), 3000);
    };

    const handleCopy = () => {
        navigator.clipboard.writeText(UPI_ID);
        showToast("UPI ID Copied!");
    };

    const handleSubmit = async () => {
        if (!utr || utr.length < 10) {
            showToast("Invalid UTR (must be 10+ digits)", "error");
            return;
        }

        setSubmitting(true);
        try {
            const supabase = createClient();
            const { data: { user } } = await supabase.auth.getUser();

            if (!user) {
                showToast("You must be logged in", "error");
                return;
            }

            // Insert Request
            const { error } = await supabase
                .from('payment_requests')
                .insert({
                    user_id: user.id,
                    transaction_id: utr,
                    amount: currentPrice,
                    status: 'pending'
                });

            if (error) throw error;

            // Track UTR submission
            if (userId) {
                await trackUTRSubmitted(utr, currentPrice, userId);
            }

            setSubmitted(true);
            showToast("Request Submitted!");

        } catch (error: any) {
            console.error("Payment submission error:", error);
            if (error.code === '23505') { // Unique violation
                showToast("This UTR has already been used", "error");
            } else {
                showToast("Submission Failed: " + error.message, "error");
            }
        } finally {
            setSubmitting(false);
        }
    };

    if (!open) return null;

    if (typeof document === 'undefined') return null;

    return createPortal(
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
            {/* Toast Notification */}
            {toastMessage && (
                <div className={`fixed top-4 right-4 z-[110] px-4 py-2 rounded-lg text-white text-sm font-bold shadow-lg animate-in slide-in-from-right ${toastMessage.type === 'error' ? 'bg-red-500' : 'bg-emerald-500'}`}>
                    {toastMessage.title}
                </div>
            )}

            <div className="w-full max-w-md bg-zinc-950 border border-zinc-800 text-white rounded-xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                {/* Header */}
                <div className="p-6 border-b border-white/5 flex justify-between items-start">
                    <div>
                        <h2 className="text-2xl font-bold bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent">
                            Unlock Premium Access
                        </h2>
                        <p className="text-zinc-400 text-sm mt-1">
                            Get lifetime access to all 30 days, Custom Gym, and the Arena.
                        </p>
                    </div>
                    <button onClick={() => onOpenChange(false)} className="text-zinc-500 hover:text-white transition-colors">
                        <X className="h-5 w-5" />
                    </button>
                </div>

                {/* Pricing Banner */}
                {!submitted && (
                    <div className="px-6 py-4 bg-gradient-to-r from-amber-500/10 to-orange-500/10 border-b border-amber-500/20">
                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <div>
                                    <div className="flex items-baseline gap-2">
                                        <span className="text-3xl font-bold text-amber-400">₹{currentPrice}</span>
                                        {currentPrice === EARLY_BIRD_PRICE && (
                                            <span className="text-zinc-500 line-through text-lg">₹{REGULAR_PRICE}</span>
                                        )}
                                    </div>
                                    {currentPrice === EARLY_BIRD_PRICE ? (
                                        <p className="text-xs text-amber-400/80 mt-1 font-semibold">
                                            🎉 Early Bird Special - {spotsRemaining} spots left!
                                        </p>
                                    ) : (
                                        <p className="text-xs text-zinc-400 mt-1">
                                            Regular Price
                                        </p>
                                    )}
                                </div>
                            </div>

                            {/* Progress Bar */}
                            {currentPrice === EARLY_BIRD_PRICE && (
                                <div className="space-y-1">
                                    <div className="w-full bg-zinc-800 rounded-full h-2 overflow-hidden">
                                        <div
                                            className="h-full bg-gradient-to-r from-amber-500 to-orange-500 transition-all duration-500 ease-out"
                                            style={{ width: `${progressPercentage}%` }}
                                        />
                                    </div>
                                    <p className="text-[10px] text-zinc-500 text-right">
                                        {premiumUserCount} / {EARLY_BIRD_LIMIT} claimed
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {submitted ? (
                    <div className="flex flex-col items-center justify-center p-8 text-center space-y-6">
                        <div className="bg-green-500/20 p-4 rounded-full ring-4 ring-green-500/10">
                            <Check className="h-8 w-8 text-green-500" />
                        </div>
                        <div className="space-y-2">
                            <h2 className="text-xl font-bold text-green-500">Submission Received!</h2>
                            <p className="text-muted-foreground text-sm">
                                We are verifying your transaction <strong className="text-white font-mono">{utr}</strong>.
                                <br />Access will be unlocked within 1-2 hours.
                            </p>
                        </div>
                        <PremiumButton onClick={() => onOpenChange(false)} className="w-full">
                            Close
                        </PremiumButton>
                    </div>
                ) : (
                    <div className="p-6 space-y-6">
                        {/* Step 1: Pay */}
                        <div className="space-y-4">
                            <div className="flex items-center gap-2 text-sm font-bold text-white uppercase tracking-wider">
                                <span className="bg-amber-500 text-black w-6 h-6 rounded-full flex items-center justify-center font-mono">1</span>
                                Scan & Pay ₹{currentPrice}
                            </div>

                            <div className="flex justify-center">
                                <div className="bg-white p-3 rounded-xl flex items-center justify-center shadow-lg">
                                    <img
                                        src="/payment.jpeg"
                                        alt="Payment QR Code"
                                        className="h-32 w-32 object-contain"
                                    />
                                </div>
                            </div>

                            <div className="flex items-center gap-2 bg-white/5 p-3 rounded-lg border border-white/10 group hover:border-amber-500/50 transition-colors">
                                <span className="text-xs text-zinc-400 uppercase tracking-widest mr-2">UPI ID:</span>
                                <span className="text-sm text-white flex-1 font-mono tracking-wide">{UPI_ID}</span>
                                <button onClick={handleCopy} className="p-2 hover:bg-white/10 rounded-md transition-colors text-amber-500">
                                    <Copy className="h-4 w-4" />
                                </button>
                            </div>
                        </div>

                        {/* Step 2: Submit UTR */}
                        <div className="space-y-4">
                            <div className="flex items-center gap-2 text-sm font-bold text-white uppercase tracking-wider">
                                <span className="bg-amber-500 text-black w-6 h-6 rounded-full flex items-center justify-center font-mono">2</span>
                                Enter Transaction ID
                            </div>

                            <div className="space-y-2">
                                <input
                                    type="text"
                                    placeholder="Enter 12-digit UTR Code"
                                    value={utr}
                                    onChange={(e) => {
                                        setUtr(e.target.value);
                                        // Track payment initiation on first character
                                        if (!hasTrackedPaymentInit && e.target.value.length === 1 && userId) {
                                            trackPaymentInitiated(userId);
                                            setHasTrackedPaymentInit(true);
                                        }
                                    }}
                                    className="w-full bg-white/5 border border-white/10 text-white font-mono tracking-widest text-center p-3 rounded-lg focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all placeholder:text-zinc-700"
                                />
                                <p className="text-[10px] text-zinc-500 text-center">
                                    Check your Google Pay / PhonePe history for the 'UTR' or 'Transaction ID'.
                                </p>
                            </div>
                        </div>

                        <PremiumButton
                            onClick={handleSubmit}
                            disabled={submitting || !utr}
                            className="w-full bg-gradient-to-r from-amber-500 to-orange-600 border-none h-12 text-lg font-bold shadow-lg shadow-amber-500/20"
                        >
                            {submitting ? (
                                <span className="flex items-center"><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Verifying...</span>
                            ) : (
                                "Verify Payment"
                            )}
                        </PremiumButton>
                    </div>
                )}
            </div>
        </div>,
        document.body
    );
}
