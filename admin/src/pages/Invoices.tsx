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
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useAxiosPrivate } from "@/hooks/useAxiosPrivate";
import {
  Copy,
  Download,
  Eye,
  Facebook,
  FileText,
  Linkedin,
  Loader2,
  Package,
  Printer,
  Search,
  Share2,
  Twitter,
} from "lucide-react";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { OrderItem, Order } from "../lib/type";

// ─── Helpers ──────────────────────────────────────────────────────────────────

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(amount);

const formatDate = (dateStr: string) =>
  new Date(dateStr).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });


const getInvoiceNumber = (order: Order) =>
  `INV-${new Date(order.createdAt).getFullYear()}${String(new Date(order.createdAt).getMonth() + 1).padStart(2, "0")}${new Date(order.createdAt).getDate()}-${order._id.slice(-6).toUpperCase()}`;

// ─── PaymentBadge ─────────────────────────────────────────────────────────────

const PaymentBadge = ({ status }: { status: string }) => {
  const map: Record<string, { label: string; className: string }> = {
    paid: { label: "Paid", className: "bg-emerald-100 text-emerald-700 border-emerald-200" },
    pending: { label: "Pending", className: "bg-amber-100 text-amber-700 border-amber-200" },
    failed: { label: "Failed", className: "bg-red-100 text-red-700 border-red-200" },
  };
  const cfg = map[status] ?? map["pending"];
  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${cfg.className}`}>
      {cfg.label}
    </span>
  );
};

// ─── StatusBadge ──────────────────────────────────────────────────────────────

const StatusBadge = ({ status }: { status: string }) => (
  <span className="inline-flex items-center rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium text-muted-foreground border">
    {status}
  </span>
);

// ─── Invoice Document (printable) ─────────────────────────────────────────────

const InvoiceDocument = React.forwardRef<HTMLDivElement, { order: Order }>(({ order }, ref) => {
  const invoiceNumber = getInvoiceNumber(order);
  // items từ getAllOrdersAdmin có structure: { products: { name, price, image }, quantity, price }
  // items từ getOrderById có structure: { name, price, quantity, image } trực tiếp
  const getItemName = (item: OrderItem) => item.products?.name ?? (item as any).name ?? "—";
  const subtotal = order.items.reduce((s, i) => s + i.price * i.quantity, 0);

  const paymentMethodLabel: Record<string, string> = {
    card: "Credit / Debit Card",
    cod: "Cash on Delivery",
  };

  const { street, city, country, zipCode } = order.shippingAddress ?? {};

  return (
    <div ref={ref} className="bg-white text-gray-900 p-8 w-full max-w-full font-sans">
      {/* Header */}
      <div className="flex justify-between items-start mb-8">
        <div>
          <h1 className="text-2xl font-bold text-blue-600">BabyShop</h1>
        </div>
        <div className="text-right">
          <h2 className="text-3xl font-bold text-gray-800 tracking-widest">INVOICE</h2>
          <p className="text-sm text-gray-500 mt-2">Invoice #: {invoiceNumber}</p>
          <p className="text-sm text-gray-500">Date: {formatDate(order.createdAt)}</p>
          {order.paidAt && (
            <p className="text-sm text-gray-500">Paid At: {formatDate(order.paidAt)}</p>
          )}
        </div>
      </div>

      <hr className="border-gray-200 mb-6" />

      {/* Bill To / Order Details */}
      <div className="grid grid-cols-2 gap-8 mb-8">
        {/* Bill To — chỉ show nếu có data */}
        <div>
          <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">Bill To:</h3>
          {order.user?.name && <p className="font-semibold text-gray-800">{order.user.name}</p>}
          {order.user?.email && <p className="text-sm text-gray-500">{order.user.email}</p>}
          {(street || city || country) && (
            <div className="mt-1 text-sm text-gray-500">
              {street && <p>{street}</p>}
              <p>
                {[city, zipCode].filter(Boolean).join(", ")}
              </p>
              {country && <p>{country}</p>}
            </div>
          )}
        </div>

        {/* Order Details */}
        <div>
          <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">Order Details:</h3>
          <div className="space-y-1 text-sm text-gray-700">
            <p><span className="font-medium">Order ID:</span> {order.orderId ?? order._id}</p>
            <p><span className="font-medium">Order Date:</span> {formatDate(order.createdAt)}</p>
            {order.paymentMethod && (
              <p>
                <span className="font-medium">Payment Method:</span>{" "}
                {paymentMethodLabel[order.paymentMethod] ?? order.paymentMethod}
              </p>
            )}
            <div className="flex items-center gap-2">
              <span className="font-medium">Payment Status:</span>
              <PaymentBadge status={order.paymentStatus} />
            </div>
          </div>
        </div>
      </div>

      {/* Items Table */}
      <table className="w-full text-sm mb-6 border-collapse">
        <thead>
          <tr className="bg-gray-50">
            <th className="text-left py-3 px-4 font-semibold text-gray-600 border border-gray-200">Item Description</th>
            <th className="text-center py-3 px-4 font-semibold text-gray-600 border border-gray-200">Quantity</th>
            <th className="text-right py-3 px-4 font-semibold text-gray-600 border border-gray-200">Unit Price</th>
            <th className="text-right py-3 px-4 font-semibold text-gray-600 border border-gray-200">Total</th>
          </tr>
        </thead>
        <tbody>
          {order.items.map((item, idx) => (
            <tr key={idx} className="border-b border-gray-100">
              <td className="py-3 px-4 border border-gray-200 text-gray-700">{getItemName(item)}</td>
              <td className="py-3 px-4 border border-gray-200 text-center">{item.quantity}</td>
              <td className="py-3 px-4 border border-gray-200 text-right">{formatCurrency(item.price)}</td>
              <td className="py-3 px-4 border border-gray-200 text-right font-medium">
                {formatCurrency(item.price * item.quantity)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Totals */}
      <div className="flex justify-end mb-8">
        <div className="w-64 space-y-2">
          <div className="flex justify-between text-sm text-gray-600">
            <span>Subtotal:</span>
            <span>{formatCurrency(subtotal)}</span>
          </div>
          <hr className="border-gray-200" />
          <div className="flex justify-between font-bold text-gray-800 text-base">
            <span>Total:</span>
            <span>{formatCurrency(order.totalAmount)}</span>
          </div>
        </div>
      </div>

      {/* Notes & Terms — hardcoded, không liên quan data */}
      <div className="space-y-4 mb-8">
        <div className="bg-gray-50 rounded-lg p-4">
          <h3 className="text-sm font-semibold text-gray-700 mb-1">Notes:</h3>
          <p className="text-sm text-gray-500">Thank you for your business!</p>
        </div>
        <div className="bg-gray-50 rounded-lg p-4">
          <h3 className="text-sm font-semibold text-gray-700 mb-1">Terms &amp; Conditions:</h3>
          <p className="text-sm text-gray-500">Payment due within 30 days.</p>
        </div>
      </div>

      {/* Footer */}
      <hr className="border-gray-200 mb-4" />
      <div className="text-center text-sm text-gray-400">
        <p>Thank you for your business!</p>
        <p>BabyShop – Your trusted partner for baby products</p>
      </div>
    </div>
  );
});
InvoiceDocument.displayName = "InvoiceDocument";

// ─── Share Modal ──────────────────────────────────────────────────────────────

const ShareModal = ({
  open,
  onClose,
  order,
}: {
  open: boolean;
  onClose: () => void;
  order: Order | null;
}) => {
  if (!order) return null;

  const invoiceUrl = `${window.location.origin}/invoice/${order._id}`;
  const shareText = `Invoice ${getInvoiceNumber(order)} from BabyShop - ${formatCurrency(order.totalAmount)}`;

  const shareOptions = [
    {
      label: "WhatsApp",
      icon: "💬",
      action: () => window.open(`https://wa.me/?text=${encodeURIComponent(`${shareText}\n${invoiceUrl}`)}`),
    },
    {
      label: "Telegram",
      icon: "✈️",
      action: () => window.open(`https://t.me/share/url?url=${encodeURIComponent(invoiceUrl)}&text=${encodeURIComponent(shareText)}`),
    },
    {
      label: "Twitter",
      icon: <Twitter className="h-4 w-4" />,
      action: () => window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(invoiceUrl)}`),
    },
    {
      label: "Facebook",
      icon: <Facebook className="h-4 w-4" />,
      action: () => window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(invoiceUrl)}`),
    },
    {
      label: "LinkedIn",
      icon: <Linkedin className="h-4 w-4" />,
      action: () => window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(invoiceUrl)}`),
    },
    {
      label: "Copy Link",
      icon: <Copy className="h-4 w-4" />,
      action: () => {
        navigator.clipboard.writeText(invoiceUrl);
        toast.success("Link copied to clipboard!");
      },
    },
  ];

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Share Invoice</DialogTitle>
          <p className="text-sm text-muted-foreground">Share this invoice via social media or copy the link</p>
        </DialogHeader>
        <div className="grid grid-cols-2 gap-3 py-2">
          {shareOptions.map((opt) => (
            <Button
              key={opt.label}
              variant="outline"
              className="flex items-center gap-2 h-11 justify-start px-4"
              onClick={() => { opt.action(); }}
            >
              <span className="flex items-center justify-center w-5 h-5 text-base">
                {opt.icon}
              </span>
              <span className="text-sm font-medium">{opt.label}</span>
            </Button>
          ))}
        </div>
        <div className="flex justify-end pt-1">
          <Button variant="outline" onClick={onClose}>Close</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

// ─── Invoice Preview Modal ────────────────────────────────────────────────────

const InvoicePreviewModal = ({
  open,
  onClose,
  order,
  onShare,
}: {
  open: boolean;
  onClose: () => void;
  order: Order | null;
  onShare: () => void;
}) => {
  const printRef = useRef<HTMLDivElement>(null);

  const handlePrint = () => {
    if (!printRef.current) return;
    const content = printRef.current.innerHTML;
    const win = window.open("", "_blank");
    if (!win) return;
    win.document.write(`
      <html>
        <head>
          <title>Invoice</title>
          <style>
            body { margin: 0; font-family: sans-serif; }
            @media print { body { -webkit-print-color-adjust: exact; } }
          </style>
        </head>
        <body>${content}</body>
      </html>
    `);
    win.document.close();
    win.focus();
    win.print();
    win.close();
  };

  const handleDownloadPDF = () => {
    handlePrint();
    toast.info("Use your browser's 'Save as PDF' option when printing.");
  };

  if (!order) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent showCloseButton={false} className="max-w-[95vw] lg:max-w-[700px] max-h-[95vh] overflow-hidden p-0">
        {/* Sticky toolbar */}
        <div className="sticky top-0 z-10 bg-background border-b px-6 py-3 flex items-center justify-between">
          <DialogTitle className="text-base font-semibold">Invoice Preview</DialogTitle>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handlePrint}>
              <Printer className="h-4 w-4 mr-1.5" />
              Print
            </Button>
            <Button variant="outline" size="sm" onClick={handleDownloadPDF}>
              <Download className="h-4 w-4 mr-1.5" />
              Download PDF
            </Button>
            <Button size="sm" className="bg-foreground text-background hover:bg-foreground/90" onClick={onShare}>
              <Share2 className="h-4 w-4 mr-1.5" />
              Share Invoice
            </Button>
            <DialogClose asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <span className="sr-only">Close</span>
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </Button>
            </DialogClose>
          </div>
        </div>

        {/* Invoice content */}
        <div className="overflow-y-auto p-6 max-h-[calc(95vh-80px)]">
          <InvoiceDocument ref={printRef} order={order} />
        </div>
      </DialogContent>
    </Dialog>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────

const Invoices = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const perPage = 10;
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // Generated invoices tracking
  const [generatedInvoices, setGeneratedInvoices] = useState<Set<string>>(new Set());

  // Modals
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [generatingId, setGeneratingId] = useState<string | null>(null);

  const axiosPrivate = useAxiosPrivate();

  // ── Fetch ────────────────────────────────────────────────────────────────────

  const fetchOrders = useCallback(async (resetPage = false) => {
    setLoading(true);
    try {
      const currentPage = resetPage ? 1 : page;
      const params: Record<string, string | number> = {
        page: currentPage,
        perPage,
        sortOrder: "desc",
      };
      if (statusFilter !== "all") params.paymentStatus = statusFilter;

      const { data } = await axiosPrivate.get("/orders/admin", { params });

      let fetched: Order[] = data.orders ?? [];

      // Client-side search filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        fetched = fetched.filter(
          (o) =>
            o.orderId.toLowerCase().includes(q) ||
            o.user.name.toLowerCase().includes(q) ||
            o.user.email.toLowerCase().includes(q) ||
            o._id.toLowerCase().includes(q)
        );
      }

      setOrders(fetched);
      setTotal(data.total ?? 0);
      setTotalPages(data.totalPages ?? 1);
      if (resetPage) setPage(1);
    } catch {
      toast.error("Failed to load orders");
    } finally {
      setLoading(false);
    }
  }, [page, statusFilter, searchQuery, axiosPrivate]);

  useEffect(() => {
    fetchOrders();
  }, [page, statusFilter]);

  // Search with debounce
  useEffect(() => {
    const t = setTimeout(() => fetchOrders(true), 400);
    return () => clearTimeout(t);
  }, [searchQuery]);

  // ── Handlers ─────────────────────────────────────────────────────────────────

  const handleGenerate = async (order: Order) => {
    setGeneratingId(order._id);
    // Simulate short generation delay for UX feedback
    await new Promise((r) => setTimeout(r, 600));
    setGeneratedInvoices((prev) => new Set(prev).add(order._id));
    setSelectedOrder(order);
    setIsPreviewOpen(true);
    setGeneratingId(null);
    toast.success(`Invoice ${getInvoiceNumber(order)} generated!`);
  };

  const handleViewInvoice = (order: Order) => {
    setSelectedOrder(order);
    setIsPreviewOpen(true);
  };

  const handleDeleteClick = (order: Order) => {
    setSelectedOrder(order);
    setIsDeleteOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedOrder) return;
    try {
      await axiosPrivate.delete(`/orders/${selectedOrder._id}`);
      toast.success("Order deleted successfully");
      setIsDeleteOpen(false);
      fetchOrders(true);
    } catch {
      toast.error("Failed to delete order");
    }
  };

  const handleShareFromPreview = () => {
    setIsPreviewOpen(false);
    setIsShareOpen(true);
  };

  // ── Render ───────────────────────────────────────────────────────────────────

  return (
    <div className="p-5 space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold">Invoice Generator</h1>
        <p className="text-muted-foreground text-sm mt-1">Generate and manage invoices for your orders</p>
      </div>

      {/* Search & Filter */}
      <div className="rounded-xl border border-border/50 bg-card shadow-sm p-5 space-y-4">
        <div className="flex items-center gap-2 text-sm font-semibold">
          <Search className="h-4 w-4 text-muted-foreground" />
          Search Orders
        </div>
        <div className="flex gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by Order ID, Customer Name, or Email..."
              className="pl-9"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setPage(1); }}>
            <SelectTrigger className="w-44">
              <SelectValue placeholder="All Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="paid">Paid</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="failed">Failed</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Orders Table */}
      <div className="rounded-xl border border-border/50 bg-card shadow-sm overflow-hidden">
        <div className="flex items-center gap-2 px-5 py-4 border-b border-border/50">
          <Package className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-semibold">
            Orders ({loading ? "..." : total})
          </span>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20 gap-3 text-muted-foreground">
            <Loader2 className="h-5 w-5 animate-spin" />
            <span className="text-sm">Loading orders...</span>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50 border-b border-border/50">
                  <TableHead className="font-semibold">Order ID</TableHead>
                  <TableHead className="font-semibold">Customer</TableHead>
                  <TableHead className="font-semibold">Date</TableHead>
                  <TableHead className="font-semibold">Total</TableHead>
                  <TableHead className="font-semibold">Payment</TableHead>
                  <TableHead className="font-semibold">Status</TableHead>
                  <TableHead className="font-semibold text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orders.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-16 text-muted-foreground">
                      <div className="flex flex-col items-center gap-2">
                        <FileText className="h-10 w-10 text-muted-foreground/40" />
                        <p className="text-sm font-medium">No orders found matching your criteria</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  orders.map((order, idx) => {
                    const isGenerated = generatedInvoices.has(order._id);
                    const isGenerating = generatingId === order._id;

                    return (
                      <TableRow
                        key={order._id}
                        className={`border-b border-border/30 transition-colors hover:bg-muted/50 ${idx % 2 === 0 ? "bg-background" : "bg-muted/20"}`}
                      >
                        <TableCell className="font-mono text-sm font-medium">
                          {order.orderId}
                        </TableCell>

                        <TableCell>
                          <div>
                            <p className="font-semibold text-sm">{order.user.name}</p>
                            <p className="text-xs text-muted-foreground">{order.user.email}</p>
                          </div>
                        </TableCell>

                        <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
                          {new Date(order.createdAt).toLocaleDateString("en-US")}
                        </TableCell>

                        <TableCell className="font-semibold text-sm whitespace-nowrap">
                          {formatCurrency(order.totalAmount)}
                        </TableCell>

                        <TableCell>
                          <PaymentBadge status={order.paymentStatus} />
                        </TableCell>

                        <TableCell>
                          <StatusBadge status={order.status} />
                        </TableCell>

                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            {isGenerated ? (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleViewInvoice(order)}
                                className="h-8 gap-1.5 text-xs"
                              >
                                <Eye className="h-3.5 w-3.5" />
                                View Invoice
                              </Button>
                            ) : (
                              <Button
                                size="sm"
                                onClick={() => handleGenerate(order)}
                                disabled={isGenerating}
                                className="h-8 gap-1.5 text-xs bg-foreground text-background hover:bg-foreground/90"
                              >
                                {isGenerating ? (
                                  <>
                                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                    Generating...
                                  </>
                                ) : (
                                  <>
                                    <FileText className="h-3.5 w-3.5" />
                                    Generate
                                  </>
                                )}
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        )}

        {/* Pagination */}
        {!loading && total > perPage && (
          <div className="flex items-center justify-between px-5 py-3 border-t border-border/50 bg-muted/20">
            <div className="text-sm text-muted-foreground">
              Showing <span className="font-medium">{(page - 1) * perPage + 1}</span> to{" "}
              <span className="font-medium">{Math.min(page * perPage, total)}</span> of{" "}
              <span className="font-medium">{total}</span> orders
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}>
                Previous
              </Button>
              <span className="text-sm text-muted-foreground px-1">
                {page} / {totalPages}
              </span>
              <Button variant="outline" size="sm" onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page >= totalPages}>
                Next
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Quick Actions (only shown when there are generated invoices) */}
      {generatedInvoices.size > 0 && selectedOrder && (
        <div className="rounded-xl border border-border/50 bg-card shadow-sm p-5 space-y-3">
          <p className="text-sm font-semibold">Quick Actions</p>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="sm" onClick={() => { setIsPreviewOpen(true); }}>
              <Eye className="h-4 w-4 mr-1.5" />
              Preview Invoice
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setIsPreviewOpen(true);
                // trigger print after modal opens
              }}
            >
              <Printer className="h-4 w-4 mr-1.5" />
              Print Invoice
            </Button>
            <Button variant="outline" size="sm" onClick={() => setIsPreviewOpen(true)}>
              <Download className="h-4 w-4 mr-1.5" />
              Download PDF
            </Button>
            <Button
              size="sm"
              className="bg-foreground text-background hover:bg-foreground/90"
              onClick={() => setIsShareOpen(true)}
            >
              <Share2 className="h-4 w-4 mr-1.5" />
              Share Invoice
            </Button>
          </div>
        </div>
      )}

      {/* Preview Modal */}
      <InvoicePreviewModal
        open={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
        order={selectedOrder}
        onShare={handleShareFromPreview}
      />

      {/* Share Modal */}
      <ShareModal
        open={isShareOpen}
        onClose={() => setIsShareOpen(false)}
        order={selectedOrder}
      />

      {/* Delete Confirmation */}
      <AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this order?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. Order{" "}
              <span className="font-semibold">{selectedOrder?.orderId}</span> will be permanently deleted.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm} className="bg-destructive hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Invoices;