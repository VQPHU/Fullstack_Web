"use client";
import React, { useEffect, useState, useCallback } from "react";
import {
  X,
  Bell,
  ChevronRight,
  ChevronLeft,
  ExternalLink,
  AlertTriangle,
  Megaphone,
  Tag,
  Percent,
  MessageSquare,
  Zap,
} from "lucide-react";
import {
  getAdminNotifications,
  markAdminNotificationRead,
  AdminNotification,
  MODAL_TYPES,
} from "@/lib/notificationApi";
import { useUserStore } from "@/lib/store";

// ─── Type Config ──────────────────────────────────────────────────────────────

const TYPE_CONFIG: Record<
  string,
  { icon: React.ElementType; color: string; bg: string; label: string }
> = {
  announcement: { icon: Megaphone, color: "#6366f1", bg: "bg-indigo-50", label: "Thông báo" },
  alert: { icon: AlertTriangle, color: "#ef4444", bg: "bg-red-50", label: "Cảnh báo" },
  "admin message": { icon: MessageSquare, color: "#0ea5e9", bg: "bg-sky-50", label: "Tin nhắn" },
  promotion: { icon: Percent, color: "#f59e0b", bg: "bg-amber-50", label: "Khuyến mãi" },
  deal: { icon: Tag, color: "#10b981", bg: "bg-emerald-50", label: "Deal hời" },
  offer: { icon: Zap, color: "#8b5cf6", bg: "bg-violet-50", label: "Ưu đãi" },
  general: { icon: Bell, color: "#64748b", bg: "bg-slate-50", label: "Thông báo" },
};

const formatDate = (iso: string) => {
  const d = new Date(iso);
  return d.toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

// ─── Component ────────────────────────────────────────────────────────────────

const NotificationModal = () => {
  const { auth_token, authUser, hasHydrated } = useUserStore();
  const [notifications, setNotifications] = useState<AdminNotification[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [visible, setVisible] = useState(false);
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    if (!hasHydrated || !auth_token) return;

    const load = async () => {
      try {
        const all = await getAdminNotifications(auth_token);

        const toShow = Array.isArray(all) ? all.filter((n) =>
          MODAL_TYPES.map((t) => t.toLowerCase()).includes(n.type.toLowerCase())
        ) : [];

        if (toShow.length > 0) {
          setNotifications(toShow);
          setCurrentIndex(0);
          setVisible(true);
        }
      } catch (error) {
        console.error("Lỗi khi lấy thông báo:", error);
      }
    };

    load();
  }, [hasHydrated, auth_token]);

  const current = notifications[currentIndex];

  const handleClose = useCallback(async () => {
    if (!current) return;

    const isLast = currentIndex >= notifications.length - 1;
    if (isLast) {
      setVisible(false);
    } else {
      setCurrentIndex((prev) => prev + 1);
      setImageError(false);
    }

    // Gọi API ở background, không dùng await để tránh chặn UI
    if (auth_token && authUser?._id) {
      markAdminNotificationRead(current._id, authUser._id, auth_token).catch(() => { });
    }
  }, [current, currentIndex, notifications.length, auth_token, authUser]);

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
      setImageError(false);
    }
  };

  const handleNext = () => {
    if (currentIndex < notifications.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      setImageError(false);
    }
  };

  if (!visible || !current) return null;

  const config = TYPE_CONFIG[current.type.toLowerCase()] ?? TYPE_CONFIG["general"];
  const Icon = config.icon;
  const isLast = currentIndex >= notifications.length - 1;
  const total = notifications.length;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={handleClose}
      />

      {/* Card */}
      <div className="relative z-10 w-full max-w-md mx-4 bg-white rounded-2xl shadow-2xl overflow-hidden">

        {/* Accent bar */}
        <div className="h-1 w-full" style={{ background: config.color }} />

        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-5">
          <span
            className={`flex items-center gap-2 text-xs font-semibold px-3 py-1.5 rounded-full ${config.bg}`}
            style={{ color: config.color }}
          >
            <Icon size={13} strokeWidth={2.5} />
            {config.label}
          </span>

          <button
            onClick={handleClose}
            className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 text-gray-500 hover:text-gray-800 transition-colors cursor-pointer"
          >
            <X size={16} strokeWidth={2.5} />
          </button>
        </div>

        {/* Body */}
        <div className="px-5 pt-4 pb-0">
          <h2 className="text-lg font-bold text-gray-900 leading-snug mb-2">
            {current.title}
          </h2>
          <p className="text-sm text-gray-500 leading-relaxed mb-4">
            {current.message}
          </p>

          {current.image && !imageError && (
            <div className="w-full rounded-xl overflow-hidden mb-4 bg-gray-50">
              <img
                src={current.image}
                alt={current.title}
                className="w-full h-52 object-cover"
                onError={() => setImageError(true)}
              />
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 pb-5 flex flex-col gap-3">
          {/* Action button */}
          {current.actionButtonText && current.actionButtonUrl && (
            <a
              href={current.actionButtonUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={handleClose}
              className="flex items-center justify-center gap-2 w-full py-3 rounded-xl text-white text-sm font-semibold transition-opacity hover:opacity-90"
              style={{ background: config.color }}
            >
              {current.actionButtonText}
              <ExternalLink size={14} strokeWidth={2.5} />
            </a>
          )}

          {/* Bottom row */}
          <div className="flex items-center justify-between gap-3">
            {/* Dots hoặc date */}
            {total > 1 ? (
              <div className="flex items-center gap-1.5">
                {notifications.map((_, i) => (
                  <div
                    key={i}
                    className="h-1.5 rounded-full transition-all duration-200"
                    style={{
                      width: i === currentIndex ? 18 : 6,
                      background: i === currentIndex ? config.color : "#cbd5e1",
                    }}
                  />
                ))}
              </div>
            ) : (
              <span className="text-xs text-gray-400 font-medium">
                {formatDate(current.createdAt)}
              </span>
            )}

            <div className="flex items-center gap-2">
              {/* Nav arrows */}
              {total > 1 && (
                <div className="flex gap-1.5">
                  <button
                    onClick={handlePrev}
                    disabled={currentIndex === 0}
                    className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
                  >
                    <ChevronLeft size={15} strokeWidth={2.5} />
                  </button>
                  <button
                    onClick={handleNext}
                    disabled={currentIndex === total - 1}
                    className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
                  >
                    <ChevronRight size={15} strokeWidth={2.5} />
                  </button>
                </div>
              )}

              {/* Dismiss */}
              <button
                onClick={handleClose}
                className="px-4 py-2 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50 hover:border-gray-300 transition-colors cursor-pointer"
              >
                {isLast ? "Đã hiểu ✓" : "Tiếp theo →"}
              </button>
            </div>
          </div>

          {total > 1 && (
            <p className="text-center text-xs text-gray-400">
              {formatDate(current.createdAt)}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default NotificationModal;