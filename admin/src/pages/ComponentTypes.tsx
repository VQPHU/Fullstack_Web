import React, { useEffect, useState } from "react";
import type { ComponentType } from "@/lib/type";
import { useAxiosPrivate } from "@/hooks/useAxiosPrivate";
import useAuthStore from "@/store/useAuthStore";
import { Grid3x3Icon, RefreshCw, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
} from "@/components/ui/form";
import { Switch } from "@/components/ui/switch";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import {
    componentTypeSchema,
    type ComponentTypeFormData,
} from "@/lib/validation";

const ComponentTypes = () => {
    const [components, setComponents] = useState<ComponentType[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [selectedComponent, setSelectedComponent] =
        useState<ComponentType | null>(null);
    const [formLoading, setFormLoading] = useState(false);

    const axiosPrivate = useAxiosPrivate();
    const { checkIsAdmin } = useAuthStore();
    const isAdmin = checkIsAdmin();

    const formEdit = useForm<ComponentTypeFormData>({
        resolver: zodResolver(componentTypeSchema),
        defaultValues: { name: "", isActive: false },
    });

    const fetchComponents = async () => {
        setLoading(true);
        try {
            const response = await axiosPrivate.get("/components");
            if (response?.data) {
                setComponents(response.data.components);
            }
        } catch (error) {
            console.error("Failed to load components", error);
            toast.error("Failed to load component types");
        } finally {
            setLoading(false);
        }
    };

    const handleRefresh = async () => {
        setRefreshing(true);
        setLoading(true);
        try {
            const response = await axiosPrivate.get("/components");
            if (response?.data) {
                setComponents(response.data.components);
            }
            toast.success("Refreshed successfully");
        } catch (error) {
            console.error("Failed to refresh", error);
            toast.error("Failed to refresh component types");
        } finally {
            setRefreshing(false);
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchComponents();
    }, []);

    const handleEdit = (component: ComponentType) => {
        setSelectedComponent(component);
        formEdit.reset({ name: component.name, isActive: component.isActive });
        setIsEditModalOpen(true);
    };

    const handleUpdateComponent = async (data: ComponentTypeFormData) => {
        if (!selectedComponent?._id) return;
        setFormLoading(true);
        try {
            await axiosPrivate.put(`/components/${selectedComponent._id}`, {
                isActive: data.isActive,
            });
            toast.success("Component type updated successfully");
            setIsEditModalOpen(false);
            setSelectedComponent(null);
            fetchComponents();
        } catch (error) {
            console.error("Failed to update component", error);
            toast.error("Failed to update component type");
        } finally {
            setFormLoading(false);
        }
    };

    const filteredComponents = components.filter((comp) =>
        comp.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const getSlugLabel = (name: string) => name.replace(/_/g, " ");

    if (loading) {
        return (
            <div className="p-5 space-y-5">
                <div className="flex items-center justify-between">
                    <div className="space-y-2">
                        <div className="h-8 w-56 bg-gray-200 rounded animate-pulse" />
                        <div className="h-4 w-72 bg-gray-100 rounded animate-pulse" />
                    </div>
                    <div className="h-9 w-28 bg-gray-200 rounded animate-pulse" />
                </div>
                <div className="bg-white rounded-xl border p-4 space-y-3">
                    <div className="flex justify-between items-center mb-4">
                        <div className="h-5 w-40 bg-gray-200 rounded animate-pulse" />
                        <div className="h-6 w-16 bg-gray-100 rounded animate-pulse" />
                    </div>
                    {/* Fix lỗi 1: thêm key vào skeleton */}
                    {[0, 1, 2, 3].map((i) => (
                        <div key={i} className="flex items-center gap-4 p-4 border rounded-lg">
                            <div className="h-10 w-10 bg-purple-100 rounded-lg animate-pulse" />
                            <div className="h-5 w-36 bg-gray-200 rounded animate-pulse" />
                            <div className="h-5 w-28 bg-gray-100 rounded animate-pulse" />
                            <div className="h-5 w-14 bg-green-100 rounded animate-pulse" />
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="p-5 space-y-5">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
                        <span className="text-3xl"><Grid3x3Icon /></span> Component Types
                    </h1>
                    <p className="text-gray-500 mt-1 text-sm">
                        Manage available component types for website configuration
                    </p>
                </div>
                <Button
                    variant="outline"
                    onClick={handleRefresh}
                    disabled={refreshing}
                    className="border-gray-300 text-gray-600 hover:bg-gray-50"
                >
                    <RefreshCw
                        className={`mr-2 h-4 w-4 ${refreshing ? "animate-spin" : ""}`}
                    />
                    {refreshing ? "Refreshing..." : "Refresh"}
                </Button>
            </div>

            {/* Search */}
            <div className="flex items-center gap-2 w-fit">
                <Search className="h-4 w-4 text-gray-400" />
                <Input
                    placeholder="Search component types..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-64"
                />
            </div>

            {/* List Card */}
            <div className="bg-white rounded-xl border shadow-sm">
                <div className="flex items-center justify-between px-5 py-4 border-b">
                    <span className="font-semibold text-gray-800">All Component Types</span>
                    <span className="text-sm bg-gray-100 text-gray-600 px-3 py-1 rounded-full font-medium">
                        {filteredComponents.length} types
                    </span>
                </div>

                <div className="divide-y px-4 py-2">
                    {filteredComponents.length > 0 ? (
                        filteredComponents.map((comp) => (
                            <div
                                key={comp._id}
                                className="flex items-center justify-between py-4 px-1"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="h-10 w-10 rounded-lg bg-purple-100 flex items-center justify-center flex-shrink-0">
                                        <span className="text-purple-600 font-bold text-sm">{`</>`}</span>
                                    </div>
                                    <span className="font-semibold text-gray-900">{comp.name}</span>
                                    <code className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded font-mono border border-gray-200">
                                        {getSlugLabel(comp.name)}
                                    </code>
                                    <Badge
                                        className={
                                            comp.isActive
                                                ? "bg-green-50 text-green-700 border border-green-200 hover:bg-green-50"
                                                : "bg-gray-100 text-gray-500 border border-gray-200 hover:bg-gray-100"
                                        }
                                    >
                                        {comp.isActive ? "Active" : "Inactive"}
                                    </Badge>
                                </div>

                                {isAdmin ? (
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => handleEdit(comp)}
                                        className="text-gray-600 border-gray-300 hover:bg-gray-50"
                                    >
                                        Edit
                                    </Button>
                                ) : (
                                    <span className="text-sm text-gray-400">View only</span>
                                )}
                            </div>
                        ))
                    ) : (
                        <div className="flex flex-col items-center gap-3 py-16 text-center">
                            <div className="h-12 w-12 rounded-full bg-purple-50 flex items-center justify-center">
                                <span className="text-purple-400 font-bold">{`</>`}</span>
                            </div>
                            <p className="font-medium text-gray-900">No component types found</p>
                            <p className="text-sm text-gray-500">Try adjusting your search</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Fix lỗi 2: key trên Dialog để reset Switch khi đổi component */}
            <Dialog
                key={selectedComponent?._id}
                open={isEditModalOpen}
                onOpenChange={(open) => {
                    setIsEditModalOpen(open);
                    if (!open) setSelectedComponent(null);
                }}
            >
                <DialogContent className="sm:max-w-[400px]">
                    <DialogHeader>
                        <DialogTitle>Edit Component Type</DialogTitle>
                        <DialogDescription>
                            Update the status of{" "}
                            <span className="font-semibold text-gray-900">
                                {selectedComponent?.name}
                            </span>
                        </DialogDescription>
                    </DialogHeader>
                    <Form {...formEdit}>
                        <form
                            onSubmit={formEdit.handleSubmit(handleUpdateComponent)}
                            className="space-y-5 mt-2"
                        >
                            <FormField
                                control={formEdit.control}
                                name="isActive"
                                render={({ field }) => (
                                    <FormItem className="flex items-center justify-between rounded-lg border p-4">
                                        <div>
                                            <FormLabel className="text-gray-700 font-medium">
                                                Active
                                            </FormLabel>
                                            <p className="text-xs text-gray-500 mt-0.5">
                                                Enable this component on the homepage
                                            </p>
                                        </div>
                                        <FormControl>
                                            {/* Fix lỗi 2: đảm bảo luôn controlled với checked + onCheckedChange */}
                                            <Switch
                                                checked={field.value}
                                                onCheckedChange={field.onChange}
                                                disabled={formLoading}
                                            />
                                        </FormControl>
                                    </FormItem>
                                )}
                            />
                            <DialogFooter className="flex justify-end gap-3">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => setIsEditModalOpen(false)}
                                    disabled={formLoading}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    type="submit"
                                    disabled={formLoading}
                                    className="bg-purple-600 hover:bg-purple-700 text-white"
                                >
                                    {formLoading ? (
                                        <>
                                            <svg
                                                className="animate-spin h-4 w-4 mr-2 text-white"
                                                xmlns="http://www.w3.org/2000/svg"
                                                fill="none"
                                                viewBox="0 0 24 24"
                                            >
                                                <circle
                                                    className="opacity-25"
                                                    cx="12"
                                                    cy="12"
                                                    r="10"
                                                    stroke="currentColor"
                                                    strokeWidth="4"
                                                />
                                                <path
                                                    className="opacity-75"
                                                    fill="currentColor"
                                                    d="M4 12a8 8 0 018-8v8H4z"
                                                />
                                            </svg>
                                            Saving...
                                        </>
                                    ) : (
                                        "Save"
                                    )}
                                </Button>
                            </DialogFooter>
                        </form>
                    </Form>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default ComponentTypes;