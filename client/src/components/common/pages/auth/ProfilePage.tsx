"use client";

import { useEffect, useMemo, useRef, useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Loader2,
    Edit2,
    Trash2,
    Plus,
    ShieldCheck,
    MapPin,
    ShoppingCart,
    Package,
    LogOut,
    User,
    Eye,
    EyeOff,
    Upload,
    X,
    CheckCircle2,
} from "lucide-react";
import authApi from "@/lib/authApi";
import { useCartStore, useOrderStore, useUserStore } from "@/lib/store";
import PriceFormatter from "@/components/common/PriceFormatter";
import SubNavbar from "@/components/header/SubNavbar";

// ─── Types ───────────────────────────────────────────────────────────────────
interface Address {
    _id: string;
    street: string;
    city: string;
    state?: string;
    country: string;
    postalCode: string;
    isDefault: boolean;
}

interface AddressForm {
    country: string;
    state: string;
    city: string;
    street: string;
    postalCode: string;
    isDefault: boolean;
}

const EMPTY_ADDRESS_FORM: AddressForm = {
    country: "",
    state: "",
    city: "",
    street: "",
    postalCode: "",
    isDefault: false,
};

// ─── Helpers ─────────────────────────────────────────────────────────────────
const initials = (name?: string) =>
    name
        ? name
            .split(" ")
            .map((w) => w[0])
            .join("")
            .toUpperCase()
            .slice(0, 2)
        : "U";

// ─── Sub-components ──────────────────────────────────────────────────────────

