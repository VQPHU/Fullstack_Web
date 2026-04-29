import { useEffect, useRef, useState, useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import {
  Bell,
  Send,
  History,
  Users,
  Eye,
  Search,
  ChevronLeft,
  ChevronRight,
  Upload,
  Link,
  X,
  Loader2,
  AlertCircle,
  Trash2,
} from "lucide-react";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { useAxiosPrivate } from "@/hooks/useAxiosPrivate";
import useAuthStore from "@/store/useAuthStore";
import { notificationSchema, type NotificationFormData } from "@/lib/validation";
import type {
  Notification,
  NotificationStats,
  NotificationUser,
} from "@/lib/type";

// ─── Helpers ──────────────────────────────────────────────────────────────────

type ActiveTab = "send" | "history";

const NOTIFICATION_TYPES = [
  { value: "announcement", label: "Announcement" },
  { value: "offer", label: "Offer" },
  { value: "deal", label: "Deal" },
  { value: "promotion", label: "Promotion" },
  { value: "alert", label: "Alert" },
  { value: "admin_message", label: "Admin Message" },
  { value: "general", label: "General" },
] as const;

const PRIORITY_OPTIONS = [
  { value: "low", label: "Low" },
  { value: "normal", label: "Normal" },
  { value: "high", label: "High" },
  { value: "urgent", label: "Urgent" },
] as const;

const TARGET_AUDIENCE_OPTIONS = [
  { value: "all", label: "All Users" },
  { value: "specific", label: "Specific Users" },
] as const;

const typeBadgeClass = (type: string) => {
  const map: Record<string, string> = {
    announcement: "bg-blue-100 text-blue-700 border border-blue-200",
    offer: "bg-green-100 text-green-700 border border-green-200",
    deal: "bg-sky-100 text-sky-700 border border-sky-200",
    promotion: "bg-orange-100 text-orange-700 border border-orange-200",
    alert: "bg-red-100 text-red-700 border border-red-200",
    admin_message: "bg-purple-100 text-purple-700 border border-purple-200",
    general: "bg-gray-100 text-gray-700 border border-gray-200",
  };
  return map[type] ?? "bg-gray-100 text-gray-700 border border-gray-200";
};

const priorityBadgeClass = (priority: string) => {
  const map: Record<string, string> = {
    low: "bg-gray-100 text-gray-600 border border-gray-200",
    normal: "bg-blue-100 text-blue-700 border border-blue-200",
    high: "bg-orange-100 text-orange-700 border border-orange-200",
    urgent: "bg-red-100 text-red-700 border border-red-200",
  };
  return map[priority] ?? "bg-gray-100 text-gray-600";
};

const fmtDateTime = (iso: string) =>
  new Date(iso).toLocaleString("en-US", {
    month: "numeric",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });

// ─── Component ────────────────────────────────────────────────────────────────

const NotificationsManagement = () => {
  const axiosPrivate = useAxiosPrivate();
  const { checkIsAdmin } = useAuthStore();
  const isAdmin = checkIsAdmin();
  const isReadOnly = !isAdmin;

  // ── Tab ───────────────────────────────────────────────────────────────────
  const [activeTab, setActiveTab] = useState<ActiveTab>("send");

  // ── Stats ─────────────────────────────────────────────────────────────────
  const [stats, setStats] = useState<NotificationStats>({
    totalSent: 0,
    totalRead: 0,
    readRate: 0,
    bulkSends: 0,
    totalUsers: 0,
  });

  // ── History ───────────────────────────────────────────────────────────────
  const [history, setHistory] = useState<Notification[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedNotification, setSelectedNotification] = useState<Notification | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // ── Users (specific target) ───────────────────────────────────────────────
  const [users, setUsers] = useState<NotificationUser[]>([]);
  const [usersTotal, setUsersTotal] = useState(0);
  const [usersTotalPages, setUsersTotalPages] = useState(1);
  const [usersPage, setUsersPage] = useState(1);
  const [usersSearch, setUsersSearch] = useState("");
  const [usersLoading, setUsersLoading] = useState(false);
  const [selectedUserIds, setSelectedUserIds] = useState<Set<string>>(new Set());

  // ── Image ─────────────────────────────────────────────────────────────────
  const [imageMode, setImageMode] = useState<"upload" | "url">("upload");
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ── Form ──────────────────────────────────────────────────────────────────
  const [sending, setSending] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<NotificationFormData>({
    resolver: zodResolver(notificationSchema),
    defaultValues: {
      type: "announcement",
      priority: "normal",
      imageMode: "upload",
      targetAudience: "all",
      userIds: [],
    },
  });

  const watchTargetAudience = watch("targetAudience");
  const watchImageMode = watch("imageMode");
  const watchImageUrl = watch("imageUrl");

  useEffect(() => {
    if (watchImageMode === "url") {
      setImagePreview(watchImageUrl || null);
    }
  }, [watchImageUrl, watchImageMode]);

  // ── Fetch stats ───────────────────────────────────────────────────────────
  const fetchStats = useCallback(async () => {
    try {
      const res = await axiosPrivate.get("/notification-admin/stats");
      setStats(res.data.stats);
    } catch {
      toast.error("Failed to fetch stats");
    }
  }, [axiosPrivate]);

  // ── Fetch history ─────────────────────────────────────────────────────────
  const fetchHistory = useCallback(async () => {
    setHistoryLoading(true);
    try {
      const res = await axiosPrivate.get("/notification-admin/history");
      setHistory(res.data.notifications);
    } catch {
      toast.error("Failed to fetch notification history");
    } finally {
      setHistoryLoading(false);
    }
  }, [axiosPrivate]);

  // ── Delete notification ───────────────────────────────────────────────────
  const handleDeleteClick = (notification: Notification) => {
    setSelectedNotification(notification);
    setIsDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedNotification) return;
    setDeleteLoading(true);
    try {
      await axiosPrivate.delete(`/notification-admin/history/${selectedNotification._id}`);
      setHistory((prev) => prev.filter((n) => n._id !== selectedNotification._id));
      fetchStats();
      toast.success("Notification deleted successfully");
      setIsDeleteModalOpen(false);
    } catch {
      toast.error("Failed to delete notification");
    } finally {
      setDeleteLoading(false);
    }
  };

  // ── Fetch users ───────────────────────────────────────────────────────────
  const fetchUsers = useCallback(async (page = 1, search = "") => {
    setUsersLoading(true);
    try {
      const res = await axiosPrivate.get("/notification-admin/users", {
        params: { page, limit: 10, search },
      });
      setUsers(res.data.users);
      setUsersTotal(res.data.total);
      setUsersTotalPages(res.data.totalPages);
    } catch {
      toast.error("Failed to fetch users");
    } finally {
      setUsersLoading(false);
    }
  }, [axiosPrivate]);

  useEffect(() => {
    fetchStats();
  }, []);

  useEffect(() => {
    if (activeTab === "history") fetchHistory();
  }, [activeTab]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (watchTargetAudience === "specific") {
        fetchUsers(usersPage, usersSearch);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [watchTargetAudience, usersPage, usersSearch]);

  // ── Image upload ──────────────────────────────────────────────────────────
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be less than 5MB");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result as string;
      setImagePreview(base64);
      setValue("imageBase64", base64);
    };
    reader.readAsDataURL(file);
  };

  const handleClearImage = () => {
    setImagePreview(null);
    setValue("imageBase64", undefined);
    setValue("imageUrl", undefined);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // ── User selection ────────────────────────────────────────────────────────
  const toggleUser = (id: string) => {
    setSelectedUserIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      setValue("userIds", Array.from(next));
      return next;
    });
  };

  const handleSelectAll = () => {
    const allIds = new Set([...selectedUserIds, ...users.map((u) => u._id)]);
    setSelectedUserIds(allIds);
    setValue("userIds", Array.from(allIds));
  };

  const handleClearSelection = () => {
    setSelectedUserIds(new Set());
    setValue("userIds", []);
  };

  // ── Submit ────────────────────────────────────────────────────────────────
  const onSubmit = async (data: NotificationFormData) => {
    setSending(true);
    try {
      const payload: Record<string, unknown> = {
        title: data.title,
        message: data.message,
        type: data.type,
        priority: data.priority,
        targetAudience: data.targetAudience,
      };

      if (data.imageMode === "upload" && data.imageBase64) {
        payload.imageBase64 = data.imageBase64;
      } else if (data.imageMode === "url" && data.imageUrl) {
        payload.imageUrl = data.imageUrl;
      }

      if (data.actionButtonText) payload.actionButtonText = data.actionButtonText;
      if (data.actionButtonUrl) payload.actionButtonUrl = data.actionButtonUrl;
      if (data.targetAudience === "specific") payload.userIds = data.userIds;

      await axiosPrivate.post("/notification-admin/send", payload);
      toast.success("Notification sent successfully!");
      handleReset();
      fetchStats();
    } catch {
      toast.error("Failed to send notification");
    } finally {
      setSending(false);
    }
  };

  const handleReset = () => {
    reset();
    setImagePreview(null);
    setImageMode("upload");
    setSelectedUserIds(new Set());
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // ─── RENDER ────────────────────────────────────────────────────────────────
  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">

      {/* Read-only banner */}
      {isReadOnly && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg px-4 py-2 text-sm text-yellow-800 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 text-yellow-600" />
          Read-Only Mode: You have full access to view all admin pages and data, but CRUD operations (create, update, delete) are disabled
        </div>
      )}

      {/* Page header */}
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-xl bg-black flex items-center justify-center">
          <Bell className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="text-3xl font-bold">Notifications</h1>
          <p className="text-muted-foreground text-sm">Send notifications to users and track engagement</p>
        </div>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border rounded-xl p-5">
          <p className="text-sm text-muted-foreground">Total Sent</p>
          <p className="text-3xl font-bold mt-1">{stats.totalSent}</p>
          <p className="text-xs text-muted-foreground mt-1">All time</p>
        </div>
        <div className="bg-white border rounded-xl p-5">
          <p className="text-sm text-muted-foreground">Read Rate</p>
          <p className="text-3xl font-bold mt-1 text-green-600">{stats.readRate}%</p>
          <p className="text-xs text-muted-foreground mt-1">{stats.totalRead} read</p>
        </div>
        <div className="bg-white border rounded-xl p-5">
          <p className="text-sm text-muted-foreground">Bulk Sends</p>
          <p className="text-3xl font-bold mt-1 text-blue-600">{stats.bulkSends}</p>
          <p className="text-xs text-muted-foreground mt-1">Total campaigns</p>
        </div>
        <div className="bg-white border rounded-xl p-5">
          <p className="text-sm text-muted-foreground">Total Users</p>
          <p className="text-3xl font-bold mt-1 text-purple-600">{stats.totalUsers}</p>
          <p className="text-xs text-muted-foreground mt-1">Available to notify</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2">
        <Button
          variant={activeTab === "send" ? "default" : "outline"}
          onClick={() => setActiveTab("send")}
          className={activeTab === "send" ? "bg-gray-900 text-white" : "bg-white"}
        >
          <Send className="w-4 h-4 mr-2" />
          Send Notification
        </Button>
        <Button
          variant={activeTab === "history" ? "default" : "outline"}
          onClick={() => setActiveTab("history")}
          className={activeTab === "history" ? "bg-gray-900 text-white" : "bg-white"}
        >
          <History className="w-4 h-4 mr-2" />
          History
        </Button>
      </div>

      {/* ── TAB: SEND ─────────────────────────────────────────────────────── */}
      {activeTab === "send" && (
        <div className="bg-white border rounded-xl p-6 space-y-6">
          <div>
            <h2 className="text-lg font-semibold">Create Notification</h2>
            <p className="text-sm text-muted-foreground">Send notifications to all users or select specific users</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">

            {/* Type + Priority */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Notification Type</Label>
                <Select
                  defaultValue="announcement"
                  onValueChange={(val) => setValue("type", val as NotificationFormData["type"])}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {NOTIFICATION_TYPES.map((t) => (
                      <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.type && <p className="text-xs text-red-500">{errors.type.message}</p>}
              </div>

              <div className="space-y-2">
                <Label>Priority</Label>
                <Select
                  defaultValue="normal"
                  onValueChange={(val) => setValue("priority", val as NotificationFormData["priority"])}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {PRIORITY_OPTIONS.map((p) => (
                      <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.priority && <p className="text-xs text-red-500">{errors.priority.message}</p>}
              </div>
            </div>

            {/* Title */}
            <div className="space-y-2">
              <Label>Title <span className="text-red-500">*</span></Label>
              <Input
                placeholder="e.g., Flash Sale - 50% Off!"
                {...register("title")}
              />
              {errors.title && <p className="text-xs text-red-500">{errors.title.message}</p>}
            </div>

            {/* Message */}
            <div className="space-y-2">
              <Label>Message <span className="text-red-500">*</span></Label>
              <Textarea
                placeholder="Enter your notification message here..."
                rows={4}
                {...register("message")}
              />
              {errors.message && <p className="text-xs text-red-500">{errors.message.message}</p>}
            </div>

            {/* Notification Image */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="flex items-center gap-2">
                  <Eye className="w-4 h-4" />
                  Notification Image (Optional)
                </Label>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    size="sm"
                    variant={imageMode === "upload" ? "default" : "outline"}
                    className={imageMode === "upload" ? "bg-gray-900 text-white" : "bg-white"}
                    onClick={() => {
                      setImageMode("upload");
                      setValue("imageMode", "upload");
                      handleClearImage();
                    }}
                  >
                    <Upload className="w-3.5 h-3.5 mr-1" />
                    Upload
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant={imageMode === "url" ? "default" : "outline"}
                    className={imageMode === "url" ? "bg-gray-900 text-white" : "bg-white"}
                    onClick={() => {
                      setImageMode("url");
                      setValue("imageMode", "url");
                      handleClearImage();
                    }}
                  >
                    <Link className="w-3.5 h-3.5 mr-1" />
                    URL
                  </Button>
                </div>
              </div>

              {/* Upload mode */}
              {watchImageMode === "upload" && (
                <div className="space-y-2">
                  <div className="border rounded-lg p-3 flex items-center gap-3">
                    <Input
                      ref={fileInputRef}
                      type="file"
                      accept=".jpg,.jpeg,.png,.gif,.webp"
                      onChange={handleFileChange}
                      className="cursor-pointer"
                    />
                    {imagePreview && (
                      <Button type="button" variant="ghost" size="icon" onClick={handleClearImage}>
                        <X className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Upload an image (max 5MB). Supported formats: JPG, PNG, GIF, WebP
                  </p>
                  {imagePreview && (
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="h-32 rounded-lg object-cover border"
                    />
                  )}
                </div>
              )}

              {/* URL mode */}
              {watchImageMode === "url" && (
                <div className="space-y-2">
                  <Input
                    placeholder="https://example.com/image.jpg"
                    {...register("imageUrl")}
                  />
                  {errors.imageUrl && (
                    <p className="text-xs text-red-500">{errors.imageUrl.message}</p>
                  )}
                  {imagePreview && (
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="h-32 rounded-lg object-cover border"
                      onError={() => setImagePreview(null)}
                    />
                  )}
                </div>
              )}
            </div>

            {/* Action Button */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Action Button Text (Optional)</Label>
                <Input placeholder="e.g., Shop Now" {...register("actionButtonText")} />
                {errors.actionButtonText && (
                  <p className="text-xs text-red-500">{errors.actionButtonText.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label>Action Button URL (Optional)</Label>
                <Input placeholder="/shop or https://example.com/offers" {...register("actionButtonUrl")} />
                <p className="text-xs text-muted-foreground">
                  Use relative path (/shop, /products) or full URL (https://example.com)
                </p>
                {errors.actionButtonUrl && (
                  <p className="text-xs text-red-500">{errors.actionButtonUrl.message}</p>
                )}
              </div>
            </div>

            {/* Target Audience */}
            <div className="space-y-3">
              <div className="space-y-2">
                <Label>Target Audience</Label>
                <Select
                  defaultValue="all"
                  onValueChange={(val) => {
                    setValue("targetAudience", val as "all" | "specific");
                    if (val === "all") {
                      setSelectedUserIds(new Set());
                      setValue("userIds", []);
                    }
                  }}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {TARGET_AUDIENCE_OPTIONS.map((o) => (
                      <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Specific Users Panel */}
              {watchTargetAudience === "specific" && (
                <div className="border rounded-xl p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-sm flex items-center gap-2">
                        <Users className="w-4 h-4" />
                        Select Users
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {selectedUserIds.size} of {usersTotal} users selected
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button type="button" variant="outline" size="sm" onClick={handleSelectAll}>
                        Select All
                      </Button>
                      <Button type="button" variant="outline" size="sm" onClick={handleClearSelection}>
                        Clear
                      </Button>
                    </div>
                  </div>

                  {/* Search */}
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      placeholder="Search by name or email..."
                      className="pl-9"
                      value={usersSearch}
                      onChange={(e) => {
                        setUsersSearch(e.target.value);
                        setUsersPage(1);
                      }}
                    />
                  </div>

                  {/* Users list */}
                  <div className="border rounded-lg divide-y max-h-64 overflow-y-auto">
                    {usersLoading ? (
                      <div className="flex justify-center items-center py-8">
                        <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
                      </div>
                    ) : users.length === 0 ? (
                      <div className="text-center py-8 text-sm text-muted-foreground">
                        No users found
                      </div>
                    ) : (
                      users.map((user) => (
                        <div
                          key={user._id}
                          className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 cursor-pointer"
                          onClick={(e) => {
                            if (
                              (e.target as HTMLElement).tagName !== "BUTTON" &&
                              (e.target as HTMLElement).tagName !== "INPUT"
                            ) {
                              toggleUser(user._id);
                            }
                          }}
                        >
                          <Checkbox
                            checked={selectedUserIds.has(user._id)}
                            onCheckedChange={() => toggleUser(user._id)}
                          />
                          <img
                            src={user.avatar}
                            alt={user.name}
                            className="w-9 h-9 rounded-full object-cover bg-gray-100"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src =
                                "https://res.cloudinary.com/dqfofmvva/image/upload/v1772354177/6596121_gwhzwk.png";
                            }}
                          />
                          <div>
                            <p className="text-sm font-medium">{user.name}</p>
                            <p className="text-xs text-muted-foreground">{user.email}</p>
                          </div>
                        </div>
                      ))
                    )}
                  </div>

                  {/* Pagination */}
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <p>Showing 1 to {Math.min(usersPage * 10, usersTotal)} of {usersTotal}</p>
                    <div className="flex items-center gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        className="h-8 w-8"
                        disabled={usersPage === 1}
                        onClick={() => setUsersPage((p) => p - 1)}
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </Button>
                      <span>{usersPage} / {usersTotalPages}</span>
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        className="h-8 w-8"
                        disabled={usersPage === usersTotalPages}
                        onClick={() => setUsersPage((p) => p + 1)}
                      >
                        <ChevronRight className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  {errors.userIds && (
                    <p className="text-xs text-red-500">{errors.userIds.message}</p>
                  )}
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-2">
              <Button type="button" variant="outline" onClick={handleReset} disabled={sending}>
                Reset
              </Button>
              <Button
                type="submit"
                disabled={sending || isReadOnly}
                className="bg-gray-900 hover:bg-gray-800 text-white"
              >
                {sending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="mr-2 h-4 w-4" />
                    Send Notification
                  </>
                )}
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* ── TAB: HISTORY ──────────────────────────────────────────────────── */}
      {activeTab === "history" && (
        <div className="bg-white border rounded-xl p-6 space-y-4">
          <div>
            <h2 className="text-lg font-semibold">Notification History</h2>
            <p className="text-sm text-muted-foreground">View all previously sent notifications</p>
          </div>

          {historyLoading ? (
            <div className="flex justify-center items-center py-16">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : history.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
              <Bell className="w-10 h-10 mb-3 opacity-30" />
              <p className="text-sm">No notifications sent yet</p>
            </div>
          ) : (
            <div className="space-y-4">
              {history.map((n) => (
                <div key={n._id} className="border rounded-xl p-5 space-y-3">
                  {/* Badges + Delete button */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${typeBadgeClass(n.type)}`}>
                        {n.type.replace("_", " ")}
                      </span>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${priorityBadgeClass(n.priority)}`}>
                        {n.priority}
                      </span>
                    </div>

                    {/* Delete button — hidden for read-only */}
                    {!isReadOnly && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 shrink-0 text-muted-foreground hover:text-red-600 hover:bg-red-50"
                        disabled={deleteLoading && selectedNotification?._id === n._id}
                        onClick={() => handleDeleteClick(n)}
                      >
                        {deleteLoading && selectedNotification?._id === n._id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Trash2 className="w-4 h-4" />
                        )}
                      </Button>
                    )}
                  </div>

                  {/* Title + Message */}
                  <div>
                    <p className="font-semibold">{n.title}</p>
                    <p className="text-sm text-muted-foreground mt-0.5">{n.message}</p>
                  </div>

                  {/* Image */}
                  {n.image && (
                    <img
                      src={n.image}
                      alt={n.title}
                      className="max-h-48 rounded-lg object-cover border"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src =
                          "https://res.cloudinary.com/dqfofmvva/image/upload/v1772354177/6596121_gwhzwk.png";
                      }}
                    />
                  )}

                  {/* Action button */}
                  {n.actionButtonText && (
                    <div>
                      <a
                        href={n.actionButtonUrl ?? "#"}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center px-3 py-1.5 rounded-lg bg-gray-900 text-white text-xs font-medium hover:bg-gray-700 transition"
                      >
                        {n.actionButtonText}
                      </a>
                    </div>
                  )}

                  {/* Footer stats */}
                  <div className="flex items-center gap-4 text-xs text-muted-foreground pt-1">
                    <span className="flex items-center gap-1">
                      <Send className="w-3.5 h-3.5" />
                      {n.totalSent} sent
                    </span>
                    <span className="flex items-center gap-1">
                      <Eye className="w-3.5 h-3.5" />
                      {n.totalRead} read
                    </span>
                    <span>{fmtDateTime(n.createdAt)}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <AlertDialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
        <AlertDialogContent className="rounded-xl">
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the notification{" "}
              <span className="font-semibold text-foreground">"{selectedNotification?.title}"</span>.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteLoading} className="rounded-lg">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              disabled={deleteLoading}
              className="bg-red-500 hover:bg-red-600 text-white rounded-lg"
            >
              {deleteLoading ? (
                <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Deleting...</>
              ) : (
                "Delete"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default NotificationsManagement;