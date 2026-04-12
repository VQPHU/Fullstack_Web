"use client";

import React, { useEffect, useState } from "react";
import { useOrderStore, useUserStore } from "@/lib/store";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
    Loader2,
    RefreshCw,
    Eye,
    Trash2,
    CreditCard,
    Package,
    Calendar,
    XCircle,
} from "lucide-react";
import PriceFormatter from "@/components/common/PriceFormatter";
import authApi from "@/lib/authApi";
import { createCheckoutSession } from "@/lib/stripe";
import { toast } from "sonner";
import { updateOrderStatus, deleteOrder } from "@/lib/orderApi";
import Cookies from "js-cookie";
import SubNavbar from "../header/SubNavbar";

// ─── Types ────────────────────────────────────────────────────────────────────
type FilterType = "all" | "pending" | "paid" | "completed" | "cancelled";

// ─── Confirm Dialog ───────────────────────────────────────────────────────────
interface ConfirmDialogProps {
    title: string;
    description: string;
    confirmLabel: string;
    confirmClassName: string;
    onConfirm: () => void;
    onCancel: () => void;
}

const ConfirmDialog = ({
    title,
    description,
    confirmLabel,
    confirmClassName,
    onConfirm,
    onCancel,
}: ConfirmDialogProps) => (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
        <div className="absolute inset-0 bg-black/50" onClick={onCancel} />
        <div className="relative z-10 bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md mx-4">
            <h2 className="text-xl font-bold text-gray-900 mb-3">{title}</h2>
            <p className="text-gray-500 text-sm leading-relaxed mb-8">{description}</p>
            <div className="flex items-center justify-end gap-3">
                <button
                    onClick={onCancel}
                    className="px-5 py-2.5 rounded-xl border border-gray-300 text-gray-700 font-medium text-sm hover:bg-gray-50 transition-colors cursor-pointer"
                >
                    Cancel
                </button>
                <button
                    onClick={onConfirm}
                    className={`px-5 py-2.5 rounded-xl text-white font-medium text-sm transition-colors cursor-pointer ${confirmClassName}`}
                >
                    {confirmLabel}
                </button>
            </div>
        </div>
    </div>
);

// ─── Helpers ─────────────────────────────────────────────────────────────────
const statusBadge = (status: string) => {
    switch (status) {
        case "paid":
        case "completed":
            return "bg-green-100 text-green-700 border border-green-200";
        case "cancelled":
            return "bg-red-100 text-red-700 border border-red-200";
        case "pending":
        default:
            return "bg-yellow-100 text-yellow-700 border border-yellow-200";
    }
};

const paymentBadge = (status: string) => {
    switch (status) {
        case "paid":
            return "text-green-600";
        case "cancelled":
            return "text-red-500";
        default:
            return "text-gray-500";
    }
};

