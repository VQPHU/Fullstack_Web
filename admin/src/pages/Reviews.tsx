/* eslint-disable react-hooks/exhaustive-deps */
import { useState, useEffect, useCallback } from "react";
import { useAxiosPrivate } from "@/hooks/useAxiosPrivate";
import useAuthStore from "@/store/useAuthStore";
import { Button } from "@/components/ui/button";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
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
// Import thêm Card của Shadcn để làm container cho đẹp
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { RefreshCw, Loader2, Check, X } from "lucide-react";
import { toast } from "sonner";
import { Review } from "@/lib/type";

// ---- Star Rating (Giữ nguyên logic cũ của bạn) ----
const StarRating = ({ rating }: { rating: number }) => {
    return (
        <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
                <svg
                    key={star}
                    className={`w-4 h-4 ${star <= rating ? "text-yellow-400 fill-yellow-400" : "text-gray-300 fill-gray-300"}`}
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                >
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                </svg>
            ))}
            <span className="text-sm text-muted-foreground ml-1">({rating}/5)</span>
        </div>
    );
};

const Reviews = () => {
    const [activeTab, setActiveTab] = useState<"pending" | "approved">("pending");
    const [pendingReviews, setPendingReviews] = useState<Review[]>([]);
    const [approvedReviews, setApprovedReviews] = useState<Review[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [selectedReview, setSelectedReview] = useState<Review | null>(null);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [actionLoading, setActionLoading] = useState<string | null>(null);

    const axiosPrivate = useAxiosPrivate();
    const { checkIsAdmin } = useAuthStore();
    const isAdmin = checkIsAdmin();

    const fetchReviews = useCallback(async () => {
        try {
            const [pendingRes, approvedRes] = await Promise.all([
                axiosPrivate.get("/products/reviews?status=pending"),
                axiosPrivate.get("/products/reviews?status=approved"),
            ]);
            setPendingReviews(pendingRes.data);
            setApprovedReviews(approvedRes.data);
        } catch (error) {
            console.log("Failed to load reviews", error);
            toast.error("Failed to load reviews");
        } finally {
            setLoading(false);
        }
    }, []);

    const handleRefresh = async () => {
        setRefreshing(true);
        try {
            await fetchReviews();
            toast.success("Refreshed successfully");
        } catch {
            toast.error("Failed to refresh");
        } finally {
            setRefreshing(false);
        }
    };

    useEffect(() => { fetchReviews(); }, []);

    const handleApprove = async (review: Review) => {
        setActionLoading(review._id);
        try {
            await axiosPrivate.put(`/products/reviews/${review.productId}/${review._id}/approve`);
            toast.success("Review approved successfully");
            await fetchReviews();
        } catch (error) {
            toast.error("Failed to approve review");
        } finally {
            setActionLoading(null);
        }
    };

    const handleDeleteConfirm = async () => {
        if (!selectedReview) return;
        try {
            await axiosPrivate.delete(`/products/reviews/${selectedReview.productId}/${selectedReview._id}`);
            toast.success("Review deleted successfully");
            setIsDeleteModalOpen(false);
            await fetchReviews();
        } catch (error) {
            toast.error("Failed to delete review");
        }
    };

    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr);
        return `${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()}`;
    };

    const currentReviews = activeTab === "pending" ? pendingReviews : approvedReviews;

    return (
        <div className="p-5 space-y-6">
            {/* 1. Header & Read-only Banner (Giữ nguyên logic cũ) */}
            {!isAdmin && (
                <div className="flex items-center gap-2 px-4 py-3 bg-yellow-50 border border-yellow-200 rounded-md text-sm text-yellow-800">
                    <span className="w-2 h-2 rounded-full bg-yellow-500 inline-block flex-shrink-0" />
                    Read-Only Mode: CRUD operations are disabled.
                </div>
            )}

            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold">Product Reviews</h1>
                    <p className="text-muted-foreground text-sm mt-1">Manage customer reviews and feedback</p>
                </div>
                <Button variant="outline" onClick={handleRefresh} disabled={refreshing}>
                    <RefreshCw className={`h-4 w-4 mr-1 ${refreshing ? "animate-spin" : ""}`} />
                    Refresh
                </Button>
            </div>

            {/* 2. Tabs Chuyển đổi (Đã làm giống ảnh mẫu) */}
            <div className="flex bg-gray-100/60 p-1 rounded-xl w-full border">
                <button
                    onClick={() => setActiveTab("pending")}
                    className={`flex-1 py-2 text-sm font-semibold transition-all rounded-lg ${
                        activeTab === "pending" ? "bg-white text-black shadow-sm" : "text-gray-500"
                    }`}
                >
                    Pending ({pendingReviews.length})
                </button>
                <button
                    onClick={() => setActiveTab("approved")}
                    className={`flex-1 py-2 text-sm font-semibold transition-all rounded-lg ${
                        activeTab === "approved" ? "bg-white text-black shadow-sm" : "text-gray-500"
                    }`}
                >
                    Approved ({approvedReviews.length})
                </button>
            </div>

            {/* 3. Table sử dụng Card Shadcn bao quanh (Thay thế div border cũ) */}
            <Card className="rounded-xl border-gray-200 shadow-sm overflow-hidden">
                <CardHeader className="bg-gray-50/30 border-b">
                    <CardTitle className="text-lg">
                        {activeTab === "pending" ? "Pending Reviews" : "Approved Reviews"}
                    </CardTitle>
                    <CardDescription>
                        {activeTab === "pending" ? "Review and approve or reject customer feedback" : "Currently visible reviews on the website"}
                    </CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                    {loading ? (
                        <div className="flex justify-center items-center min-h-[300px]"><Loader2 className="h-8 w-8 animate-spin" /></div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow className="hover:bg-transparent">
                                    <TableHead className="w-[30%] px-6">Product</TableHead>
                                    <TableHead>Customer</TableHead>
                                    <TableHead>Rating</TableHead>
                                    <TableHead>Comment</TableHead>
                                    <TableHead>Date</TableHead>
                                    <TableHead className="text-right px-6">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {currentReviews.map((review) => (
                                    <TableRow key={review._id}>
                                        <TableCell className="font-bold px-6">{review.productName}</TableCell>
                                        <TableCell>{review.userId?.name ?? "Unknown"}</TableCell>
                                        <TableCell><StarRating rating={review.rating} /></TableCell>
                                        <TableCell className="max-w-[200px] truncate">{review.comment || "—"}</TableCell>
                                        <TableCell>{formatDate(review.createdAt)}</TableCell>
                                        <TableCell className="text-right px-6">
                                            <div className="flex items-center justify-end gap-2">
                                                {isAdmin && activeTab === "pending" && (
                                                    <Button
                                                        size="icon"
                                                        className="h-8 w-8 bg-green-500 hover:bg-green-600 text-white"
                                                        onClick={() => handleApprove(review)}
                                                        disabled={actionLoading === review._id}
                                                    >
                                                        {actionLoading === review._id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                                                    </Button>
                                                )}
                                                <Button
                                                    size="icon"
                                                    variant={isAdmin ? "destructive" : "ghost"}
                                                    className={`h-8 w-8 ${isAdmin ? "bg-red-500 hover:bg-red-600" : ""}`}
                                                    onClick={() => { setSelectedReview(review); setIsDeleteModalOpen(true); }}
                                                    disabled={!isAdmin}
                                                >
                                                    {isAdmin ? <X className="h-4 w-4" /> : <span className="text-xs">View</span>}
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>

            {/* 4. Delete Confirmation (Giữ nguyên AlertDialog cũ của bạn) */}
            <AlertDialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
                <AlertDialogContent className="rounded-xl">
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Permanently delete review by <span className="font-bold">{selectedReview?.userId?.name}</span>.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel className="rounded-lg">Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDeleteConfirm} className="bg-red-500 hover:bg-red-600 rounded-lg">Delete</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
};

export default Reviews;