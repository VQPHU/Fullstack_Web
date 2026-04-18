import React, { useEffect, useState } from 'react';
import type { User } from '@/lib/type';
import { useAxiosPrivate } from "@/hooks/useAxiosPrivate";
import useAuthStore from '@/store/useAuthStore';
import { Eye, MapPin, RefreshCw, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import {
    Table, TableBody, TableCell,
    TableHead, TableHeader, TableRow
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
    Dialog, DialogContent,
    DialogHeader, DialogTitle
} from '@/components/ui/dialog';

// ─── Types ────────────────────────────────────────────────────────────────────

interface Address {
    _id: string;
    street: string;
    city: string;
    state?: string;
    country: string;
    postalCode: string;
    isDefault: boolean;
}

interface UserWithAddresses extends User {
    addresses: Address[];
}

// ─── Component ────────────────────────────────────────────────────────────────

const Addresses = () => {
    const [users, setUsers] = useState<UserWithAddresses[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState<UserWithAddresses | null>(null);
    const [selectedAddress, setSelectedAddress] = useState<Address | null>(null);

    const axiosPrivate = useAxiosPrivate();
    const { checkIsAdmin } = useAuthStore();
    const isAdmin = checkIsAdmin();

    // ── Fetch ──────────────────────────────────────────────────────────────────

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const response = await axiosPrivate.get("/users");
            if (response?.data) {
                const usersWithAddresses = (response.data.users as UserWithAddresses[]).filter(
                    (u) => u.addresses && u.addresses.length > 0
                );
                setUsers(usersWithAddresses);
            }
        } catch (error) {
            toast.error("Failed to load addresses");
        } finally {
            setLoading(false);
        }
    };

    const handleRefresh = async () => {
        setRefreshing(true);
        try {
            const response = await axiosPrivate.get("/users");
            if (response?.data) {
                const usersWithAddresses = (response.data.users as UserWithAddresses[]).filter(
                    (u) => u.addresses && u.addresses.length > 0
                );
                setUsers(usersWithAddresses);
            }
            toast.success("Addresses refreshed successfully");
        } catch {
            toast.error("Failed to refresh");
        } finally {
            setRefreshing(false);
        }
    };

    useEffect(() => { fetchUsers(); }, []);

    // ── Handlers ───────────────────────────────────────────────────────────────

    const handleView = (user: UserWithAddresses, address: Address) => {
        setSelectedUser(user);
        setSelectedAddress(address);
        setIsViewModalOpen(true);
    };

    // ── Derived data ───────────────────────────────────────────────────────────

    // Thành này — mỗi user chỉ lấy địa chỉ isDefault
    const allRows = users
        .map((user) => {
            const defaultAddress = user.addresses.find((a) => a.isDefault);
            if (!defaultAddress) return null;
            return { user, address: defaultAddress };
        })
        .filter(Boolean) as { user: UserWithAddresses; address: Address }[];

    const filteredRows = allRows.filter(({ user, address }) => {
        const term = searchTerm.toLowerCase();
        return (
            user.name.toLowerCase().includes(term) ||
            user.email.toLowerCase().includes(term) ||
            address.street.toLowerCase().includes(term) ||
            address.city.toLowerCase().includes(term) ||
            address.country.toLowerCase().includes(term)
        );
    });

    // Data protection: non-admin chỉ thấy 10 đầu
    const visibleRows = isAdmin ? filteredRows : filteredRows.slice(0, 10);
    const hiddenCount = isAdmin ? 0 : Math.max(0, filteredRows.length - 10);

    // ── Loading skeleton ───────────────────────────────────────────────────────

    if (loading) {
        return (
            <div className="p-5 space-y-4">
                {[...Array(6)].map((_, i) => (
                    <div key={i} className="h-16 bg-gray-100 rounded-lg animate-pulse" />
                ))}
            </div>
        );
    }

    // ── Render ─────────────────────────────────────────────────────────────────

    return (
        <div className="p-5 space-y-5">

            {/* Read-only banner */}
            {!isAdmin && (
                <div className="flex items-center gap-2 bg-yellow-50 border border-yellow-200 text-yellow-800 rounded-lg px-4 py-3 text-sm">
                    🔒 Read-Only Mode: You have full access to view all admin pages and data,
                    but CRUD operations (create, update, delete) are disabled
                </div>
            )}

            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Customer Addresses</h1>
                    <p className="text-gray-600 my-0.5">View all customer shipping addresses</p>
                </div>
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                        <MapPin className="h-8 w-8 text-purple-600" />
                        <span className="text-2xl font-bold text-purple-600">{allRows.length}</span>
                    </div>
                    <Button
                        variant="outline"
                        onClick={handleRefresh}
                        disabled={refreshing}
                        className="border-purple-600 text-purple-600 hover:bg-purple-50"
                    >
                        <RefreshCw className={`mr-2 h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
                        {refreshing ? "Refreshing..." : "Refresh"}
                    </Button>
                </div>
            </div>

            {/* Data protection notice */}
            {!isAdmin && hiddenCount > 0 && (
                <div className="flex items-start gap-3 bg-blue-50 border border-blue-200 text-blue-800 rounded-lg px-4 py-3 text-sm">
                    <span className="mt-0.5">ℹ️</span>
                    <div>
                        <p className="font-semibold">Data Protection Active</p>
                        <p>
                            For privacy protection, showing only the first 10 addresses.
                            Additional {hiddenCount} address records are hidden (shown as skeleton loaders).
                        </p>
                    </div>
                </div>
            )}

            {/* Search */}
            <div className="flex items-center gap-2">
                <Search className="h-4 w-4 text-gray-500" />
                <Input
                    placeholder="Search by name, phone, address, city..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-96"
                />
            </div>

            {/* Table */}
            <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="font-semibold">Customer</TableHead>
                            <TableHead className="font-semibold">Address</TableHead>
                            <TableHead className="font-semibold">City</TableHead>
                            <TableHead className="font-semibold">State/Postal</TableHead>
                            <TableHead className="font-semibold">Country</TableHead>
                            <TableHead className="font-semibold">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {visibleRows.length > 0 ? (
                            <>
                                {visibleRows.map(({ user, address }) => (
                                    <TableRow key={`${user._id}-${address._id}`}>
                                        <TableCell>
                                            <div>
                                                <p className="font-semibold text-gray-900">{user.name}</p>
                                                <p className="text-sm text-gray-500">{user.email}</p>
                                            </div>
                                        </TableCell>
                                        <TableCell className="max-w-[200px] truncate text-gray-700">
                                            {address.street}
                                        </TableCell>
                                        <TableCell>{address.city}</TableCell>
                                        <TableCell>
                                            <div>
                                                <p>{address.state || address.city}</p>
                                                <p className="text-sm text-gray-500">{address.postalCode}</p>
                                            </div>
                                        </TableCell>
                                        <TableCell>{address.country}</TableCell>
                                        <TableCell>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => handleView(user, address)}
                                                title="View address details"
                                            >
                                                <Eye className="h-4 w-4" />
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}

                                {/* Skeleton rows cho hidden addresses */}
                                {!isAdmin && hiddenCount > 0 &&
                                    [...Array(Math.min(hiddenCount, 5))].map((_, i) => (
                                        <TableRow key={`skeleton-${i}`}>
                                            {[...Array(6)].map((_, j) => (
                                                <TableCell key={j}>
                                                    <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4" />
                                                </TableCell>
                                            ))}
                                        </TableRow>
                                    ))
                                }
                            </>
                        ) : (
                            <TableRow>
                                <TableCell colSpan={6} className="text-center py-12">
                                    <div className="flex flex-col items-center gap-4">
                                        <MapPin className="h-12 w-12 text-gray-400" />
                                        <div>
                                            <p className="text-lg font-medium text-gray-900">No addresses found</p>
                                            <p className="text-sm text-gray-500">
                                                {searchTerm
                                                    ? "Try adjusting your search"
                                                    : "No customer addresses yet"}
                                            </p>
                                        </div>
                                    </div>
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* ── View Details Modal ───────────────────────────────────────────── */}
            <Dialog open={isViewModalOpen} onOpenChange={setIsViewModalOpen}>
                <DialogContent className="sm:max-w-[420px]">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <MapPin className="h-5 w-5 text-purple-600" />
                            Address Details
                        </DialogTitle>
                    </DialogHeader>

                    {selectedUser && selectedAddress && (
                        <div className="space-y-4">

                            {/* Customer Info */}
                            <div className="bg-purple-50 rounded-lg p-4 space-y-3">
                                <div className="flex items-center gap-3 mb-2">
                                    <div className="h-10 w-10 rounded-full bg-purple-200 flex items-center justify-center text-purple-700 font-bold text-lg overflow-hidden flex-shrink-0">
                                        {selectedUser.avatar ? (
                                            <img
                                                src={selectedUser.avatar}
                                                alt={selectedUser.name}
                                                className="h-full w-full object-cover"
                                            />
                                        ) : (
                                            selectedUser.name.charAt(0).toUpperCase()
                                        )}
                                    </div>
                                    <div>
                                        <p className="text-sm font-semibold text-gray-700">Customer Information</p>
                                        <p className="text-xs text-gray-400">Address belongs to this user</p>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <div>
                                        <p className="text-xs text-gray-500 flex items-center gap-1">👤 Name</p>
                                        <p className="font-semibold text-gray-900">{selectedUser.name}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500 flex items-center gap-1">✉️ Email</p>
                                        <p className="font-semibold text-gray-900">{selectedUser.email}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Shipping Address */}
                            <div className="border rounded-lg p-4 space-y-3">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <span>🏠</span>
                                        <span className="font-semibold text-gray-800">Shipping Address</span>
                                    </div>
                                    {selectedAddress.isDefault && (
                                        <Badge className="bg-green-100 text-green-700 hover:bg-green-100">
                                            Default
                                        </Badge>
                                    )}
                                </div>

                                <div className="bg-gray-50 rounded-lg p-3 space-y-3">
                                    <div>
                                        <p className="text-xs text-gray-500 font-medium">Street</p>
                                        <p className="text-gray-900">{selectedAddress.street}</p>
                                    </div>
                                    <div className="grid grid-cols-2 gap-3">
                                        <div>
                                            <p className="text-xs text-gray-500 font-medium">City</p>
                                            <p className="text-gray-900">{selectedAddress.city}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-500 font-medium">State</p>
                                            <p className="text-gray-900">{selectedAddress.state || selectedAddress.city}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-500 font-medium">Postal Code</p>
                                            <p className="text-gray-900">{selectedAddress.postalCode}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-500 font-medium">Country</p>
                                            <p className="text-gray-900">{selectedAddress.country}</p>
                                        </div>
                                    </div>

                                    {/* Full address */}
                                    <div className="bg-white border rounded p-2">
                                        <p className="text-xs text-gray-500 font-medium mb-1">Full Address</p>
                                        <p className="text-sm text-gray-700">
                                            {[
                                                selectedAddress.street,
                                                selectedAddress.city,
                                                selectedAddress.state,
                                                selectedAddress.postalCode,
                                                selectedAddress.country,
                                            ].filter(Boolean).join(", ")}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Open Google Maps */}
                            <a
                                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                                    [selectedAddress.street, selectedAddress.city, selectedAddress.country].join(", ")
                                )}`}
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                <Button
                                    variant="outline"
                                    className="w-full border-purple-300 text-purple-600 hover:bg-purple-50"
                                >
                                    🗺️ Open in Google Maps
                                </Button>
                            </a>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default Addresses;