// ─── Component ───────────────────────────────────────────────────────────────
const UserOrdersPageClient = () => {
    const router = useRouter();
    const { isAuthenticated, auth_token, authUser } = useUserStore();
    const { orders, isLoading, loadOrders } = useOrderStore();
    const [filter, setFilter] = useState<FilterType>("all");
    const [deletingId, setDeletingId] = useState<string | null>(null);
    const [cancellingId, setCancellingId] = useState<string | null>(null);
    const [payingId, setPayingId] = useState<string | null>(null);

    // Dialog state
    const [cancelDialog, setCancelDialog] = useState<string | null>(null); // orderId
    const [deleteDialog, setDeleteDialog] = useState<string | null>(null); // orderId

    useEffect(() => {
        if (!isAuthenticated) {
            router.push("/auth/signin");
            return;
        }
        loadOrders(auth_token ?? "");
    }, [isAuthenticated, auth_token, loadOrders]);

    const handleRefresh = () => {
        loadOrders(auth_token ?? "");
        toast.success("Orders refreshed");
    };

    // ── Cancel order → status = cancelled ──
    const handleCancel = async (orderId: string) => {
        const token = Cookies.get("auth_token") ?? auth_token ?? "";
        setCancellingId(orderId);
        setCancelDialog(null);
        try {
            const res = await updateOrderStatus(orderId, "cancelled", token);
            if (res.success) {
                toast.success("Order cancelled successfully");
                loadOrders(token);
            } else {
                toast.error(res.message || "Failed to cancel order");
            }
        } catch {
            toast.error("Failed to cancel order");
        } finally {
            setCancellingId(null);
        }
    };

    // ── Delete order (only cancelled) ──
    const handleDelete = async (orderId: string) => {
        const token = Cookies.get("auth_token") ?? auth_token ?? "";
        setDeletingId(orderId);
        setDeleteDialog(null);
        try {
            const res = await deleteOrder(orderId, token);
            if (res.success) {
                toast.success("Order deleted");
                loadOrders(token);
            } else {
                toast.error(res.message || "Delete failed");
            }
        } catch {
            toast.error("Delete failed");
        } finally {
            setDeletingId(null);
        }
    };

    // ── Pay Now → Stripe Checkout ──
    // const handlePayNow = async (orderId: string) => {
    //     if (!authUser) {
    //         toast.error("User not authenticated");
    //         return;
    //     }

    //     const order = safeOrders.find((o) => o._id === orderId);
    //     if (!order) {
    //         toast.error("Order not found");
    //         return;
    //     }

    //     setPayingId(orderId);

    //     try {
    //         const lineItems = order.items?.map((item) => ({
    //             name: item.name,
    //             description: item.name,
    //             amount: Math.round(item.price * 100),
    //             currency: "usd",
    //             quantity: item.quantity,
    //         })) || [];

    //         const successUrl = `${window.location.origin}/user/orders`;
    //         const cancelUrl = `${window.location.origin}/user/orders`;

    //         const result = await createCheckoutSession({
    //             items: lineItems,
    //             successUrl,
    //             cancelUrl,
    //             customerEmail: authUser.email,
    //             metadata: { orderId },
    //         });

    //         if ("url" in result && result.url) {
    //             window.location.href = result.url;
    //         } else {
    //             toast.error(result.error || "Failed to initiate Stripe checkout");
    //             setPayingId(null);
    //         }
    //     } catch (error) {
    //         toast.error("Payment failed. Please try again.");
    //         console.error("Pay now error:", error);
    //         setPayingId(null);
    //     }
    // };

    const safeOrders = Array.isArray(orders) ? orders : [];

    const filteredOrders = safeOrders.filter((o) => {
        if (filter === "all") return true;
        return o.status === filter;
    });

    const FILTERS: FilterType[] = ["all", "pending", "paid", "completed", "cancelled"];

    return (
        <div className="min-h-screen bg-gray-50 p-4 md:p-8">
            <div className="max-w-6xl mx-auto p-4 md:p-6 space-y-6">
                <SubNavbar />
                {/* ── Header ── */}
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-6">
                    <div className="flex items-start justify-between">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">My Orders</h1>
                            <p className="text-sm text-gray-500 mt-1">
                                View and manage your order history
                            </p>
                        </div>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={handleRefresh}
                            disabled={isLoading}
                            className="flex items-center gap-1.5 border-gray-200 text-gray-600 hover:bg-gray-50"
                        >
                            <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
                            Refresh
                        </Button>
                    </div>

                    {/* Filter tabs */}
                    <div className="flex flex-wrap gap-2 mt-5">
                        {FILTERS.map((f) => (
                            <button
                                key={f}
                                onClick={() => setFilter(f)}
                                className={`px-4 py-1.5 rounded-full text-sm font-medium border transition ${filter === f
                                    ? "bg-gray-900 text-white border-gray-900"
                                    : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"
                                    }`}
                            >
                                {f === "all" ? "All" : f.charAt(0).toUpperCase() + f.slice(1)}
                                {f !== "all" && (
                                    <span className="ml-1.5 text-xs opacity-70">
                                        ({safeOrders.filter((o) => o.status === f).length})
                                    </span>
                                )}
                            </button>
                        ))}
                    </div>
                </div>

                {/* ── Content ── */}
                {isLoading ? (
                    <div className="flex justify-center py-24">
                        <Loader2 className="w-8 h-8 animate-spin text-teal-500" />
                    </div>
                ) : filteredOrders.length === 0 ? (
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-16 text-center">
                        <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
                            <Package className="w-8 h-8 text-gray-300" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-800 mb-1">No Orders Yet</h3>
                        <p className="text-sm text-gray-500 mb-6">
                            You haven&apos;t placed any orders yet.
                        </p>
                        <Button
                            className="bg-gray-900 hover:bg-gray-800 text-white px-8"
                            onClick={() => router.push("/")}
                        >
                            Start Shopping
                        </Button>
                    </div>
                ) : (
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                        {/* Table header */}
                        <div className="grid grid-cols-7 gap-4 px-6 py-3 border-b border-gray-100 bg-gray-50/80 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                            <div>Order ID</div>
                            <div className="col-span-1">Date</div>
                            <div>Items</div>
                            <div>Total</div>
                            <div>Status</div>
                            <div>Payment</div>
                            <div>Actions</div>
                        </div>

                        {/* Rows */}
                        <div className="divide-y divide-gray-100">
                            {filteredOrders.map((order) => (
                                <div
                                    key={order._id}
                                    className="grid grid-cols-7 gap-4 px-6 py-4 items-center hover:bg-gray-50/50 transition"
                                >
                                    {/* Order ID */}
                                    <div className="text-sm font-medium text-gray-700">
                                        {order._id.slice(-8)}
                                    </div>

                                    {/* Date */}
                                    <div className="flex items-center gap-1.5 text-sm text-gray-500 col-span-1">
                                        <Calendar className="w-3.5 h-3.5 shrink-0" />
                                        {new Date(order.createdAt).toLocaleDateString("en-US", {
                                            month: "short",
                                            day: "numeric",
                                            year: "numeric",
                                        })}
                                    </div>

                                    {/* Items */}
                                    <div className="text-sm text-gray-600">
                                        {order.items?.length ?? 0} items
                                    </div>

                                    {/* Total */}
                                    <div className="text-sm font-semibold text-gray-800">
                                        <PriceFormatter amount={order.total} />
                                    </div>

                                    {/* Status */}
                                    <div>
                                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${statusBadge(order.status)}`}>
                                            {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                                        </span>
                                    </div>

                                    {/* Payment */}
                                    <div className={`flex items-center gap-1.5 text-sm ${paymentBadge(order.status)}`}>
                                        <CreditCard className="w-3.5 h-3.5 shrink-0" />
                                        {order.paymentMethod === "cod"
                                            ? "COD"
                                            : order.status === "paid" || order.status === "completed"
                                                ? "Paid"
                                                : "Pending"}
                                    </div>

                                    {/* Actions */}
                                    <div className="flex items-center gap-1.5">
                                        {/* View */}
                                        <button
                                            onClick={() => router.push(`/user/orders/${order._id}`)}
                                            className="w-8 h-8 rounded-lg border border-teal-400 text-teal-500 flex items-center justify-center hover:bg-teal-50 transition"
                                            title="View detail"
                                        >
                                            <Eye className="w-4 h-4" />
                                        </button>

                                        {/* Pay Now - chỉ pending + card */}
                                        {/* {order.status === "pending" && order.paymentMethod !== "cod" && (
                                            <button
                                                onClick={() => handlePayNow(order._id)}
                                                disabled={payingId === order._id}
                                                className="flex items-center gap-1.5 px-3 h-8 rounded-lg bg-teal-500 hover:bg-teal-600 text-white text-xs font-medium transition disabled:opacity-60"
                                                title="Pay now"
                                            >
                                                {payingId === order._id ? (
                                                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                                ) : (
                                                    <CreditCard className="w-3.5 h-3.5" />
                                                )}
                                                Pay
                                            </button>
                                        )} */}

                                        {/* Cancel - chỉ pending */}
                                        {order.status === "pending" && (
                                            <button
                                                onClick={() => setCancelDialog(order._id)}
                                                disabled={cancellingId === order._id}
                                                className="w-8 h-8 rounded-lg border border-orange-400 text-orange-500 flex items-center justify-center hover:bg-orange-50 transition disabled:opacity-60"
                                                title="Cancel order"
                                            >
                                                {cancellingId === order._id ? (
                                                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                                ) : (
                                                    <XCircle className="w-4 h-4" />
                                                )}
                                            </button>
                                        )}

                                        {/* Delete - chỉ cancelled */}
                                        {order.status === "cancelled" && (
                                            <button
                                                onClick={() => setDeleteDialog(order._id)}
                                                disabled={deletingId === order._id}
                                                className="w-8 h-8 rounded-lg bg-red-500 hover:bg-red-600 text-white flex items-center justify-center transition disabled:opacity-60"
                                                title="Delete order"
                                            >
                                                {deletingId === order._id ? (
                                                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                                ) : (
                                                    <Trash2 className="w-3.5 h-3.5" />
                                                )}
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Cancel Confirm Dialog */}
            {cancelDialog && (
                <ConfirmDialog
                    title="Cancel Order"
                    description="Are you sure you want to cancel this order? This action cannot be undone."
                    confirmLabel="Yes, Cancel Order"
                    confirmClassName="bg-orange-500 hover:bg-orange-600"
                    onConfirm={() => handleCancel(cancelDialog)}
                    onCancel={() => setCancelDialog(null)}
                />
            )}

            {/* Delete Confirm Dialog */}
            {deleteDialog && (
                <ConfirmDialog
                    title="Delete Order"
                    description="Are you sure you want to delete this order? This action cannot be undone and the order will be permanently removed."
                    confirmLabel="Yes, Delete Order"
                    confirmClassName="bg-red-600 hover:bg-red-700"
                    onConfirm={() => handleDelete(deleteDialog)}
                    onCancel={() => setDeleteDialog(null)}
                />
            )}
        </div>
    );
};

export default UserOrdersPageClient;