/** Drawer slide-in từ phải */
function AddressDrawer({
    open,
    onClose,
    onSave,
    initial,
    loading,
}: {
    open: boolean;
    onClose: () => void;
    onSave: (form: AddressForm) => Promise<void>;
    initial?: AddressForm;
    loading: boolean;
}) {
    const [form, setForm] = useState<AddressForm>(initial ?? EMPTY_ADDRESS_FORM);

    useEffect(() => {
        setForm(initial ?? EMPTY_ADDRESS_FORM);
    }, [initial, open]);

    const set = (k: keyof AddressForm, v: string | boolean) =>
        setForm((f) => ({ ...f, [k]: v }));

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        if (!form.country.trim()) return toast.error("Country is required");
        if (!form.city.trim()) return toast.error("City is required");
        if (!form.street.trim()) return toast.error("Street address is required");
        if (!form.postalCode.trim()) return toast.error("Postal code is required");
        await onSave(form);
    };

    return (
        <>
            {/* Overlay */}
            <div
                className={`fixed inset-0 bg-black/40 z-40 transition-opacity duration-300 ${open ? "opacity-100" : "opacity-0 pointer-events-none"
                    }`}
                onClick={onClose}
            />

            {/* Drawer */}
            <div
                className={`fixed top-0 right-0 h-full w-full max-w-md bg-white z-50 shadow-2xl flex flex-col transition-transform duration-300 ease-in-out ${open ? "translate-x-0" : "translate-x-full"
                    }`}
            >
                {/* Header */}
                <div className="flex items-center justify-between p-5 border-b">
                    <div className="flex items-center gap-2 text-teal-600">
                        <MapPin className="w-5 h-5" />
                        <h2 className="font-semibold text-gray-800 text-lg">
                            {initial?.street ? "Edit Address" : "Add New Address"}
                        </h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-1.5 rounded-full hover:bg-gray-100 transition"
                    >
                        <X className="w-5 h-5 text-gray-500" />
                    </button>
                </div>

                <p className="text-sm text-gray-500 px-5 pt-3">
                    Fill in your delivery address details
                </p>

                {/* Form */}
                <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 space-y-4">
                    {/* Country */}
                    <div className="space-y-1">
                        <Label>
                            Country <span className="text-red-500">*</span>
                        </Label>
                        <select
                            value={form.country}
                            onChange={(e) => set("country", e.target.value)}
                            className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-400 bg-white"
                        >
                            <option value="">Select country...</option>
                            {[
                                "Vietnam",
                                "United States",
                                "United Kingdom",
                                "Japan",
                                "South Korea",
                                "Singapore",
                                "Australia",
                                "Canada",
                                "Germany",
                                "France",
                                "Thailand",
                                "Malaysia",
                                "Indonesia",
                                "Philippines",
                                "Other",
                            ].map((c) => (
                                <option key={c} value={c}>
                                    {c}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* State */}
                    <div className="space-y-1">
                        <Label>State / Province (Optional)</Label>
                        <Input
                            value={form.state}
                            onChange={(e) => set("state", e.target.value)}
                            placeholder="e.g., California, Dhaka, Maharashtra"
                            className="focus:ring-teal-400"
                        />
                    </div>

                    {/* City */}
                    <div className="space-y-1">
                        <Label>
                            City <span className="text-red-500">*</span>
                        </Label>
                        <Input
                            value={form.city}
                            onChange={(e) => set("city", e.target.value)}
                            placeholder="e.g., Los Angeles, Dhaka, Mumbai"
                            className="focus:ring-teal-400"
                        />
                    </div>

                    {/* Street */}
                    <div className="space-y-1">
                        <Label>
                            Street Address <span className="text-red-500">*</span>
                        </Label>
                        <Input
                            value={form.street}
                            onChange={(e) => set("street", e.target.value)}
                            placeholder="e.g., 123 Main Street, Apt 4B"
                            className="focus:ring-teal-400"
                        />
                    </div>

                    {/* Postal */}
                    <div className="space-y-1">
                        <Label>
                            Postal Code <span className="text-red-500">*</span>
                        </Label>
                        <Input
                            value={form.postalCode}
                            onChange={(e) => set("postalCode", e.target.value)}
                            placeholder="e.g., 10001, SW1A 1AA"
                            className="focus:ring-teal-400"
                        />
                    </div>

                    {/* Default checkbox */}
                    <label className="flex items-start gap-3 bg-gray-50 border border-gray-200 rounded-lg p-3 cursor-pointer hover:bg-gray-100 transition">
                        <input
                            type="checkbox"
                            checked={form.isDefault}
                            onChange={(e) => set("isDefault", e.target.checked)}
                            className="mt-0.5 accent-teal-500"
                        />
                        <div>
                            <p className="text-sm font-medium text-gray-700">Set as default address</p>
                            <p className="text-xs text-gray-500">
                                Use this address as your primary delivery location
                            </p>
                        </div>
                    </label>

                    {/* Buttons */}
                    <div className="pt-2 space-y-2">
                        <Button
                            type="button"
                            variant="outline"
                            className="w-full"
                            onClick={onClose}
                            disabled={loading}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-teal-500 hover:bg-teal-600 text-white"
                        >
                            {loading ? (
                                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                            ) : null}
                            Save Address
                        </Button>
                    </div>
                </form>
            </div>
        </>
    );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
const ProfilePage = () => {
    const router = useRouter();
    const { authUser, auth_token, updateUser, logoutUser } = useUserStore();
    const { cartItemsWithQuantities } = useCartStore();
    const { orders, loadOrders, isLoading: ordersLoading } = useOrderStore();

    const safeOrders = Array.isArray(orders) ? orders : [];

    // ── Profile state ──
    const [name, setName] = useState("");
    const [avatarUrl, setAvatarUrl] = useState("");
    const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
    const [avatarFile, setAvatarFile] = useState<File | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // ── Password state ──
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showNew, setShowNew] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);

    // ── Loading ──
    const [profileSubmitting, setProfileSubmitting] = useState(false);
    const [passwordSubmitting, setPasswordSubmitting] = useState(false);
    const [addressLoading, setAddressLoading] = useState(false);

    // ── Address drawer ──
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [editingAddress, setEditingAddress] = useState<(AddressForm & { _id?: string }) | undefined>(undefined);

    // ── Init ──
    useEffect(() => {
        if (!authUser || !auth_token) {
            router.push("/auth/signin");
            return;
        }
        setName(authUser.name || "");
        setAvatarUrl(authUser.avatar || "");
        loadOrders(auth_token);
    }, [authUser, auth_token]);

    const cartTotal = useMemo(
        () =>
            cartItemsWithQuantities.reduce(
                (acc, item) => acc + item.product.price * item.quantity,
                0
            ),
        [cartItemsWithQuantities]
    );

    // ── Handlers ──
    const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const validTypes = ["image/jpeg", "image/png", "image/gif"];
        if (!validTypes.includes(file.type)) {
            toast.error("Only JPG, PNG or GIF files are allowed");
            return;
        }
        if (file.size > 5 * 1024 * 1024) {
            toast.error("File size must be less than 5MB");
            return;
        }

        setAvatarFile(file);
        const reader = new FileReader();
        reader.onload = () => setAvatarPreview(reader.result as string);
        reader.readAsDataURL(file);
    };

    const handleProfileUpdate = async (e: FormEvent) => {
        e.preventDefault();
        if (!authUser) return toast.error("User not found");
        if (!name.trim()) return toast.error("Name is required");

        setProfileSubmitting(true);
        try {
            let uploadedAvatarUrl = avatarUrl;

            // Nếu có file mới, upload lên server trước (giả sử có endpoint upload)
            if (avatarFile) {
                const formData = new FormData();
                formData.append("file", avatarFile);
                try {
                    const token = auth_token;
                    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/upload`, {
                        method: "POST",
                        headers: {
                            ...(token && { Authorization: `Bearer ${token}` }),
                        },
                        credentials: "include",
                        body: formData,
                    });
                    if (response.ok) {
                        const uploadRes = await response.json();
                        if (uploadRes?.success && uploadRes?.data?.url) {
                            uploadedAvatarUrl = uploadRes.data.url;
                        }
                    }
                } catch {
                    // fallback: dùng base64 preview nếu không có upload endpoint
                    uploadedAvatarUrl = avatarPreview || avatarUrl;
                }
            }

            const res = await authApi.put(`/users/${authUser._id}`, {
                name: name.trim(),
                avatar: uploadedAvatarUrl,
            });

            if (res.success && res.data) {
                updateUser(res.data);
                setAvatarFile(null);
                setAvatarPreview(null);
                toast.success("Profile updated successfully");
            } else {
                toast.error(res.error?.message || "Update failed");
            }
        } catch {
            toast.error("Update failed");
        } finally {
            setProfileSubmitting(false);
        }
    };

    const handlePasswordUpdate = async (e: FormEvent) => {
        e.preventDefault();
        if (!authUser) return toast.error("User not found");
        if (!newPassword || !confirmPassword)
            return toast.error("Please fill all password fields");
        if (newPassword !== confirmPassword)
            return toast.error("Passwords do not match");
        if (newPassword.length < 6)
            return toast.error("Password must be at least 6 characters");

        setPasswordSubmitting(true);
        try {
            const res = await authApi.put(`/users/${authUser._id}`, {
                password: newPassword,
            });

            if (res.success) {
                toast.success("Password updated successfully");
                setNewPassword("");
                setConfirmPassword("");
            } else {
                toast.error(res.error?.message || "Update failed");
            }
        } catch {
            toast.error("Update failed");
        } finally {
            setPasswordSubmitting(false);
        }
    };

    const handleLogout = async () => {
        await authApi.post("/auth/logout", {});
        logoutUser();
        router.push("/");
    };

    // ── Address CRUD ──
    const openAddDrawer = () => {
        setEditingAddress(undefined);
        setDrawerOpen(true);
    };

    const openEditDrawer = (addr: Address) => {
        setEditingAddress({
            _id: addr._id,
            country: addr.country,
            state: addr.state || "",
            city: addr.city,
            street: addr.street,
            postalCode: addr.postalCode,
            isDefault: addr.isDefault,
        });
        setDrawerOpen(true);
    };

    const handleSaveAddress = async (form: AddressForm) => {
        if (!authUser) return;
        setAddressLoading(true);
        try {
            let res;
            if (editingAddress?._id) {
                // Update
                res = await authApi.put(
                    `/users/${authUser._id}/addresses/${editingAddress._id}`,
                    form
                );
            } else {
                // Create
                res = await authApi.post(`/users/${authUser._id}/addresses`, form);
            }

            if (res.success) {
                updateUser({ ...authUser, addresses: res.data.addresses });
                toast.success(editingAddress?._id ? "Address updated" : "Address added");
                setDrawerOpen(false);
            } else {
                toast.error(res.error?.message || "Failed to save address");
            }
        } catch {
            toast.error("Failed to save address");
        } finally {
            setAddressLoading(false);
        }
    };

    const handleDeleteAddress = async (addr: Address) => {
        if (!authUser) return;
        if (!confirm("Are you sure you want to delete this address?")) return;

        setAddressLoading(true);
        try {
            const res = await authApi.delete(
                `/users/${authUser._id}/addresses/${addr._id}`
            );

            if (res.success) {
                updateUser({ ...authUser, addresses: res.data.addresses });
                toast.success("Address deleted");
            } else {
                toast.error(res.error?.message || "Delete failed");
            }
        } catch {
            toast.error("Delete failed");
        } finally {
            setAddressLoading(false);
        }
    };

    const handleSetDefault = async (addr: Address) => {
        if (!authUser || addr.isDefault) return;
        setAddressLoading(true);
        try {
            const res = await authApi.put(
                `/users/${authUser._id}/addresses/${addr._id}/default`,
                {}
            );

            if (res.success) {
                updateUser({ ...authUser, addresses: res.data.addresses });
                toast.success("Default address updated");
            } else {
                toast.error(res.error?.message || "Failed");
            }
        } catch {
            toast.error("Failed to set default");
        } finally {
            setAddressLoading(false);
        }
    };

    // ── isOAuth check ──
    const isOAuth = false; // TODO: implement OAuth check if needed

    const currentAvatar = avatarPreview || authUser?.avatar || "";

    // ─────────────────────────────────────────────────────────────────────────
    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-6xl mx-auto p-4 md:p-6 space-y-6">
                <SubNavbar />
                {/* ══ HEADER ══════════════════════════════════════════════════════════ */}
                <div className="rounded-2xl overflow-hidden bg-linear-to-r from-teal-500 to-purple-500 p-6 text-white">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        {/* Avatar + Info */}
                        <div className="flex items-center gap-4">
                            <div className="relative w-16 h-16 rounded-full overflow-hidden bg-black/30 flex items-center justify-center text-2xl font-bold ring-2 ring-white/30 shrink-0">
                                {currentAvatar ? (
                                    <img
                                        src={currentAvatar}
                                        alt={authUser?.name}
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <span>{initials(authUser?.name)}</span>
                                )}
                                {/* Online dot */}
                                <span className="absolute bottom-0 right-0 w-4 h-4 bg-green-400 rounded-full border-2 border-white" />
                            </div>

                            <div>
                                <h2 className="text-xl font-bold">{authUser?.name}</h2>
                                <p className="text-sm text-white/80 flex items-center gap-1">
                                    <span>✉</span> {authUser?.email}
                                </p>
                                <span className="inline-flex items-center gap-1 mt-1 text-xs bg-white/20 backdrop-blur px-2 py-0.5 rounded-full">
                                    <User className="w-3 h-3" />
                                    {authUser?.role || "user"}
                                </span>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-2">
                            <Button
                                variant="secondary"
                                size="sm"
                                className="bg-white/20 hover:bg-white/30 text-white border border-white/30 backdrop-blur"
                                onClick={() => {
                                    /* scroll to update profile section */
                                    document.getElementById("update-profile")?.scrollIntoView({ behavior: "smooth" });
                                }}
                            >
                                <User className="w-4 h-4 mr-1.5" />
                                Edit Profile
                            </Button>
                            <Button
                                variant="secondary"
                                size="sm"
                                className="bg-white/20 hover:bg-white/30 text-white border border-white/30 backdrop-blur"
                                onClick={handleLogout}
                            >
                                <LogOut className="w-4 h-4 mr-1.5" />
                                Logout
                            </Button>
                        </div>
                    </div>
                </div>

                {/* ══ MAIN GRID ════════════════════════════════════════════════════════ */}
                <div className="grid lg:grid-cols-3 gap-6">

                    {/* ── LEFT COL ─────────────────────────────────────────────────── */}
                    <div className="lg:col-span-2 space-y-6">

                        {/* ── ACCOUNT SECURITY ── */}
                        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                            <div className="flex items-center gap-2 px-5 py-4 border-b border-gray-100">
                                <ShieldCheck className="w-5 h-5 text-teal-500" />
                                <h3 className="font-semibold text-gray-800">Account Security</h3>
                                {isOAuth && (
                                    <span className="ml-2 text-xs bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full font-medium">
                                        OAuth Account
                                    </span>
                                )}
                            </div>

                            <div className="p-5 space-y-4">
                                {/* OAuth banner */}
                                {isOAuth && (
                                    <div className="flex items-center gap-3 bg-blue-50 border border-blue-100 rounded-xl p-4">
                                        <div className="w-9 h-9 rounded-full bg-blue-500 flex items-center justify-center shrink-0">
                                            <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="currentColor">
                                                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                                                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                                            </svg>
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-blue-800">Signed in with Google</p>
                                            <p className="text-xs text-blue-600">Your account is secured through Google OAuth</p>
                                        </div>
                                    </div>
                                )}

                                {/* Password status */}
                                <div className="flex items-center justify-between py-3 border-b border-gray-100">
                                    <div className="flex items-center gap-2 text-gray-600">
                                        <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                                            🔑
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-gray-700">Password Status</p>
                                            <p className="text-xs text-gray-400">
                                                {isOAuth ? "No password set for your account" : "Password is set"}
                                            </p>
                                        </div>
                                    </div>
                                    <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${isOAuth
                                        ? "bg-orange-50 text-orange-600"
                                        : "bg-green-50 text-green-600"
                                        }`}>
                                        {isOAuth ? "Not Set" : "Set"}
                                    </span>
                                </div>

                                {/* Optional set password */}
                                {isOAuth && (
                                    <div className="flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-xl p-3">
                                        <span className="text-amber-500 text-base mt-0.5">⚠</span>
                                        <div>
                                            <p className="text-sm font-medium text-amber-700">Optional: Set a Password</p>
                                            <p className="text-xs text-amber-600">
                                                You can optionally set a password to sign in with email/password in addition to Google OAuth.
                                            </p>
                                        </div>
                                    </div>
                                )}

                                {/* Password form */}
                                <form onSubmit={handlePasswordUpdate} className="space-y-3">
                                    <div className="space-y-1">
                                        <Label className="text-sm font-medium text-gray-700">New Password</Label>
                                        <div className="relative">
                                            <Input
                                                type={showNew ? "text" : "password"}
                                                value={newPassword}
                                                onChange={(e) => setNewPassword(e.target.value)}
                                                placeholder="Enter new password"
                                                className="pr-10 focus:ring-teal-400 border-gray-200"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowNew(!showNew)}
                                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                            >
                                                {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                            </button>
                                        </div>
                                    </div>

                                    <div className="space-y-1">
                                        <Label className="text-sm font-medium text-gray-700">Confirm Password</Label>
                                        <div className="relative">
                                            <Input
                                                type={showConfirm ? "text" : "password"}
                                                value={confirmPassword}
                                                onChange={(e) => setConfirmPassword(e.target.value)}
                                                placeholder="Confirm new password"
                                                className="pr-10 focus:ring-teal-400 border-gray-200"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowConfirm(!showConfirm)}
                                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                            >
                                                {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                            </button>
                                        </div>
                                        {/* Strength indicator */}
                                        {newPassword && (
                                            <div className="flex gap-1 mt-1">
                                                {[1, 2, 3, 4].map((i) => (
                                                    <div
                                                        key={i}
                                                        className={`h-1 flex-1 rounded-full transition-colors ${newPassword.length >= i * 2
                                                            ? newPassword.length >= 8
                                                                ? "bg-green-400"
                                                                : newPassword.length >= 5
                                                                    ? "bg-yellow-400"
                                                                    : "bg-red-400"
                                                            : "bg-gray-200"
                                                            }`}
                                                    />
                                                ))}
                                            </div>
                                        )}
                                    </div>

                                    <Button
                                        type="submit"
                                        disabled={passwordSubmitting}
                                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium"
                                    >
                                        {passwordSubmitting ? (
                                            <Loader2 className="w-4 h-4 animate-spin mr-2" />
                                        ) : (
                                            <span className="mr-2">🔑</span>
                                        )}
                                        Set Password
                                    </Button>
                                </form>
                            </div>
                        </div>

                        {/* ── UPDATE PROFILE ── */}
                        <div id="update-profile" className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                            <div className="flex items-center gap-2 px-5 py-4 border-b border-gray-100">
                                <User className="w-5 h-5 text-teal-500" />
                                <h3 className="font-semibold text-gray-800">Update Profile</h3>
                            </div>

                            <div className="p-5">
                                <form onSubmit={handleProfileUpdate} className="space-y-4">
                                    {/* Full Name */}
                                    <div className="space-y-1">
                                        <Label className="text-sm font-medium text-gray-700">Full Name</Label>
                                        <Input
                                            value={name}
                                            onChange={(e) => setName(e.target.value)}
                                            placeholder="Enter your full name"
                                            className="focus:ring-teal-400 border-gray-200"
                                        />
                                    </div>

                                    {/* Profile Picture */}
                                    <div className="space-y-2">
                                        <Label className="text-sm font-medium text-gray-700">Profile Picture</Label>
                                        <div className="flex items-center gap-4">
                                            {/* Preview */}
                                            <div className="w-14 h-14 rounded-full overflow-hidden bg-teal-700 flex items-center justify-center text-white font-bold text-xl shrink-0">
                                                {currentAvatar ? (
                                                    <img
                                                        src={currentAvatar}
                                                        alt="preview"
                                                        className="w-full h-full object-cover"
                                                    />
                                                ) : (
                                                    <span>{initials(authUser?.name)}</span>
                                                )}
                                            </div>

                                            <div>
                                                <button
                                                    type="button"
                                                    onClick={() => fileInputRef.current?.click()}
                                                    className="inline-flex items-center gap-2 px-4 py-2 border border-teal-500 text-teal-600 rounded-lg text-sm font-medium hover:bg-teal-50 transition"
                                                >
                                                    <Upload className="w-4 h-4" />
                                                    Upload Photo
                                                </button>
                                                <p className="text-xs text-gray-400 mt-1">
                                                    JPG, PNG or GIF. Max size 5MB.
                                                </p>
                                                <input
                                                    ref={fileInputRef}
                                                    type="file"
                                                    accept="image/jpeg,image/png,image/gif"
                                                    className="hidden"
                                                    onChange={handleAvatarChange}
                                                />
                                            </div>
                                        </div>

                                        {/* Show selected filename */}
                                        {avatarFile && (
                                            <div className="flex items-center gap-2 text-xs text-teal-600 bg-teal-50 px-3 py-1.5 rounded-lg">
                                                <CheckCircle2 className="w-3.5 h-3.5" />
                                                {avatarFile.name}
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        setAvatarFile(null);
                                                        setAvatarPreview(null);
                                                    }}
                                                    className="ml-auto text-gray-400 hover:text-gray-600"
                                                >
                                                    <X className="w-3 h-3" />
                                                </button>
                                            </div>
                                        )}
                                    </div>

                                    <Button
                                        type="submit"
                                        disabled={profileSubmitting}
                                        className="w-full bg-teal-500 hover:bg-teal-600 text-white font-medium"
                                    >
                                        {profileSubmitting ? (
                                            <Loader2 className="w-4 h-4 animate-spin mr-2" />
                                        ) : null}
                                        Update Profile
                                    </Button>
                                </form>
                            </div>
                        </div>

                        {/* ── DELIVERY ADDRESSES ── */}
                        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
                                <div className="flex items-center gap-2">
                                    <MapPin className="w-5 h-5 text-teal-500" />
                                    <h3 className="font-semibold text-gray-800">Delivery Addresses</h3>
                                </div>
                                <Button
                                    size="sm"
                                    onClick={openAddDrawer}
                                    disabled={addressLoading}
                                    className="bg-teal-500 hover:bg-teal-600 text-white text-xs font-medium"
                                >
                                    <Plus className="w-3.5 h-3.5 mr-1" />
                                    Add New
                                </Button>
                            </div>

                            <div className="p-5">
                                {!authUser?.addresses?.length ? (
                                    <div className="text-center py-10 space-y-3">
                                        <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mx-auto">
                                            <MapPin className="w-6 h-6 text-gray-400" />
                                        </div>
                                        <p className="text-gray-500 text-sm">No addresses added yet.</p>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={openAddDrawer}
                                            className="border-teal-400 text-teal-600 hover:bg-teal-50"
                                        >
                                            <Plus className="w-3.5 h-3.5 mr-1" />
                                            Add Your First Address
                                        </Button>
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        {authUser.addresses.map((addr: Address, i: number) => (
                                            <div
                                                key={addr._id || i}
                                                className="border border-gray-200 rounded-xl p-4 flex justify-between items-start hover:border-teal-300 hover:bg-teal-50/30 transition group"
                                            >
                                                <div className="space-y-0.5">
                                                    <p className="font-medium text-gray-800 text-sm">
                                                        {addr.street}
                                                    </p>
                                                    <p className="text-xs text-gray-500">
                                                        {[addr.state, addr.city, addr.country]
                                                            .filter(Boolean)
                                                            .join(", ")}
                                                    </p>
                                                    <p className="text-xs text-gray-400">{addr.postalCode}</p>

                                                    {addr.isDefault && (
                                                        <span className="inline-flex items-center gap-1 text-xs bg-teal-100 text-teal-700 px-2 py-0.5 rounded-full font-medium mt-1">
                                                            <CheckCircle2 className="w-3 h-3" />
                                                            Default
                                                        </span>
                                                    )}
                                                </div>

                                                <div className="flex items-center gap-1.5 shrink-0 ml-3">
                                                    {/* Edit */}
                                                    <button
                                                        onClick={() => openEditDrawer(addr)}
                                                        disabled={addressLoading}
                                                        className="p-1.5 rounded-lg text-teal-500 hover:bg-teal-100 transition"
                                                        title="Edit"
                                                    >
                                                        <Edit2 className="w-4 h-4" />
                                                    </button>

                                                    {/* Delete */}
                                                    <button
                                                        onClick={() => handleDeleteAddress(addr)}
                                                        disabled={addressLoading}
                                                        className="p-1.5 rounded-lg text-red-400 hover:bg-red-50 transition"
                                                        title="Delete"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* ── RIGHT COL ────────────────────────────────────────────────── */}
                    <div className="space-y-6">

                        {/* Cart Summary */}
                        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                            <div className="flex items-center gap-2 px-5 py-4 border-b border-gray-100">
                                <ShoppingCart className="w-5 h-5 text-teal-500" />
                                <h3 className="font-semibold text-gray-800">Cart Summary</h3>
                            </div>

                            <div className="p-5 space-y-3">
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-gray-600">Total Items</span>
                                    <span className="bg-teal-500 text-white text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center">
                                        {cartItemsWithQuantities.length}
                                    </span>
                                </div>

                                {cartItemsWithQuantities.length > 0 && (
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-gray-600">Subtotal</span>
                                        <span className="font-semibold text-gray-800">
                                            <PriceFormatter amount={cartTotal} />
                                        </span>
                                    </div>
                                )}

                                <Button
                                    variant="outline"
                                    className="w-full border-teal-400 text-teal-600 hover:bg-teal-50 font-medium"
                                    onClick={() => router.push("/user/cart")}
                                >
                                    View Cart
                                </Button>
                            </div>
                        </div>

                        {/* Recent Orders */}
                        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                            <div className="flex items-center gap-2 px-5 py-4 border-b border-gray-100">
                                <Package className="w-5 h-5 text-teal-500" />
                                <h3 className="font-semibold text-gray-800">Recent Orders</h3>
                            </div>

                            <div className="p-5">
                                {ordersLoading ? (
                                    <div className="flex justify-center py-6">
                                        <Loader2 className="w-6 h-6 animate-spin text-teal-500" />
                                    </div>
                                ) : safeOrders.length === 0 ? (
                                    <div className="text-center py-8 space-y-2">
                                        <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mx-auto">
                                            <Package className="w-6 h-6 text-gray-400" />
                                        </div>
                                        <p className="text-gray-500 text-sm">No orders yet</p>
                                    </div>
                                ) : (
                                    <div className="space-y-2">
                                        {safeOrders.slice(0, 5).map((o) => (
                                            <div
                                                key={o._id}
                                                className="border border-gray-100 rounded-xl p-3 hover:border-teal-200 transition cursor-pointer"
                                                onClick={() => router.push(`/orders/${o._id}`)}
                                            >
                                                <div className="flex items-center justify-between">
                                                    <p className="text-xs font-semibold text-gray-700">
                                                        #{o._id.slice(-6).toUpperCase()}
                                                    </p>
                                                    <span
                                                        className={`text-xs px-2 py-0.5 rounded-full font-medium ${o.status === "completed"
                                                            ? "bg-green-100 text-green-700"
                                                            : o.status === "pending"
                                                                ? "bg-yellow-100 text-yellow-700"
                                                                : o.status === "cancelled"
                                                                    ? "bg-red-100 text-red-600"
                                                                    : "bg-blue-100 text-blue-700"
                                                            }`}
                                                    >
                                                        {o.status}
                                                    </span>
                                                </div>
                                                <p className="text-sm font-semibold text-gray-800 mt-1">
                                                    <PriceFormatter amount={o.total} />
                                                </p>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* ── ADDRESS DRAWER ──────────────────────────────────────────────── */}
            <AddressDrawer
                open={drawerOpen}
                onClose={() => setDrawerOpen(false)}
                onSave={handleSaveAddress}
                initial={editingAddress}
                loading={addressLoading}
            />
        </div>
    );
};

export default ProfilePage;
