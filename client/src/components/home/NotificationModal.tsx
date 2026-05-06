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

// ─── Constants ────────────────────────────────────────────────────────────────

const SESSION_KEY = "shown_notification_ids";

const TYPE_CONFIG: Record<
  string,
  { icon: React.ElementType; color: string; label: string }
> = {
  announcement: { icon: Megaphone, color: "#6366f1", label: "Announcement" },
  alert: { icon: AlertTriangle, color: "#ef4444", label: "Alert" },
  "admin message": { icon: MessageSquare, color: "#0ea5e9", label: "Message" },
  promotion: { icon: Percent, color: "#f59e0b", label: "Promotion" },
  deal: { icon: Tag, color: "#10b981", label: "Deal" },
  offer: { icon: Zap, color: "#8b5cf6", label: "Offer" },
  general: { icon: Bell, color: "#64748b", label: "Notification" },
};

// ─── Session helpers ──────────────────────────────────────────────────────────

function getShownIds(): Set<string> {
  try {
    const raw = sessionStorage.getItem(SESSION_KEY);
    return raw ? new Set(JSON.parse(raw)) : new Set();
  } catch {
    return new Set();
  }
}

function markShown(id: string) {
  try {
    const ids = getShownIds();
    ids.add(id);
    sessionStorage.setItem(SESSION_KEY, JSON.stringify([...ids]));
  } catch { }
}

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
        const shownIds = getShownIds();
        const toShow = Array.isArray(all)
          ? all.filter(
            (n) =>
              MODAL_TYPES.map((t) => t.toLowerCase()).includes(n.type.toLowerCase()) &&
              !shownIds.has(n._id)
          )
          : [];
        if (toShow.length > 0) {
          setNotifications(toShow);
          setCurrentIndex(0);
          setVisible(true);
        }
      } catch (err) {
        console.error("Failed to load notifications:", err);
      }
    };
    load();
  }, [hasHydrated, auth_token]);

  const current = notifications[currentIndex];

  const dismissCurrent = useCallback(() => {
    if (!current) return;
    markShown(current._id);
    if (auth_token && authUser?._id) {
      markAdminNotificationRead(current._id, authUser._id, auth_token).catch(() => { });
    }
  }, [current, auth_token, authUser]);

  const handleClose = useCallback(() => {
    if (!current) return;
    dismissCurrent();
    const isLast = currentIndex >= notifications.length - 1;
    if (isLast) {
      setVisible(false);
    } else {
      setCurrentIndex((prev) => prev + 1);
      setImageError(false);
    }
  }, [current, currentIndex, notifications.length, dismissCurrent]);
  useEffect(() => {
  const clear = () => sessionStorage.removeItem(SESSION_KEY);
  window.addEventListener("beforeunload", clear);
  return () => window.removeEventListener("beforeunload", clear);
}, []);

  const handlePrev = () => {
    if (currentIndex > 0) { setCurrentIndex((p) => p - 1); setImageError(false); }
  };
  const handleNext = () => {
    if (currentIndex < notifications.length - 1) { setCurrentIndex((p) => p + 1); setImageError(false); }
  };

  if (!visible || !current) return null;

  const config = TYPE_CONFIG[current.type.toLowerCase()] ?? TYPE_CONFIG["general"];
  const Icon = config.icon;
  const total = notifications.length;
  const imgSrc = (current as any).imageUrl ?? current.image;
  const hasImage = !!imgSrc && !imageError;
  const actionUrl = (current as any).actionUrl ?? current.actionButtonUrl;
  const actionText = current.actionButtonText;
  const hasAction = !!(actionText && actionUrl);

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={handleClose}
      />

      {/* Card */}
      <div
        className="relative z-10 w-full max-w-sm overflow-hidden rounded-3xl shadow-2xl"
        style={{ background: "#111" }}
      >
        {/* Image fills entire card */}
        {hasImage ? (
          <img
            src={imgSrc}
            alt={current.title}
            className="w-full object-cover"
            style={{ height: 480, display: "block" }}
            onError={() => setImageError(true)}
          />
        ) : (
          <div
            className="w-full"
            style={{
              height: 480,
              background: `linear-gradient(135deg, ${config.color}33 0%, #111 100%)`,
            }}
          />
        )}

        {/* Top row: type badge + close */}
        <div className="absolute top-4 left-4 right-4 flex items-center justify-between">
          <span
            className="flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full"
            style={{
              background: "rgba(0,0,0,0.6)",
              color: config.color,
              backdropFilter: "blur(8px)",
              border: `1px solid ${config.color}55`,
            }}
          >
            <Icon size={11} strokeWidth={2.5} />
            {config.label}
          </span>

          <button
            onClick={handleClose}
            className="w-9 h-9 flex items-center justify-center rounded-full text-white cursor-pointer transition-opacity hover:opacity-80"
            style={{ background: "rgba(0,0,0,0.55)", backdropFilter: "blur(8px)" }}
          >
            <X size={16} strokeWidth={2.5} />
          </button>
        </div>

        {/* Bottom gradient overlay: title + message + action */}
        <div
          className="absolute bottom-0 left-0 right-0 flex flex-col gap-3 px-5 pt-20 pb-5"
          style={{
            background:
              "linear-gradient(to top, rgba(0,0,0,0.95) 55%, rgba(0,0,0,0.6) 78%, transparent 100%)",
          }}
        >
          <h2 className="text-xl font-extrabold text-white leading-snug">
            {current.title}
          </h2>

          {current.message && (
            <p className="text-sm text-white/65 leading-relaxed">
              {current.message}
            </p>
          )}

          {hasAction && (
            <a
              href={actionUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={handleClose}
              className="mt-1 flex items-center justify-center gap-2 w-full py-3.5 rounded-2xl text-sm font-bold shadow-lg transition-opacity hover:opacity-90"
              style={{
                background: `linear-gradient(135deg, ${config.color}, ${config.color}bb)`,
                color: "#fff",
              }}
            >
              {actionText}
              <ExternalLink size={14} strokeWidth={2.5} />
            </a>
          )}

          {/* Pagination — only when multiple notifications */}
          {total > 1 && (
            <div className="flex items-center justify-between pt-1">
              <div className="flex items-center gap-1.5">
                {notifications.map((_, i) => (
                  <div
                    key={i}
                    className="h-1.5 rounded-full transition-all duration-200"
                    style={{
                      width: i === currentIndex ? 20 : 6,
                      background: i === currentIndex ? config.color : "rgba(255,255,255,0.3)",
                    }}
                  />
                ))}
              </div>
              <div className="flex gap-1.5">
                <button
                  onClick={handlePrev}
                  disabled={currentIndex === 0}
                  className="w-8 h-8 flex items-center justify-center rounded-lg text-white disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer hover:bg-white/10 transition-colors"
                  style={{ border: "1px solid rgba(255,255,255,0.2)" }}
                >
                  <ChevronLeft size={15} strokeWidth={2.5} />
                </button>
                <button
                  onClick={handleNext}
                  disabled={currentIndex === total - 1}
                  className="w-8 h-8 flex items-center justify-center rounded-lg text-white disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer hover:bg-white/10 transition-colors"
                  style={{ border: "1px solid rgba(255,255,255,0.2)" }}
                >
                  <ChevronRight size={15} strokeWidth={2.5} />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default NotificationModal;