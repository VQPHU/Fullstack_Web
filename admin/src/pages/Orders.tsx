import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription, AlertDialogFooter,
  AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog, DialogContent, DialogDescription,
  DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select, SelectContent, SelectItem,
  SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Table, TableBody, TableCell,
  TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { useAxiosPrivate } from "@/hooks/useAxiosPrivate";
import useAuthStore from "@/store/useAuthStore";
import {
  AlertCircle, CheckCircle2, ChevronLeft, ChevronRight,
  Clock, Eye, History, Loader2, Package, Pencil,
  Plus, RefreshCw, Trash2,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import {
  ActiveTab, CashSummary, EditableItem,
  Order, OrderStatus, PaymentStatus, StatusHistory,
} from "../lib/type";

// ─── Constants ────────────────────────────────────────────────────────────────

const ORDER_STATUS_OPTIONS: OrderStatus[] = ["pending", "paid", "completed", "cancelled"];
const PAYMENT_STATUS_OPTIONS: PaymentStatus[] = ["pending", "paid", "failed"];

const EMPTY_SUMMARY: CashSummary = {
  totalReceived: 0, confirmedCount: 0,
  pendingToReceive: 0, pendingOrders: 0,
  pendingSubmissions: 0, pendingSubmissionsCount: 0,
  confirmed: 0, confirmedSubmissions: 0,
};

// ─── Status conditions (single source of truth) ───────────────────────────────
//
//  Pending to Receive  → status: pending   | paymentStatus: pending
//  Pending Submissions → status: pending   | paymentStatus: paid
//  Cash Received (tab) → status: pending   | paymentStatus: paid
//  Confirmed           → status: paid      | paymentStatus: paid
//  Total Received      → status: completed | paymentStatus: paid
//
const isPendingToReceive = (o: Order) => o.status === "pending" && o.paymentStatus === "pending";
const isPendingSubmission = (o: Order) => o.status === "pending" && o.paymentStatus === "paid";
const isConfirmed = (o: Order) => o.status === "paid" && o.paymentStatus === "paid";
const isTotalReceived = (o: Order) => o.status === "completed" && o.paymentStatus === "paid";

// Derive tab from new status after edit — auto-switches user to correct tab
const deriveTab = (status: OrderStatus, paymentStatus: PaymentStatus): ActiveTab => {
  if (status === "pending" && paymentStatus === "pending") return "pending";
  if (status === "pending" && paymentStatus === "paid") return "cash";
  if (status === "paid" && paymentStatus === "paid") return "cash";
  if (status === "completed") return "cash";
  return "orders"; // cancelled / other
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

const fmtDate = (iso: string) =>
  new Date(iso).toLocaleDateString("en-US", { month: "numeric", day: "numeric", year: "numeric" });

const fmtDateTime = (iso: string) =>
  new Date(iso).toLocaleString("en-US", {
    month: "short", day: "numeric", year: "numeric",
    hour: "numeric", minute: "2-digit", hour12: true,
  });

const STATUS_BADGE: Record<OrderStatus, string> = {
  pending: "bg-yellow-100 text-yellow-800 border border-yellow-300",
  paid: "bg-blue-100 text-blue-800 border border-blue-300",
  completed: "bg-green-100 text-green-800 border border-green-300",
  cancelled: "bg-red-100 text-red-800 border border-red-300",
};

const PAYMENT_BADGE: Record<PaymentStatus, string> = {
  paid: "bg-green-100 text-green-800 border border-green-300",
  pending: "bg-yellow-100 text-yellow-800 border border-yellow-300",
  failed: "bg-red-100 text-red-800 border border-red-300",
};

const sum = (list: Order[]) => list.reduce((acc, o) => acc + (o.totalAmount ?? 0), 0);

const buildSummary = (list: Order[]): CashSummary => {
  const pendingToReceive = list.filter(isPendingToReceive);
  const pendingSubmission = list.filter(isPendingSubmission);
  const confirmed = list.filter(isConfirmed);
  const totalReceived = list.filter(isTotalReceived);

  return {
    totalReceived: sum(totalReceived),
    confirmedCount: totalReceived.length,
    pendingToReceive: sum(pendingToReceive),
    pendingOrders: pendingToReceive.length,
    pendingSubmissions: sum(pendingSubmission),
    pendingSubmissionsCount: pendingSubmission.length,
    confirmed: sum(confirmed),
    confirmedSubmissions: confirmed.length,
  };
};

// ─── Shared UI Pieces ─────────────────────────────────────────────────────────

const StatusBadge = ({ status }: { status: OrderStatus }) => (
  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${STATUS_BADGE[status]}`}>
    {capitalize(status)}
  </span>
);

const PaymentBadge = ({ status }: { status: PaymentStatus }) => (
  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${PAYMENT_BADGE[status]}`}>
    {capitalize(status)}
  </span>
);

const Spinner = () => (
  <div className="flex justify-center items-center py-16">
    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
  </div>
);

const EmptyState = ({ icon: Icon, message }: { icon: React.ElementType; message: string }) => (
  <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
    <Icon className="w-10 h-10 mb-3 opacity-30" />
    <p className="text-sm">{message}</p>
  </div>
);

// ─── Summary Cards ────────────────────────────────────────────────────────────

const TopCards = ({ summary, userName, userEmail, userRole }: {
  summary: CashSummary;
  userName?: string;
  userEmail?: string;
  userRole?: string;
}) => (
  <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
    <div className="lg:col-span-2 border rounded-xl p-5 bg-white">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
          <Package className="w-5 h-5 text-blue-600" />
        </div>
        <div>
          <p className="font-semibold text-sm">Account Details</p>
          <p className="text-xs text-muted-foreground">Accounts Department</p>
        </div>
      </div>
      <div className="space-y-3">
        {[
          { label: "Name", value: userName || "—" },
          { label: "Email", value: userEmail || "—" },
          { label: "Role", value: userRole ? capitalize(userRole) : "—" },
        ].map(row => (
          <div key={row.label} className="flex justify-between items-center border-b pb-2 last:border-0">
            <span className="text-sm text-muted-foreground">{row.label}:</span>
            <span className="text-sm font-medium">{row.value}</span>
          </div>
        ))}
      </div>
    </div>

    <div className="border rounded-xl p-5 bg-green-50 border-green-200">
      <div className="flex items-center gap-2 mb-2">
        <CheckCircle2 className="w-5 h-5 text-green-600" />
        <p className="font-semibold text-green-800">Total Received</p>
      </div>
      <p className="text-xs text-green-600 mb-3">All confirmed cash collections</p>
      <p className="text-3xl font-bold text-green-700">${summary.totalReceived.toFixed(2)}</p>
      <p className="text-xs text-green-600 mt-1">
        From {summary.confirmedCount} confirmed submission(s)
      </p>
    </div>
  </div>
);

const StatCards = ({ summary }: { summary: CashSummary }) => (
  <div className="grid grid-cols-3 gap-4 mb-4">
    <div className="border rounded-xl p-4 bg-white">
      <div className="flex items-center gap-2 mb-1">
        <Clock className="w-4 h-4 text-orange-500" />
        <p className="text-sm text-muted-foreground">Pending to Receive</p>
      </div>
      <p className="text-xl font-bold text-orange-500">${summary.pendingToReceive.toFixed(2)}</p>
      <p className="text-xs text-muted-foreground mt-1">{summary.pendingOrders} order(s) with pending payment</p>
    </div>
    <div className="border rounded-xl p-4 bg-white">
      <div className="flex items-center gap-2 mb-1">
        <AlertCircle className="w-4 h-4 text-purple-500" />
        <p className="text-sm text-muted-foreground">Pending Submissions</p>
      </div>
      <p className="text-xl font-bold text-purple-500">${summary.pendingSubmissions.toFixed(2)}</p>
      <p className="text-xs text-muted-foreground mt-1">{summary.pendingSubmissionsCount} submission(s) to confirm</p>
    </div>
    <div className="border rounded-xl p-4 bg-white">
      <div className="flex items-center gap-2 mb-1">
        <CheckCircle2 className="w-4 h-4 text-green-600" />
        <p className="text-sm text-muted-foreground">Confirmed</p>
      </div>
      <p className="text-xl font-bold text-green-600">${summary.confirmed.toFixed(2)}</p>
      <p className="text-xs text-muted-foreground mt-1">{summary.confirmedSubmissions} confirmed submission(s)</p>
    </div>
  </div>
);

// ─── Main Component ───────────────────────────────────────────────────────────

const OrdersManagement = () => {
  const axiosPrivate = useAxiosPrivate();
  const { checkIsAdmin, user } = useAuthStore();
  const isReadOnly = !checkIsAdmin();

  // ── Tab ────────────────────────────────────────────────────────────────────
  const [activeTab, setActiveTab] = useState<ActiveTab>("pending");

  // ── Orders tab state ───────────────────────────────────────────────────────
  const [orders, setOrders] = useState<Order[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterPayment, setFilterPayment] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // ── Cash / Summary state ───────────────────────────────────────────────────
  const [cashOrders, setCashOrders] = useState<Order[]>([]);
  const [cashSummary, setCashSummary] = useState<CashSummary>(EMPTY_SUMMARY);
  const [cashLoading, setCashLoading] = useState(false);

  // ── Pending tab state ──────────────────────────────────────────────────────
  const [pendingOrders, setPendingOrders] = useState<Order[]>([]);
  const [pendingLoading, setPendingLoading] = useState(false);

  // ── Selection ──────────────────────────────────────────────────────────────
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // ── Modals ─────────────────────────────────────────────────────────────────
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const [isDetailOpen, setIsDetailOpen] = useState(false);

  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editOrderStatus, setEditOrderStatus] = useState<OrderStatus>("pending");
  const [editPaymentStatus, setEditPaymentStatus] = useState<PaymentStatus>("pending");
  const [editTotalAmount, setEditTotalAmount] = useState(0);
  const [editStreet, setEditStreet] = useState("");
  const [editCity, setEditCity] = useState("");
  const [editZip, setEditZip] = useState("");
  const [editCountry, setEditCountry] = useState("");
  const [editItems, setEditItems] = useState<EditableItem[]>([]);
  const [editLoading, setEditLoading] = useState(false);

  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [statusHistory, setStatusHistory] = useState<StatusHistory[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const [isBulkDeleteOpen, setIsBulkDeleteOpen] = useState(false);
  const [bulkDeleteLoading, setBulkDeleteLoading] = useState(false);

  // ── Data fetching ──────────────────────────────────────────────────────────

  const fetchOrders = useCallback(async (showRefreshing = false) => {
    showRefreshing ? setRefreshing(true) : setLoading(true);
    try {
      const { data } = await axiosPrivate.get("/orders/admin", {
        params: {
          page, perPage, sortOrder,
          ...(filterStatus !== "all" && { status: filterStatus }),
          ...(filterPayment !== "all" && { paymentStatus: filterPayment }),
          ...(searchQuery && { search: searchQuery }),
        },
      });
      setOrders(data?.orders ?? []);
      setTotal(data?.total ?? 0);
      setTotalPages(data?.totalPages ?? 1);
      return true;
    } catch {
      toast.error("Failed to fetch orders");
      return false;
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [axiosPrivate, page, perPage, sortOrder, filterStatus, filterPayment, searchQuery]);

  const fetchCashOrders = useCallback(async () => {
    setCashLoading(true);
    try {
      const { data } = await axiosPrivate.get("/orders/admin", { params: { perPage: 200 } });
      const list: Order[] = data?.orders ?? [];
      setCashOrders(list);
      setCashSummary(buildSummary(list));
      return true;
    } catch {
      toast.error("Failed to fetch orders");
      return false;
    } finally {
      setCashLoading(false);
    }
  }, [axiosPrivate]);

  // Pending tab = status:pending & paymentStatus:pending only
  const fetchPendingOrders = useCallback(async () => {
    setPendingLoading(true);
    try {
      const { data } = await axiosPrivate.get("/orders/admin", {
        params: { status: "pending", paymentStatus: "pending", perPage: 200 },
      });
      setPendingOrders(data?.orders ?? []);
      return true;
    } catch {
      toast.error("Failed to fetch pending orders");
      return false;
    } finally {
      setPendingLoading(false);
    }
  }, [axiosPrivate]);

  // ── Side effects ───────────────────────────────────────────────────────────

  useEffect(() => {
    setSelectedIds(new Set());
    if (activeTab === "orders") { fetchOrders(); fetchCashOrders(); }
    if (activeTab === "cash") fetchCashOrders();
    if (activeTab === "pending") { fetchPendingOrders(); fetchCashOrders(); }
  }, [activeTab]);

  useEffect(() => {
    if (activeTab === "orders") fetchOrders();
  }, [page, sortOrder, filterStatus, filterPayment, perPage]);

  const refreshCurrentTab = useCallback(async () => {
    let ok = false;
    if (activeTab === "orders") ok = await fetchOrders(true);
    if (activeTab === "cash") ok = await fetchCashOrders();
    if (activeTab === "pending") ok = await fetchPendingOrders();
    if (ok) toast.success("Orders refreshed");
  }, [activeTab, fetchOrders, fetchCashOrders, fetchPendingOrders]);

  // refetchAll: refresh data, then optionally switch tab
  const refetchAll = useCallback(async (switchToTab?: ActiveTab) => {
    await fetchCashOrders();
    if (activeTab === "orders") fetchOrders();
    if (activeTab === "pending") fetchPendingOrders();
    if (switchToTab) setActiveTab(switchToTab);
  }, [activeTab, fetchOrders, fetchCashOrders, fetchPendingOrders]);

  // ── Selection helpers ──────────────────────────────────────────────────────

  const toggleSelect = (id: string) =>
    setSelectedIds(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });

  const selectAll = (checked: boolean) =>
    setSelectedIds(checked ? new Set(orders.map(o => o._id)) : new Set());

  // ── Handlers: Edit ─────────────────────────────────────────────────────────

  const handleOpenEdit = (order: Order) => {
    setSelectedOrder(order);
    setEditOrderStatus(order.status);
    setEditPaymentStatus(order.paymentStatus);
    setEditTotalAmount(order.totalAmount);
    setEditStreet(order.shippingAddress?.street ?? "");
    setEditCity(order.shippingAddress?.city ?? "");
    setEditZip(order.shippingAddress?.postalCode ?? "");
    setEditCountry(order.shippingAddress?.country ?? "");
    setEditItems(
      order.items?.map(i => ({
        name: i.products?.name ?? "",
        unitPrice: i.price,
        quantity: i.quantity,
        totalPrice: i.price * i.quantity,
      })) ?? []
    );
    setIsEditOpen(true);
  };

  const handleEditItemChange = (idx: number, field: keyof EditableItem, value: string) => {
    setEditItems(prev => {
      const next = [...prev];
      const item = { ...next[idx] };
      if (field === "name") item.name = value;
      if (field === "unitPrice") item.unitPrice = parseFloat(value) || 0;
      if (field === "quantity") item.quantity = parseInt(value) || 1;
      item.totalPrice = item.unitPrice * item.quantity;
      next[idx] = item;
      setEditTotalAmount(parseFloat(next.reduce((s, i) => s + i.totalPrice, 0).toFixed(2)));
      return next;
    });
  };

  const handleAddItem = () =>
    setEditItems(prev => [...prev, { name: "", unitPrice: 0, quantity: 1, totalPrice: 0 }]);

  const handleRemoveItem = (idx: number) =>
    setEditItems(prev => {
      const next = prev.filter((_, i) => i !== idx);
      setEditTotalAmount(parseFloat(next.reduce((s, i) => s + i.totalPrice, 0).toFixed(2)));
      return next;
    });

  const handleUpdateOrder = async () => {
    if (!selectedOrder) return;
    setEditLoading(true);
    try {
      await axiosPrivate.put(`/orders/${selectedOrder._id}/webhook-status`, {
        status: editOrderStatus,
        paymentStatus: editPaymentStatus,
        totalAmount: editTotalAmount,
        shippingAddress: { street: editStreet, city: editCity, postalCode: editZip, country: editCountry },
      });
      toast.success("Order updated successfully");
      setIsEditOpen(false);
      // Auto-switch to the tab matching the new status combination
      const targetTab = deriveTab(editOrderStatus, editPaymentStatus);
      await refetchAll(targetTab);
    } catch {
      toast.error("Failed to update order");
    } finally {
      setEditLoading(false);
    }
  };

  // ── Handlers: History ──────────────────────────────────────────────────────

  const handleOpenHistory = async (order: Order) => {
    setSelectedOrder(order);
    setIsHistoryOpen(true);
    setHistoryLoading(true);
    try {
      const { data } = await axiosPrivate.get(`/orders/${order._id}/history`);
      setStatusHistory(data?.history ?? []);
    } catch {
      setStatusHistory([{
        status: order.status,
        changedBy: order.user?.name ?? "Unknown",
        notes: "Order created",
        createdAt: order.createdAt,
      }]);
    } finally {
      setHistoryLoading(false);
    }
  };

  // ── Handlers: Delete ───────────────────────────────────────────────────────

  const handleDeleteOrder = async () => {
    if (!selectedOrder) return;
    setDeleteLoading(true);
    try {
      await axiosPrivate.delete(`/orders/${selectedOrder._id}`);
      toast.success("Order deleted successfully");
      setIsDeleteOpen(false);
      setPage(1);
      refetchAll();
    } catch {
      toast.error("Failed to delete order");
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleBulkDelete = async () => {
    setBulkDeleteLoading(true);
    try {
      await Promise.all(Array.from(selectedIds).map(id => axiosPrivate.delete(`/orders/${id}`)));
      toast.success(`${selectedIds.size} order(s) deleted successfully`);
      setIsBulkDeleteOpen(false);
      setSelectedIds(new Set());
      refetchAll();
    } catch {
      toast.error("Failed to delete some orders");
    } finally {
      setBulkDeleteLoading(false);
    }
  };

  // ── Handlers: Cash confirm ─────────────────────────────────────────────────

  const handleConfirmCash = async (order: Order) => {
    try {
      await axiosPrivate.put(`/orders/${order._id}/webhook-status`, {
        status: "paid",
        paymentStatus: "paid",
      });
      toast.success("Cash confirmed successfully");
      await fetchCashOrders();
      await fetchPendingOrders();
    } catch {
      toast.error("Failed to confirm cash");
    }
  };

  // ── Row actions ────────────────────────────────────────────────────────────

  const renderActions = (order: Order) => (
    <div className="flex items-center gap-1">
      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => { setSelectedOrder(order); setIsDetailOpen(true); }} title="View">
        <Eye className="h-4 w-4" />
      </Button>
      {!isReadOnly && (
        <>
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleOpenEdit(order)} title="Edit">
            <Pencil className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleOpenHistory(order)} title="Status history">
            <History className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500 hover:text-red-600"
            onClick={() => { setSelectedOrder(order); setIsDeleteOpen(true); }} title="Delete">
            <Trash2 className="h-4 w-4" />
          </Button>
        </>
      )}
    </div>
  );

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="p-6 space-y-4 bg-gray-50 min-h-screen">

      {/* Read-only banner */}
      {isReadOnly && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg px-4 py-2 text-sm text-yellow-800 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 text-yellow-600" />
          Read-Only Mode: You have full access to view all admin pages and data, but CRUD operations are disabled.
        </div>
      )}

      {/* Page header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold">Orders Management</h1>
          <p className="text-muted-foreground text-sm mt-1">View and manage all customer orders</p>
        </div>
        <div className="flex items-center gap-3">
          <Select value={String(perPage)} onValueChange={v => { setPerPage(Number(v)); setPage(1); }}>
            <SelectTrigger className="w-28 bg-white">
              <SelectValue>{perPage} / page</SelectValue>
            </SelectTrigger>
            <SelectContent>
              {[10, 20, 30, 50].map(n => (
                <SelectItem key={n} value={String(n)}>{n} / page</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={refreshCurrentTab} disabled={refreshing} className="bg-white">
            <RefreshCw className={`mr-2 h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
            Refresh
          </Button>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center">
              <Package className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-blue-600">{total || orders.length}</span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex bg-gray-100/80 p-1 rounded-xl w-fit border border-gray-200 shadow-sm">
        {([
          { key: "pending", label: "Pending", icon: Clock },
          { key: "cash", label: "Cash Received", icon: CheckCircle2 },
          { key: "orders", label: "Orders", icon: Package },
        ] as { key: ActiveTab; label: string; icon: React.ElementType }[]).map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex items-center gap-2 px-6 py-2 text-sm font-semibold transition-all rounded-lg
              ${activeTab === tab.key
                ? "bg-white text-foreground shadow-sm"
                : "text-gray-500 hover:text-gray-700 hover:bg-gray-200/50"}`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Shared summary cards (all tabs) */}
      <TopCards summary={cashSummary} userName={user?.name} userEmail={user?.email} userRole={user?.role} />
      <StatCards summary={cashSummary} />

      {/* ── TAB: PENDING ──────────────────────────────────────────────────── */}
      {/* status: pending | paymentStatus: pending */}
      {activeTab === "pending" && (
        <div className="border rounded-xl bg-white overflow-hidden">
          <div className="px-5 py-4 bg-purple-50 border-b flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-purple-100 flex items-center justify-center">
              <Package className="w-4 h-4 text-purple-600" />
            </div>
            <div>
              <p className="font-semibold text-sm text-purple-800">Pending Cash Submissions</p>
              <p className="text-xs text-purple-600">Review and confirm cash submissions from deliverymen</p>
            </div>
          </div>

          {pendingLoading ? <Spinner /> : pendingOrders.length === 0 ? (
            <EmptyState icon={CheckCircle2} message="No pending submissions to confirm" />
          ) : (
            <div className="divide-y">
              {pendingOrders.map(order => (
                <div key={order._id} className="px-5 py-4 flex items-center justify-between hover:bg-gray-50">
                  <div>
                    <p className="font-medium text-sm">{order.orderId}</p>
                    <p className="text-xs text-muted-foreground">
                      Collected by: {order.user?.name} on {fmtDate(order.createdAt)}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-semibold">${order.totalAmount?.toFixed(2)}</span>
                    {!isReadOnly && (
                      <Button size="sm" onClick={() => handleConfirmCash(order)}
                        className="bg-green-600 hover:bg-green-700 text-white">
                        Confirm
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── TAB: CASH RECEIVED ────────────────────────────────────────────── */}
      {/* status: pending | paymentStatus: paid */}
      {activeTab === "cash" && (
        <div className="border rounded-xl bg-white overflow-hidden">
          <div className="px-5 py-4 bg-green-50 border-b flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-green-100 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4 text-green-600" />
            </div>
            <div>
              <p className="font-semibold text-sm text-green-800">Cash Received</p>
              <p className="text-xs text-green-600">Successfully confirmed cash collections</p>
            </div>
          </div>

          {cashLoading ? <Spinner /> : (() => {
            const confirmed = cashOrders.filter(isPendingSubmission);
            return confirmed.length === 0 ? (
              <EmptyState icon={CheckCircle2} message="No confirmed cash collections yet" />
            ) : (
              <div className="divide-y">
                {confirmed.map(order => (
                  <div key={order._id} className="px-5 py-4 hover:bg-gray-50">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-sm">Order #{order.orderId}</p>
                        <p className="text-xs text-muted-foreground">
                          {order.paymentMethod === "cod" ? "Collected by" : "Paid by"}: {order.user?.name} on {fmtDate(order.createdAt)}
                        </p>
                        <p className="text-xs text-muted-foreground">Updated: {fmtDate(order.updatedAt)}</p>
                      </div>
                      <span className="font-bold text-green-600">${order.totalAmount?.toFixed(2)}</span>
                    </div>
                  </div>
                ))}
              </div>
            );
          })()}
        </div>
      )}

      {/* ── TAB: ORDERS ───────────────────────────────────────────────────── */}
      {activeTab === "orders" && (
        <div className="border rounded-xl bg-white overflow-hidden">
          <div className="px-5 py-4 bg-blue-50 border-b flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center">
              <Package className="w-4 h-4 text-blue-600" />
            </div>
            <div>
              <p className="font-semibold text-sm text-blue-800">Delivered Orders</p>
              <p className="text-xs text-blue-600">All delivered orders for review</p>
            </div>
          </div>

          {/* Bulk delete banner */}
          {selectedIds.size > 0 && (
            <div className="px-5 py-3 bg-blue-50 border-b flex items-center justify-between">
              <div className="flex items-center gap-2 text-blue-700 text-sm font-medium">
                <Package className="w-4 h-4" />
                {selectedIds.size} order(s) selected
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={() => setSelectedIds(new Set())}>
                  Unselect All
                </Button>
                <Button size="sm" className="bg-red-500 hover:bg-red-600 text-white"
                  onClick={() => setIsBulkDeleteOpen(true)}>
                  <Trash2 className="w-4 h-4 mr-1" /> Delete Selected
                </Button>
              </div>
            </div>
          )}

          {/* Filters */}
          <div className="px-5 py-3 border-b flex items-center gap-3 bg-white flex-wrap">
            <Input
              placeholder="Search orders..."
              value={searchQuery}
              onChange={e => { setSearchQuery(e.target.value); setPage(1); }}
              className="flex-1 max-w-xs h-9 text-sm"
            />
            {[
              {
                value: filterStatus, onChange: (v: string) => { setFilterStatus(v); setPage(1); },
                placeholder: "All Status", options: ORDER_STATUS_OPTIONS,
              },
              {
                value: sortOrder, onChange: (v: string) => { setSortOrder(v as "asc" | "desc"); setPage(1); },
                placeholder: "Sort", options: null,
              },
              {
                value: filterPayment, onChange: (v: string) => { setFilterPayment(v); setPage(1); },
                placeholder: "All Payments", options: PAYMENT_STATUS_OPTIONS,
              },
            ].map((sel, i) => (
              <Select key={i} value={sel.value} onValueChange={sel.onChange}>
                <SelectTrigger className="w-36 h-9 text-sm bg-white">
                  <SelectValue placeholder={sel.placeholder} />
                </SelectTrigger>
                <SelectContent>
                  {sel.options === null ? (
                    <>
                      <SelectItem value="desc">Newest First</SelectItem>
                      <SelectItem value="asc">Oldest First</SelectItem>
                    </>
                  ) : (
                    <>
                      <SelectItem value="all">{sel.placeholder}</SelectItem>
                      {sel.options.map(s => (
                        <SelectItem key={s} value={s}>{capitalize(s)}</SelectItem>
                      ))}
                    </>
                  )}
                </SelectContent>
              </Select>
            ))}
          </div>

          {/* Table */}
          {loading ? <Spinner /> : (
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50">
                  {!isReadOnly && (
                    <TableHead className="w-10">
                      <Checkbox
                        checked={orders.length > 0 && selectedIds.size === orders.length}
                        onCheckedChange={checked => selectAll(!!checked)}
                      />
                    </TableHead>
                  )}
                  {["Order ID", "Customer", "Items", "Total", "Status", "Payment", "Date", "Actions"].map(h => (
                    <TableHead key={h} className="text-xs font-semibold">{h}</TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {orders.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-16 text-muted-foreground text-sm">
                      No orders found
                    </TableCell>
                  </TableRow>
                ) : orders.map(order => (
                  <TableRow key={order._id} className={selectedIds.has(order._id) ? "bg-blue-50" : ""}>
                    {!isReadOnly && (
                      <TableCell>
                        <Checkbox checked={selectedIds.has(order._id)} onCheckedChange={() => toggleSelect(order._id)} />
                      </TableCell>
                    )}
                    <TableCell className="font-mono text-sm font-semibold">{order.orderId}</TableCell>
                    <TableCell>
                      <p className="font-medium text-sm">{order.user?.name}</p>
                      <p className="text-xs text-muted-foreground">{order.user?.email}</p>
                    </TableCell>
                    <TableCell className="text-sm">{order.items?.length ?? 0} items</TableCell>
                    <TableCell className="font-semibold text-sm">${order.totalAmount?.toFixed(2)}</TableCell>
                    <TableCell><StatusBadge status={order.status} /></TableCell>
                    <TableCell><PaymentBadge status={order.paymentStatus} /></TableCell>
                    <TableCell className="text-sm text-muted-foreground">{fmtDate(order.createdAt)}</TableCell>
                    <TableCell>{renderActions(order)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}

          {/* Pagination */}
          {total > 0 && (
            <div className="px-5 py-3 border-t flex items-center justify-between">
              <p className="text-xs text-muted-foreground">
                Showing {(page - 1) * perPage + 1}–{Math.min(page * perPage, total)} of {total} orders
              </p>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="text-sm">{page} / {totalPages}</span>
                <Button variant="outline" size="sm" onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ══ MODAL: ORDER DETAILS ═══════════════════════════════════════════ */}
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="sm:max-w-[520px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Order Details</DialogTitle>
            <DialogDescription>View complete order information</DialogDescription>
          </DialogHeader>
          {selectedOrder && (
            <div className="space-y-4 text-sm">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-muted-foreground">Order ID</p>
                  <p className="font-bold font-mono">{selectedOrder.orderId}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Order Date</p>
                  <p className="font-medium">{fmtDate(selectedOrder.createdAt)}</p>
                </div>
              </div>

              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase mb-2">Customer</p>
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="font-semibold">{selectedOrder.user?.name}</p>
                  <p className="text-muted-foreground text-xs">{selectedOrder.user?.email}</p>
                </div>
              </div>

              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase mb-2">Shipping Address</p>
                <div className="bg-gray-50 rounded-lg p-3 space-y-0.5">
                  <p>{selectedOrder.shippingAddress?.street}</p>
                  <p>{selectedOrder.shippingAddress?.city}, {selectedOrder.shippingAddress?.postalCode}</p>
                  <p>{selectedOrder.shippingAddress?.country}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase mb-2">Order Status</p>
                  <StatusBadge status={selectedOrder.status} />
                </div>
                <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase mb-2">Payment Status</p>
                  <PaymentBadge status={selectedOrder.paymentStatus} />
                </div>
              </div>

              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase mb-2">Order Items</p>
                <div className="space-y-2">
                  {selectedOrder.items?.map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between gap-3 border-b pb-2 last:border-0">
                      <div className="flex items-center gap-3">
                        {item.products?.image ? (
                          <img src={item.products.image} alt={item.products.name}
                            className="h-10 w-10 rounded-lg object-cover bg-gray-100" />
                        ) : (
                          <div className="h-10 w-10 rounded-lg bg-gray-100 flex items-center justify-center">
                            <Package className="w-4 h-4 text-gray-400" />
                          </div>
                        )}
                        <div>
                          <p className="font-medium">{item.products?.name}</p>
                          <p className="text-xs text-muted-foreground">Qty: {item.quantity}</p>
                        </div>
                      </div>
                      <p className="font-semibold">${(item.price * item.quantity).toFixed(2)}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-between items-center pt-2 border-t">
                <p className="font-bold">Total Amount:</p>
                <p className="text-xl font-bold text-blue-600">${selectedOrder.totalAmount?.toFixed(2)}</p>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDetailOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ══ MODAL: EDIT ORDER ══════════════════════════════════════════════ */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="sm:max-w-[560px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Order #{selectedOrder?.orderId}</DialogTitle>
            <DialogDescription>Update order details, status, payment, and items information</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 text-sm">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label className="text-xs">Order Status</Label>
                <Select value={editOrderStatus} onValueChange={v => setEditOrderStatus(v as OrderStatus)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {ORDER_STATUS_OPTIONS.map(s => <SelectItem key={s} value={s}>{capitalize(s)}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Payment Status</Label>
                <Select value={editPaymentStatus} onValueChange={v => setEditPaymentStatus(v as PaymentStatus)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {PAYMENT_STATUS_OPTIONS.map(s => <SelectItem key={s} value={s}>{capitalize(s)}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-1">
              <Label className="text-xs">Total Amount ($)</Label>
              <Input value={editTotalAmount} readOnly className="bg-gray-50" />
            </div>

            <div>
              <p className="font-semibold text-xs uppercase text-muted-foreground mb-2">Shipping Address</p>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: "Street", value: editStreet, setter: setEditStreet, span: false },
                  { label: "City", value: editCity, setter: setEditCity, span: false },
                  { label: "Zip Code", value: editZip, setter: setEditZip, span: false },
                  { label: "Country", value: editCountry, setter: setEditCountry, span: true },
                ].map(({ label, value, setter, span }) => (
                  <div key={label} className={`space-y-1 ${span ? "col-span-2" : ""}`}>
                    <Label className="text-xs">{label}</Label>
                    <Input value={value} onChange={e => setter(e.target.value)} />
                  </div>
                ))}
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <p className="font-semibold text-xs uppercase text-muted-foreground">Order Items</p>
                <Button variant="outline" size="sm" onClick={handleAddItem} className="h-7 text-xs">
                  <Plus className="w-3 h-3 mr-1" /> Add Product
                </Button>
              </div>
              <div className="space-y-3">
                {editItems.map((item, idx) => (
                  <div key={idx} className="border rounded-lg p-3 space-y-2">
                    <div className="flex justify-between items-center">
                      <p className="text-xs font-medium text-muted-foreground">Item #{idx + 1}</p>
                      <Button variant="outline" size="sm" className="h-6 text-xs text-red-500 border-red-200"
                        onClick={() => handleRemoveItem(idx)}>
                        — Remove
                      </Button>
                    </div>
                    <div className="grid grid-cols-4 gap-2">
                      <div className="col-span-2 space-y-1">
                        <Label className="text-xs">Product Name</Label>
                        <Input value={item.name} onChange={e => handleEditItemChange(idx, "name", e.target.value)} className="h-8 text-xs" />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs">Unit Price ($)</Label>
                        <Input type="number" value={item.unitPrice} onChange={e => handleEditItemChange(idx, "unitPrice", e.target.value)} className="h-8 text-xs" />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs">Quantity</Label>
                        <Input type="number" value={item.quantity} onChange={e => handleEditItemChange(idx, "quantity", e.target.value)} className="h-8 text-xs" />
                      </div>
                    </div>
                    <div className="flex justify-end">
                      <p className="text-xs text-muted-foreground">
                        Total: <span className="font-semibold text-foreground">${item.totalPrice.toFixed(2)}</span>
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-between items-center pt-2 border-t">
              <p className="font-bold">Total Amount:</p>
              <p className="text-lg font-bold text-blue-600">${editTotalAmount.toFixed(2)}</p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditOpen(false)} disabled={editLoading}>Cancel</Button>
            <Button onClick={handleUpdateOrder} disabled={editLoading} className="bg-gray-800 hover:bg-gray-900">
              {editLoading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Updating...</> : "Update Order"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ══ MODAL: STATUS HISTORY ══════════════════════════════════════════ */}
      <Dialog open={isHistoryOpen} onOpenChange={setIsHistoryOpen}>
        <DialogContent className="sm:max-w-[480px]">
          <DialogHeader>
            <DialogTitle>Order Status History</DialogTitle>
            <DialogDescription>
              Timeline of status changes for order {selectedOrder?.orderId}
            </DialogDescription>
          </DialogHeader>
          {historyLoading ? <Spinner /> : (
            <div className="space-y-3 max-h-[60vh] overflow-y-auto">
              {statusHistory.length === 0 ? (
                <p className="text-sm text-center text-muted-foreground py-8">No history found</p>
              ) : statusHistory.map((h, idx) => (
                <div key={idx} className="flex gap-3">
                  <div className="flex flex-col items-center">
                    <div className="w-3 h-3 rounded-full bg-blue-500 mt-1 shrink-0" />
                    {idx < statusHistory.length - 1 && <div className="w-0.5 bg-gray-200 flex-1 mt-1" />}
                  </div>
                  <div className="flex-1 bg-gray-50 rounded-lg p-3 mb-2">
                    <div className="flex justify-between items-start mb-2">
                      <StatusBadge status={h.status} />
                      <span className="text-xs text-muted-foreground">{fmtDateTime(h.createdAt)}</span>
                    </div>
                    <p className="text-xs"><span className="font-semibold">Changed by:</span> {h.changedBy}</p>
                    {h.notes && <p className="text-xs mt-1"><span className="font-semibold">Notes:</span> {h.notes}</p>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* ══ MODAL: DELETE SINGLE ═══════════════════════════════════════════ */}
      <AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Delete</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete order{" "}
              <span className="font-bold">{selectedOrder?.orderId}</span>? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteLoading}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteOrder} disabled={deleteLoading}
              className="bg-red-500 hover:bg-red-600 text-white">
              {deleteLoading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Deleting...</> : "Delete Order"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* ══ MODAL: BULK DELETE ═════════════════════════════════════════════ */}
      <AlertDialog open={isBulkDeleteOpen} onOpenChange={setIsBulkDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Delete Selected</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete{" "}
              <span className="font-bold">{selectedIds.size} order(s)</span>? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={bulkDeleteLoading}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleBulkDelete} disabled={bulkDeleteLoading}
              className="bg-red-500 hover:bg-red-600 text-white">
              {bulkDeleteLoading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Deleting...</> : "Delete Selected"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default OrdersManagement;