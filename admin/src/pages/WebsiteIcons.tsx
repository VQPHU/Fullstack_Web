import React, { useEffect, useState } from 'react';
import type { WebsiteIcon, WebsiteIconCategory } from '@/lib/type';
import { useAxiosPrivate } from "@/hooks/useAxiosPrivate";
import useAuthStore from '@/store/useAuthStore';
import { Edit, Eye, Plus, RefreshCw, Search, Trash, Image } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { zodResolver } from '@hookform/resolvers/zod';
import { websiteIconSchema } from '@/lib/validation';
import z from 'zod';
import { useForm } from 'react-hook-form';
import ImageUpLoad from '@/components/ui/image.upload';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Label } from '@/components/ui/label';

type FormData = z.infer<typeof websiteIconSchema>;

const CATEGORIES: WebsiteIconCategory[] = [
    "Logo", "Favicon", "Social Media", "Footer", "Header", "Other",
];

const CATEGORY_COLORS: Record<WebsiteIconCategory, string> = {
    Logo: "bg-violet-100 text-violet-800",
    Favicon: "bg-blue-100 text-blue-800",
    "Social Media": "bg-pink-100 text-pink-800",
    Footer: "bg-green-100 text-green-800",
    Header: "bg-amber-100 text-amber-800",
    Other: "bg-gray-100 text-gray-700",
};

