"use client";

import React, { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { useUserStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import {
  Loader2,
  ArrowLeft,
  CreditCard,
  ShoppingBag,
  MapPin,
  CheckCircle2,
  Clock,
  AlertCircle,
  Package,
  Truck,
  Home,
} from "lucide-react";
import PriceFormatter from "@/components/common/PriceFormatter";
import authApi from "@/lib/authApi";
import { createCheckoutSession } from "@/lib/stripe";
import { toast } from "sonner";
import Image from "next/image";
import { deleteOrder, updateOrderStatus } from "@/lib/orderApi";

// ─── Types ────────────────────────────────────────────────────────────────────
interface OrderItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
}

interface OrderAddress {
  street: string;
  city: string;
  state?: string;
  country: string;
  postalCode: string;
}

interface Order {
  _id: string;
  status: string;
  paymentStatus?: "pending" | "paid" | "failed";
  paymentMethod?: string;
  items: OrderItem[];
  total: number;
  subtotal?: number;
  shipping?: number;
  tax?: number;
  shippingAddress?: OrderAddress;
  createdAt: string;
}

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

// ─── Timeline steps ───────────────────────────────────────────────────────────
const TIMELINE_STEPS = [
  {
    key: "order_placed",
    label: "Order Placed",
    desc: "Your order has been received",
    icon: CheckCircle2,
  },
  {
    key: "address_confirmed",
    label: "Address Confirmed",
    desc: "Delivery address has been verified",
    icon: MapPin,
  },
  {
    key: "order_confirmed",
    label: "Order Confirmed",
    desc: "Your order has been confirmed",
    icon: Package,
  },
  {
    key: "payment_pending",
    label: "Payment Pending",
    desc: "Payment is pending for this order",
    icon: CreditCard,
    isPayment: true,
  },
  {
    key: "order_packed",
    label: "Order Packed",
    desc: "Your order has been packed and ready for shipment",
    icon: Package,
  },
  {
    key: "out_for_delivery",
    label: "Out for Delivery",
    desc: "Your order is on the way",
    icon: Truck,
  },
  {
    key: "delivered",
    label: "Delivered",
    desc: "Order has been delivered successfully",
    icon: Home,
  },
];

// Map order status → which steps are "done"
const getCompletedSteps = (status: string): string[] => {
  switch (status) {
    case "pending":
      return ["order_placed"];
    case "paid":
      return ["order_placed", "address_confirmed", "order_confirmed"];
    case "processing":
      return ["order_placed", "address_confirmed", "order_confirmed", "order_packed"];
    case "shipped":
      return ["order_placed", "address_confirmed", "order_confirmed", "order_packed", "out_for_delivery"];
    case "completed":
    case "delivered":
      return TIMELINE_STEPS.map((s) => s.key);
    default:
      return ["order_placed"];
  }
};

const getActiveStep = (status: string): string => {
  if (status === "pending") return "payment_pending";
  if (status === "paid") return "order_confirmed";
  if (status === "processing") return "order_packed";
  if (status === "shipped") return "out_for_delivery";
  if (status === "completed" || status === "delivered") return "delivered";
  return "order_placed";
};

// ─── Component ───────────────────────────────────────────────────────────────
const OrderDetailPage = () => {
  const router = useRouter();
  const params = useParams();
  const orderId = params?.id as string;

  const { auth_token, authUser } = useUserStore();

  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [payingId, setPayingId] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  useEffect(() => {
    if (!orderId || !auth_token) return;
    fetchOrder();
  }, [orderId, auth_token]);

  const fetchOrder = async () => {
    setIsLoading(true);
    try {
      const res = await authApi.get(`/orders/${orderId}`);
      if (res.success && res.data) {
        setOrder(res.data);
      } else {
        toast.error("Order not found");
        router.push("/user/orders");
      }
    } catch {
      toast.error("Failed to load order");
      router.push("/user/orders");
    } finally {
      setIsLoading(false);
    }
  };

  // ── Pay Now → Stripe ──
  const handlePayNow = async () => {
    if (!order) return;
    setPayingId(true);

    try {
      const lineItems = order.items.map((item) => ({
        name: item.name,
        description: item.name,
        amount: Math.round(item.price * 100),
        currency: "usd",
        quantity: item.quantity,
      }));

      const successUrl = `${window.location.origin}/user/orders`;
      const cancelUrl = `${window.location.origin}/user/orders`;

      const result = await createCheckoutSession({
        items: lineItems,
        successUrl,
        cancelUrl,
        customerEmail: authUser?.email || undefined,
        metadata: { orderId: order._id },
      });

      if ("error" in result) {
        toast.error(result.error || "Failed to create checkout session");
      } else if (result.url) {
        window.location.href = result.url;
      } else {
        toast.error("Failed to create checkout session");
      }
    } catch (error) {
      console.error("Pay now error:", error);
      toast.error("Payment failed. Please try again.");
    } finally {
      setPayingId(false);
    }
  };

  // ── Delete ──
  const handleDelete = async () => {
    if (!order || !auth_token) return;
    setDeleteDialogOpen(false);
    setDeleting(true);
    try {
      const res = await deleteOrder(order._id, auth_token);
      if (res.success) {
        toast.success("Order deleted");
        router.push("/user/orders");
      } else {
        toast.error(res.message || "Delete failed");
      }
    } catch {
      toast.error("Delete failed");
    } finally {
      setDeleting(false);
    }
  };

  const handleCancel = async () => {
    if (!order || !auth_token) return;
    setCancelDialogOpen(false);
    setCancelling(true);
    try {
      const res = await updateOrderStatus(order._id, "cancelled", auth_token);
      if (res.success) {
        setOrder((prev) => (prev ? { ...prev, status: "cancelled" } : prev));
        toast.success("Order cancelled");
      } else {
        toast.error(res.message || "Cancel failed");
      }
    } catch {
      toast.error("Cancel failed");
    } finally {
      setCancelling(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-teal-500" />
      </div>
    );
  }

  if (!order) return null;

  const isPending =
    order.status === "pending" &&
    order.paymentMethod !== "cod" &&
    order.paymentStatus !== "paid";

  const completedSteps = getCompletedSteps(order.status);
  const activeStep = getActiveStep(order.status);

  const subtotal = order.subtotal ?? order.items.reduce((acc, i) => acc + i.price * i.quantity, 0);
  const shipping = order.shipping ?? 0;
  const tax = order.tax ?? 0;

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-6xl mx-auto p-4 md:p-6 space-y-6">

        {/* Back */}
        <button
          onClick={() => router.push("/user/orders")}
          className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Orders
        </button>

        {/* ── Order Header ── */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <div className="flex items-start justify-between flex-wrap gap-3">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Order #{order._id.slice(-8).toUpperCase()}
              </h1>
              <p className="text-sm text-gray-400 mt-0.5">
                Placed on{" "}
                {new Date(order.createdAt).toLocaleDateString("en-US", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
            </div>

            {/* Payment status badge */}
            <span
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium border ${order.status === "paid" || order.status === "completed"
                ? "bg-green-50 text-green-700 border-green-200"
                : order.status === "cancelled"
                  ? "bg-red-50 text-red-600 border-red-200"
                  : "bg-yellow-50 text-yellow-700 border-yellow-200"
                }`}
            >
              <Clock className="w-3.5 h-3.5" />
              {order.status === "paid" || order.status === "completed"
                ? "Payment Confirmed"
                : order.status === "cancelled"
                  ? "Cancelled"
                  : "Payment Pending"}
            </span>
          </div>

          {/* Summary cards */}
          <div className="grid grid-cols-2 gap-3 mt-5">
            <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
              <p className="text-xs text-gray-400 mb-1">Total Amount</p>
              <p className="text-lg font-bold text-gray-800">
                <PriceFormatter amount={order.total} />
              </p>
            </div>
            <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
              <p className="text-xs text-gray-400 mb-1">Items</p>
              <p className="text-lg font-bold text-gray-800">
                {order.items.length} items
              </p>
            </div>
          </div>
        </div>

        {/* ── Order Progress ── */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h2 className="font-semibold text-gray-800 mb-5">Order Progress</h2>

          <div className="space-y-1">
            {TIMELINE_STEPS.map((step, idx) => {
              const isDone = completedSteps.includes(step.key);
              const isActive = activeStep === step.key;
              const Icon = step.icon;

              return (
                <div key={step.key} className="flex gap-4">
                  {/* Icon + line */}
                  <div className="flex flex-col items-center">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 z-10 ${isDone
                        ? "bg-green-500 text-white"
                        : isActive
                          ? step.isPayment
                            ? "bg-red-100 text-red-500 border-2 border-red-300"
                            : "bg-teal-100 text-teal-600 border-2 border-teal-300"
                          : "bg-gray-100 text-gray-300 border border-gray-200"
                        }`}
                    >
                      <Icon className="w-4 h-4" />
                    </div>
                    {idx < TIMELINE_STEPS.length - 1 && (
                      <div
                        className={`w-0.5 h-8 mt-0.5 ${isDone ? "bg-green-300" : "bg-gray-200"
                          }`}
                      />
                    )}
                  </div>

                  {/* Content */}
                  <div className="pb-6 flex-1 flex items-start justify-between">
                    <div>
                      <p
                        className={`text-sm font-medium ${isDone
                          ? "text-green-600"
                          : isActive
                            ? step.isPayment
                              ? "text-red-500"
                              : "text-teal-600"
                            : "text-gray-400"
                          }`}
                      >
                        {step.label}
                      </p>
                      <p className="text-xs text-gray-400 mt-0.5">{step.desc}</p>
                      {isDone && idx === 0 && (
                        <p className="text-xs text-gray-400 mt-0.5">
                          {new Date(order.createdAt).toLocaleString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                            hour: "numeric",
                            minute: "2-digit",
                          })}
                        </p>
                      )}
                    </div>

                    {/* Pay Now button in timeline */}
                    {isActive && step.isPayment && isPending && (
                      <button
                        onClick={handlePayNow}
                        disabled={payingId}
                        className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-teal-500 hover:bg-teal-600 text-white text-xs font-medium transition shrink-0 ml-4"
                      >
                        {payingId ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <CreditCard className="w-3.5 h-3.5" />
                        )}
                        Pay Now
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ── Order Items ── */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <div className="flex items-center gap-2 mb-4">
            <ShoppingBag className="w-5 h-5 text-teal-500" />
            <h2 className="font-semibold text-gray-800">Order Items</h2>
          </div>

          <div className="space-y-3">
            {order.items.map((item, i) => (
              <div
                key={`${item.productId}-${i}`}
                className="flex items-center gap-4 p-3 rounded-xl border border-gray-100 bg-gray-50 transition"
              >
                {/* Image */}
                <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-100 shrink-0 flex items-center justify-center">
                  {item.image ? (
                    <Image
                      src={item.image}
                      alt={item.name}
                      width={64}
                      height={64}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <Package className="w-6 h-6 text-gray-300" />
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-800 truncate">{item.name}</p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    Quantity: {item.quantity}
                  </p>
                  <p className="text-xs text-gray-400">
                    <PriceFormatter amount={item.price} /> each
                  </p>
                </div>

                {/* Price */}
                <p className="text-sm font-semibold text-teal-600 shrink-0">
                  <PriceFormatter amount={item.price * item.quantity} />
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* ── Delivery Address ── */}
        {order.shippingAddress && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <div className="flex items-center gap-2 mb-4">
              <MapPin className="w-5 h-5 text-teal-500" />
              <h2 className="font-semibold text-gray-800">Delivery Address</h2>
            </div>

            <div className="bg-gray-50 rounded-xl p-4 border border-gray-100 text-sm text-gray-600 space-y-0.5">
              <p className="font-medium text-gray-800">{order.shippingAddress.street}</p>
              <p>
                {[order.shippingAddress.city, order.shippingAddress.country]
                  .filter(Boolean)
                  .join(", ")}
              </p>
              {order.shippingAddress.postalCode && (
                <p className="text-gray-400 text-xs">Postal Code: {order.shippingAddress.postalCode}</p>
              )}
            </div>
          </div>
        )}

        {/* ── Order Summary ── */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h2 className="font-semibold text-gray-800 mb-4">Order Summary</h2>

          <div className="space-y-3 text-sm">
            <div className="flex justify-between text-gray-600">
              <span>Subtotal</span>
              <PriceFormatter amount={subtotal} />
            </div>
            <div className="flex justify-between text-gray-600">
              <span>Shipping</span>
              <PriceFormatter amount={shipping} />
            </div>
            <div className="flex justify-between text-gray-600">
              <span>Tax</span>
              <PriceFormatter amount={tax} />
            </div>
            <div className="border-t border-gray-100 pt-3 flex justify-between font-bold text-gray-900">
              <span>Total</span>
              <span className="text-teal-600">
                <PriceFormatter amount={order.total} />
              </span>
            </div>
          </div>
        </div>

        {/* ── Payment Pending Banner ── */}
        {isPending && (
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-amber-100 flex items-center justify-center shrink-0">
                <CreditCard className="w-4 h-4 text-amber-600" />
              </div>
              <div>
                <p className="text-sm font-semibold text-amber-800">Payment Pending</p>
                <p className="text-xs text-amber-600">
                  This order is pending payment. You can pay now using your credit card.
                </p>
              </div>
            </div>
            <button
              onClick={handlePayNow}
              disabled={payingId}
              className="flex items-center gap-2 px-5 py-2 rounded-xl bg-teal-500 hover:bg-teal-600 text-white text-sm font-medium transition disabled:opacity-60 shrink-0"
            >
              {payingId ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <CreditCard className="w-4 h-4" />
              )}
              Pay Now
            </button>
          </div>
        )}

        {/* ── Bottom Actions ── */}
        <div className="grid grid-cols-3 gap-3 pb-6">
          <Button
            variant="outline"
            onClick={() => router.push("/user/orders")}
            className="border-gray-200 text-gray-600 hover:bg-gray-50"
          >
            View All Orders
          </Button>

          <Button
            className="bg-teal-500 hover:bg-teal-600 text-white"
            onClick={() => router.push("/")}
          >
            Continue Shopping
          </Button>

          {order.status === "pending" && (
            <Button
              variant="destructive"
              onClick={() => setCancelDialogOpen(true)}
              disabled={cancelling}
              className="bg-orange-500 hover:bg-orange-600"
            >
              {cancelling ? (
                <Loader2 className="w-4 h-4 animate-spin mr-1" />
              ) : null}
              Cancel Order
            </Button>
          )}

          {order.status === "cancelled" && (
            <Button
              variant="destructive"
              onClick={() => setDeleteDialogOpen(true)}
              disabled={deleting}
              className="bg-red-500 hover:bg-red-600"
            >
              {deleting ? (
                <Loader2 className="w-4 h-4 animate-spin mr-1" />
              ) : null}
              Delete Order
            </Button>
          )}
        </div>
      </div>

      {cancelDialogOpen && (
        <ConfirmDialog
          title="Cancel Order"
          description="Are you sure you want to cancel this order? This action cannot be undone."
          confirmLabel="Yes, Cancel Order"
          confirmClassName="bg-orange-500 hover:bg-orange-600"
          onConfirm={handleCancel}
          onCancel={() => setCancelDialogOpen(false)}
        />
      )}

      {deleteDialogOpen && (
        <ConfirmDialog
          title="Delete Order"
          description="Are you sure you want to delete this order? This action cannot be undone and the order will be permanently removed."
          confirmLabel="Yes, Delete Order"
          confirmClassName="bg-red-600 hover:bg-red-700"
          onConfirm={handleDelete}
          onCancel={() => setDeleteDialogOpen(false)}
        />
      )}
    </div>
  );
};

export default OrderDetailPage;
