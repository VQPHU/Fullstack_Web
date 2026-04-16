"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Eye, Trash2, Package } from "lucide-react";
import { toast } from "sonner";
import {
  clearNotifications,
  deleteNotification,
  getNotifications as fetchNotifications,
  Notification,
} from "@/lib/notificationApi";
import { useUserStore } from "@/lib/store";
import SubNavbar from "@/components/header/SubNavbar";

// ─── Confirm Dialog (Đồng bộ với trang Orders) ───────────────────────────
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
    <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onCancel} />
    <div className="relative z-10 bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md mx-4 animate-in fade-in zoom-in duration-200">
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

// ─── Component Chính ──────────────────────────────────────────────────────
export default function NotificationsPage() {
  const { auth_token } = useUserStore();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [openClearModal, setOpenClearModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const loadNotifications = async () => {
      if (!auth_token) {
        setNotifications([]);
        setLoading(false);
        return;
      }
      setLoading(true);
      try {
        const data = await fetchNotifications(auth_token);
        setNotifications(data);
      } catch (err) {
        console.error(err);
        toast.error("Failed to load notifications");
      } finally {
        setLoading(false);
      }
    };
    loadNotifications();
  }, [auth_token]);

  const handleDelete = async (id: string) => {
    if (!auth_token) return;
    const result = await deleteNotification(id, auth_token);
    if (result.success) {
      setNotifications((prev) => prev.filter((n) => n._id !== id));
      toast.success("Notification deleted");
    } else {
      toast.error(result.message || "Failed to delete");
    }
  };

  const handleClearAll = async () => {
    if (!auth_token) return;
    setSubmitting(true);
    const result = await clearNotifications(auth_token);
    setSubmitting(false);
    if (result.success) {
      setNotifications([]);
      setOpenClearModal(false);
      toast.success("All notifications cleared");
    }
  };

  const formatTime = (date: string) => {
    const diff = Math.floor((Date.now() - new Date(date).getTime()) / (1000 * 60 * 60 * 24));
    return diff === 0 ? "Today" : `${diff} days ago`;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto p-4 md:p-6 space-y-6">
        
        {/* SUB-NAVBAR */}
        <SubNavbar />

        {/* NOTIFICATIONS PANEL */}
        <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h2 className="text-xl font-bold text-gray-900">Notifications</h2>
              <p className="text-sm text-gray-500 mt-1">
                Showing {notifications.length} of {notifications.length} total
              </p>
            </div>

            <Button
              variant="outline"
              onClick={() => setOpenClearModal(true)}
              disabled={notifications.length === 0 || submitting}
              className="text-red-500 border-red-200 hover:bg-red-50 hover:text-red-600 rounded-xl flex gap-2 h-10 px-4"
            >
              <Trash2 size={16} /> Clear all
            </Button>
          </div>

          {/* LIST SECTION */}
          <div className="space-y-4">
            {loading ? (
              <div className="flex justify-center py-20">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-500"></div>
              </div>
            ) : notifications.length === 0 ? (
              <div className="bg-white rounded-2xl border border-dashed border-gray-200 p-16 text-center">
                <div className="w-16 h-16 rounded-full bg-gray-50 flex items-center justify-center mx-auto mb-4">
                  <Package className="w-8 h-8 text-gray-300" />
                </div>
                <h3 className="text-lg font-semibold text-gray-800 mb-1">No Notifications</h3>
                <p className="text-sm text-gray-500">
                  New updates will appear here after you place an order.
                </p>
              </div>
            ) : (
              notifications.map((item) => (
                <div
                  key={item._id}
                  className="flex flex-col md:flex-row md:items-center justify-between gap-4 border border-gray-100 rounded-2xl p-5 transition-all hover:bg-gray-50/50 hover:border-teal-100 group"
                >
                  <div className="flex gap-4">
                    <div className="flex-shrink-0">
                      <div className="p-3 bg-blue-50 rounded-xl group-hover:bg-blue-100 transition-colors">
                        <Package className="text-blue-500" size={24} />
                      </div>
                    </div>
                    <div className="space-y-1">
                      <h3 className="font-bold text-gray-900 text-[16px] leading-tight">
                        {item.title}
                      </h3>
                      <p className="text-sm text-gray-600 leading-relaxed max-w-2xl">
                        {item.message}
                      </p>
                      <p className="text-xs text-gray-400 font-medium">
                        {formatTime(item.createdAt)}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 self-end md:self-center">
                    {item.orderId && (
                      <Link href={`/user/orders/${item.orderId}`}>
                        <Button
                          variant="outline"
                          className="h-9 text-sm font-semibold border-teal-400 text-teal-600 hover:bg-teal-50 flex gap-2 px-5 rounded-xl"
                        >
                          <Eye size={16} /> Details
                        </Button>
                      </Link>
                    )}
                    <button
                      onClick={() => handleDelete(item._id)}
                      className="p-2.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                      title="Delete"
                    >
                      <Trash2 size={20} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* MODAL CLEAR ALL - Sử dụng ConfirmDialog đồng bộ */}
      {openClearModal && (
        <ConfirmDialog
          title="Clear All Notifications"
          description="Are you sure you want to clear all notifications? This action cannot be undone and all notifications will be permanently removed."
          confirmLabel={submitting ? "Clearing..." : "Yes, Clear All"}
          confirmClassName="bg-red-600 hover:bg-red-700"
          onConfirm={handleClearAll}
          onCancel={() => setOpenClearModal(false)}
        />
      )}
    </div>
  );
}