const WebsiteIcons = () => {
    const [icons, setIcons] = useState<WebsiteIcon[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [selectedIcon, setSelectedIcon] = useState<WebsiteIcon | null>(null);
    const [formLoading, setFormLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [categoryFilter, setCategoryFilter] = useState("all");
    const [total, setTotal] = useState(0);

    const axiosPrivate = useAxiosPrivate();
    const { checkIsAdmin } = useAuthStore();
    const isAdmin = checkIsAdmin();

    const formAdd = useForm<FormData>({
        resolver: zodResolver(websiteIconSchema),
        defaultValues: {
            name: "",
            key: "",
            category: undefined,
            imageUrl: "",
            order: 0,
            isActive: true,
        },
    });

    const formEdit = useForm<FormData>({
        resolver: zodResolver(websiteIconSchema),
        defaultValues: {
            name: "",
            key: "",
            category: undefined,
            imageUrl: "",
            order: 0,
            isActive: true,
        },
    });

    const fetchIcons = async () => {
        setLoading(true);
        try {
            const params: Record<string, string> = {};
            if (searchTerm) params.keyword = searchTerm;
            if (categoryFilter !== "all") params.category = categoryFilter;

            const response = await axiosPrivate.get("/website-icons", { params });
            if (response?.data) {
                setIcons(response.data.icons);
                setTotal(response.data.count);
            }
        } catch (error) {
            console.log("Failed to load website icons", error);
            toast.error("Failed to load website icons");
        } finally {
            setLoading(false);
        }
    };

    const handleRefresh = async () => {
        setRefreshing(true);
        setLoading(true);
        try {
            const response = await axiosPrivate.get("/website-icons");
            if (response?.data) {
                setIcons(response.data.icons);
                setTotal(response.data.count);
            }
            toast("Icons refreshed successfully");
        } catch (error) {
            console.log("Failed to refresh icons", error);
            toast.error("Failed to refresh icons");
        } finally {
            setRefreshing(false);
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchIcons();
    }, [searchTerm, categoryFilter]);

    const handleAddIcon = async (data: FormData) => {
        setFormLoading(true);
        try {
            await axiosPrivate.post("/website-icons", data);
            toast.success("Icon created successfully!");
            formAdd.reset();
            setIsAddModalOpen(false);
            fetchIcons();
        } catch (error) {
            console.log("Failed to create icon", error);
            toast.error("Failed to create icon");
        } finally {
            setFormLoading(false);
        }
    };

    const handleEdit = (icon: WebsiteIcon) => {
        setSelectedIcon(icon);
        formEdit.reset({
            name: icon.name,
            key: icon.key,
            category: icon.category,
            imageUrl: icon.imageUrl ?? "",
            order: icon.order,
            isActive: icon.isActive,
        });
        setIsEditModalOpen(true);
    };

    const handleUpdateIcon = async (data: FormData) => {
        if (!selectedIcon) return;
        setFormLoading(true);
        try {
            await axiosPrivate.put(`/website-icons/${selectedIcon._id}`, data);
            toast("Icon updated successfully");
            setIsEditModalOpen(false);
            fetchIcons();
        } catch (error) {
            console.log("Failed to update icon", error);
            toast.error("Failed to update icon");
        } finally {
            setFormLoading(false);
        }
    };

    const handleDelete = (icon: WebsiteIcon) => {
        setSelectedIcon(icon);
        setIsDeleteModalOpen(true);
    };

    const handleDeleteIcon = async () => {
        if (!selectedIcon) return;
        try {
            await axiosPrivate.delete(`/website-icons/${selectedIcon._id}`);
            toast("Icon deleted successfully");
            setIsDeleteModalOpen(false);
            fetchIcons();
        } catch (error) {
            console.log("Failed to delete icon", error);
            toast.error("Failed to delete icon");
        }
    };

    const handleView = (icon: WebsiteIcon) => {
        setSelectedIcon(icon);
        setIsViewModalOpen(true);
    };

    const filteredIcons = icons.filter((icon) => {
        const matchesSearch =
            icon.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            icon.key.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = categoryFilter === "all" || icon.category === categoryFilter;
        return matchesSearch && matchesCategory;
    });

    const LoadingSpinner = () => (
        <svg className='animate-spin h-5 w-5 mr-2 text-white' xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24'>
            <circle className='opacity-25' cx="12" cy="12" r="10" stroke='currentColor' strokeWidth="4" />
            <path className='opacity-75' fill='currentColor' d="M4 12a8 8 0 018-8v8H4z" />
        </svg>
    );

    if (loading) {
        return (
            <div className='p-5 space-y-5'>
                <div className='grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4'>
                    {[...Array(8)].map((_, i) => (
                        <div key={i} className='border border-gray-200 rounded-xl overflow-hidden bg-white animate-pulse'>
                            <div className='bg-gray-100 h-48' />
                            <div className='p-3 space-y-2'>
                                <div className='h-4 bg-gray-100 rounded w-3/4' />
                                <div className='h-3 bg-gray-100 rounded w-1/2' />
                                <div className='h-3 bg-gray-100 rounded w-1/4' />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className='p-5 space-y-5'>
            {/* Header */}
            <div className='flex items-center justify-between'>
                <div>
                    <h1 className='text-3xl font-bold text-gray-900'>Website Icons</h1>
                    <p className='text-gray-600 my-0.5'>Manage logos, favicons, and other website assets</p>
                </div>
                <div className='flex items-center gap-4'>
                    <div className='flex items-center gap-2'>
                        <Image className='h-8 w-8 text-blue-600' />
                        <span className='text-2xl font-bold text-blue-600'>{total}</span>
                    </div>
                    <Button
                        variant="outline"
                        onClick={handleRefresh}
                        disabled={refreshing}
                        className='border-blue-600 text-blue-600 hover:bg-blue-50'
                    >
                        <RefreshCw className={`mr-2 h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
                        {refreshing ? "Refreshing..." : "Refresh"}
                    </Button>
                    {isAdmin && (
                        <Button onClick={() => setIsAddModalOpen(true)} className='bg-blue-600 hover:bg-blue-700'>
                            <Plus className='mr-2 h-4 w-4' />
                            Add Icon
                        </Button>
                    )}
                </div>
            </div>

            {/* Filters */}
            <div className='flex items-center gap-4 flex-wrap'>
                <div className='flex items-center gap-2'>
                    <Search className='h-4 w-4 text-gray-500' />
                    <Input
                        placeholder='Search by name or key...'
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className='w-64'
                    />
                </div>
                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                    <SelectTrigger className='w-48'>
                        <SelectValue placeholder="Filter by category" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value='all'>All Categories</SelectItem>
                        {CATEGORIES.map((c) => (
                            <SelectItem key={c} value={c}>{c}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            {/* Icon Grid */}
            {filteredIcons.length === 0 ? (
                <div className='flex flex-col items-center gap-4 py-16'>
                    <Image className='h-12 w-12 text-gray-400' />
                    <div className='text-center'>
                        <p className='text-lg font-medium text-gray-900'>No icons found</p>
                        <p className='text-sm text-gray-500'>
                            {searchTerm || categoryFilter !== "all"
                                ? "Try adjusting your search or filters"
                                : "Icons will appear here when added"}
                        </p>
                    </div>
                </div>
            ) : (
                <div className='grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4'>
                    {filteredIcons.map((icon) => (
                        <div key={icon._id} className='border border-gray-200 rounded-xl overflow-hidden bg-white shadow-sm'>
                            {/* Image Area */}
                            <div className='bg-gray-50 h-48 flex items-center justify-center'>
                                {icon.imageUrl ? (
                                    <img
                                        src={icon.imageUrl}
                                        alt={icon.name}
                                        className='max-h-36 max-w-[85%] object-contain'
                                    />
                                ) : (
                                    <span className='text-3xl font-semibold text-gray-300'>
                                        {icon.name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2)}
                                    </span>
                                )}
                            </div>

                            {/* Info Area */}
                            <div className='p-3 space-y-2'>
                                <div className='flex items-start justify-between gap-2'>
                                    <div>
                                        <p className='font-semibold text-gray-900 text-sm'>{icon.name}</p>
                                        <p className='text-xs text-gray-400 font-mono'>{icon.key}</p>
                                    </div>
                                    <Badge className={cn("text-xs shrink-0", icon.isActive ? "bg-green-100 text-green-800" : "bg-red-100 text-red-700")}>
                                        {icon.isActive ? "Active" : "Inactive"}
                                    </Badge>
                                </div>

                                <Badge className={cn("text-xs", CATEGORY_COLORS[icon.category])}>
                                    {icon.category}
                                </Badge>

                                {/* Actions */}
                                <div className='flex items-center justify-center gap-1 pt-1 border-t border-gray-100'>
                                    <Button variant="ghost" size="icon" onClick={() => handleView(icon)} title="View details">
                                        <Eye className='h-4 w-4' />
                                    </Button>
                                    {isAdmin && (
                                        <>
                                            <Button variant="ghost" size="icon" onClick={() => handleEdit(icon)} title="Edit icon">
                                                <Edit className='h-4 w-4' />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => handleDelete(icon)}
                                                className='text-red-600 hover:text-red-700'
                                                title='Delete icon'
                                            >
                                                <Trash className='h-4 w-4' />
                                            </Button>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Add Icon Modal */}
            <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
                <DialogContent className='sm:max-w-[550px] max-h-[90vh] overflow-y-auto'>
                    <DialogHeader>
                        <DialogTitle>Add Icon</DialogTitle>
                        <DialogDescription>Add a new website icon or asset</DialogDescription>
                    </DialogHeader>
                    <Form {...formAdd}>
                        <form onSubmit={formAdd.handleSubmit(handleAddIcon)} className='space-y-6 mt-4'>
                            <FormField
                                control={formAdd.control}
                                name="name"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className='text-gray-700 font-medium'>Name</FormLabel>
                                        <FormControl>
                                            <Input {...field} disabled={formLoading} placeholder='e.g. Main Logo' className='border-gray-300 rounded-lg' />
                                        </FormControl>
                                        <FormMessage className='text-red-500 text-xs' />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={formAdd.control}
                                name="key"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className='text-gray-700 font-medium'>Key</FormLabel>
                                        <FormControl>
                                            <Input {...field} disabled={formLoading} placeholder='e.g. main_logo' className='border-gray-300 rounded-lg' />
                                        </FormControl>
                                        <FormMessage className='text-red-500 text-xs' />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={formAdd.control}
                                name="category"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className='text-gray-700 font-medium'>Category</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value} disabled={formLoading}>
                                            <FormControl>
                                                <SelectTrigger className='border-gray-300 rounded-lg w-full'>
                                                    <SelectValue placeholder="Select a category" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {CATEGORIES.map((c) => (
                                                    <SelectItem key={c} value={c}>{c}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage className='text-red-500 text-xs' />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={formAdd.control}
                                name="order"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className='text-gray-700 font-medium'>Order</FormLabel>
                                        <FormControl>
                                            <Input
                                                type="number"
                                                {...field}
                                                onChange={(e) => field.onChange(Number(e.target.value))}
                                                disabled={formLoading}
                                                className='border-gray-300 rounded-lg'
                                            />
                                        </FormControl>
                                        <FormMessage className='text-red-500 text-xs' />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={formAdd.control}
                                name="isActive"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className='text-gray-700 font-medium'>Status</FormLabel>
                                        <Select
                                            onValueChange={(v) => field.onChange(v === "true")}
                                            defaultValue={String(field.value)}
                                            disabled={formLoading}
                                        >
                                            <FormControl>
                                                <SelectTrigger className='border-gray-300 rounded-lg w-full'>
                                                    <SelectValue placeholder="Select status" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value='true'>Active</SelectItem>
                                                <SelectItem value='false'>Inactive</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage className='text-red-500 text-xs' />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={formAdd.control}
                                name="imageUrl"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className='text-gray-700 font-medium'>Image</FormLabel>
                                        <FormControl>
                                            <ImageUpLoad
                                                value={field.value ?? ""}
                                                onChange={field.onChange}
                                                disabled={formLoading}
                                            />
                                        </FormControl>
                                        <FormMessage className='text-red-500 text-xs' />
                                    </FormItem>
                                )}
                            />
                            <DialogFooter className='mt-6 flex justify-end gap-3'>
                                <Button type="button" variant="outline" onClick={() => setIsAddModalOpen(false)} disabled={formLoading} className='border-gray-300 text-gray-700 hover:bg-gray-100 rounded-lg'>
                                    Cancel
                                </Button>
                                <Button type='submit' disabled={formLoading} className='bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg shadow-md'>
                                    {formLoading ? <><LoadingSpinner />Creating...</> : "Create Icon"}
                                </Button>
                            </DialogFooter>
                        </form>
                    </Form>
                </DialogContent>
            </Dialog>

            {/* Edit Icon Modal */}
            <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
                <DialogContent className='sm:max-w-[550px] max-h-[90vh] overflow-y-auto'>
                    <DialogHeader>
                        <DialogTitle>Edit Icon</DialogTitle>
                        <DialogDescription>Update icon information</DialogDescription>
                    </DialogHeader>
                    <Form {...formEdit}>
                        <form onSubmit={formEdit.handleSubmit(handleUpdateIcon)} className='space-y-6 mt-4'>
                            <FormField
                                control={formEdit.control}
                                name="name"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className='text-gray-700 font-medium'>Name</FormLabel>
                                        <FormControl>
                                            <Input {...field} disabled={formLoading} className='border-gray-300 rounded-lg' />
                                        </FormControl>
                                        <FormMessage className='text-red-500 text-xs' />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={formEdit.control}
                                name="key"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className='text-gray-700 font-medium'>Key</FormLabel>
                                        <FormControl>
                                            <Input {...field} disabled={formLoading} className='border-gray-300 rounded-lg' />
                                        </FormControl>
                                        <FormMessage className='text-red-500 text-xs' />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={formEdit.control}
                                name="category"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className='text-gray-700 font-medium'>Category</FormLabel>
                                        <Select onValueChange={field.onChange} value={field.value} disabled={formLoading}>
                                            <FormControl>
                                                <SelectTrigger className='border-gray-300 rounded-lg w-full'>
                                                    <SelectValue placeholder="Select a category" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {CATEGORIES.map((c) => (
                                                    <SelectItem key={c} value={c}>{c}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage className='text-red-500 text-xs' />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={formEdit.control}
                                name="order"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className='text-gray-700 font-medium'>Order</FormLabel>
                                        <FormControl>
                                            <Input
                                                type="number"
                                                {...field}
                                                onChange={(e) => field.onChange(Number(e.target.value))}
                                                disabled={formLoading}
                                                className='border-gray-300 rounded-lg'
                                            />
                                        </FormControl>
                                        <FormMessage className='text-red-500 text-xs' />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={formEdit.control}
                                name="isActive"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className='text-gray-700 font-medium'>Status</FormLabel>
                                        <Select
                                            onValueChange={(v) => field.onChange(v === "true")}
                                            value={String(field.value)}
                                            disabled={formLoading}
                                        >
                                            <FormControl>
                                                <SelectTrigger className='border-gray-300 rounded-lg w-full'>
                                                    <SelectValue placeholder="Select status" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value='true'>Active</SelectItem>
                                                <SelectItem value='false'>Inactive</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage className='text-red-500 text-xs' />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={formEdit.control}
                                name="imageUrl"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className='text-gray-700 font-medium'>Image</FormLabel>
                                        <FormControl>
                                            <ImageUpLoad
                                                value={field.value ?? ""}
                                                onChange={field.onChange}
                                                disabled={formLoading}
                                            />
                                        </FormControl>
                                        <FormMessage className='text-red-500 text-xs' />
                                    </FormItem>
                                )}
                            />
                            <DialogFooter className='mt-6 flex justify-end gap-3'>
                                <Button type="button" variant="outline" onClick={() => setIsEditModalOpen(false)} disabled={formLoading} className='border-gray-300 text-gray-700 hover:bg-gray-100 rounded-lg'>
                                    Cancel
                                </Button>
                                <Button type='submit' disabled={formLoading} className='bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg shadow-md'>
                                    {formLoading ? <><LoadingSpinner />Updating...</> : "Update Icon"}
                                </Button>
                            </DialogFooter>
                        </form>
                    </Form>
                </DialogContent>
            </Dialog>

            {/* Delete Modal */}
            <AlertDialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete{" "}
                            <span className='font-semibold'>"{selectedIcon?.name}"</span>.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDeleteIcon} className='bg-red-600 hover:bg-red-700'>
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* View Modal */}
            <Dialog open={isViewModalOpen} onOpenChange={setIsViewModalOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Icon Details</DialogTitle>
                        <DialogDescription>View complete icon information</DialogDescription>
                    </DialogHeader>
                    {selectedIcon && (
                        <div className='space-y-6'>
                            <div className='flex items-center justify-center bg-gray-50 rounded-lg h-48 border border-gray-200'>
                                {selectedIcon.imageUrl ? (
                                    <img
                                        src={selectedIcon.imageUrl}
                                        alt={selectedIcon.name}
                                        className='max-h-36 max-w-[85%] object-contain'
                                    />
                                ) : (
                                    <span className='text-4xl font-semibold text-gray-300'>
                                        {selectedIcon.name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2)}
                                    </span>
                                )}
                            </div>
                            <div className='flex flex-col gap-3'>
                                <div>
                                    <Label className='text-sm font-medium text-gray-600'>Name</Label>
                                    <p className='text-lg font-semibold'>{selectedIcon.name}</p>
                                </div>
                                <div>
                                    <Label className='text-sm font-medium text-gray-600'>Key</Label>
                                    <p className='font-mono text-sm text-gray-700'>{selectedIcon.key}</p>
                                </div>
                                <div>
                                    <Label className='text-sm font-medium text-gray-600'>Category</Label>
                                    <div className='mt-1'>
                                        <Badge className={cn("text-xs", CATEGORY_COLORS[selectedIcon.category])}>
                                            {selectedIcon.category}
                                        </Badge>
                                    </div>
                                </div>
                                <div>
                                    <Label className='text-sm font-medium text-gray-600'>Status</Label>
                                    <div className='mt-1'>
                                        <Badge className={cn("text-xs", selectedIcon.isActive ? "bg-green-100 text-green-800" : "bg-red-100 text-red-700")}>
                                            {selectedIcon.isActive ? "Active" : "Inactive"}
                                        </Badge>
                                    </div>
                                </div>
                                <div>
                                    <Label className='text-sm font-medium text-gray-600'>Order</Label>
                                    <p>{selectedIcon.order}</p>
                                </div>
                                <div>
                                    <Label className='text-sm font-medium text-gray-600'>Created At</Label>
                                    <p>{new Date(selectedIcon.createdAt).toLocaleDateString()}</p>
                                </div>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default WebsiteIcons;