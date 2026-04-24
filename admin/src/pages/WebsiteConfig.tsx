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
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useAxiosPrivate } from "@/hooks/useAxiosPrivate";
import { PageComponent, ComponentTypeOption, PageType, ComponentType } from "@/lib/type";
import { pageComponentSchema, PageComponentFormData } from "@/lib/validation";
import useAuthStore from "@/store/useAuthStore";
import { zodResolver } from "@hookform/resolvers/zod";
import {
    AlertCircle,
    Edit,
    Eye,
    GripVertical,
    Loader2,
    Plus,
    RefreshCw,
    Settings,
    Trash,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

// ─── Constants ────────────────────────────────────────────────────────────────

const PAGE_TABS: { key: PageType; label: string }[] = [
    { key: "home", label: "Home Page" },
    { key: "product", label: "Product Page" },
    { key: "blog", label: "Blog Page" },
    { key: "category", label: "Category Page" },
    { key: "about", label: "About Page" },
];

const fmtDateTime = (iso: string) =>
    new Date(iso).toLocaleString("en-US", {
        month: "short", day: "numeric", year: "numeric",
        hour: "numeric", minute: "2-digit", hour12: true,
    });

// ─── Component ────────────────────────────────────────────────────────────────

const WebsiteConfig = () => {
    const axiosPrivate = useAxiosPrivate();
    const { checkIsAdmin } = useAuthStore();
    const isAdmin = checkIsAdmin();

    const [activeTab, setActiveTab] = useState<PageType>("home");
    const [allComponents, setAllComponents] = useState<Record<PageType, PageComponent[]>>({
        home: [], product: [], blog: [], category: [], about: [],
    });
    const [masterTypes, setMasterTypes] = useState<ComponentType[]>([]);
    const [componentTypes, setComponentTypes] = useState<ComponentTypeOption[]>([]);
    const [loading, setLoading] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const [formLoading, setFormLoading] = useState(false);
    const [deleteLoading, setDeleteLoading] = useState(false);

    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [selectedComponent, setSelectedComponent] = useState<PageComponent | null>(null);

    const dragItem = useRef<number | null>(null);
    const dragOver = useRef<number | null>(null);

    // ── Forms ────────────────────────────────────────────────────────────────
    const defaultFormValues: PageComponentFormData = {
        pageType: "home", componentType: "", title: "",
        description: "", displayOrder: 0, isActive: true,
    };

    const formAdd = useForm<PageComponentFormData>({
        resolver: zodResolver(pageComponentSchema),
        defaultValues: defaultFormValues,
    });

    const formEdit = useForm<PageComponentFormData>({
        resolver: zodResolver(pageComponentSchema),
        defaultValues: defaultFormValues,
    });

    // ── Fetch ────────────────────────────────────────────────────────────────
    const fetchAll = async (showRefreshing = false) => {
        if (showRefreshing) setRefreshing(true);
        else setLoading(true);
        try {
            const [compRes, masterRes] = await Promise.all([
                axiosPrivate.get("/page-components"),
                axiosPrivate.get("/components"), // Lấy trạng thái từ Master Switch
            ]);

            const raw = compRes.data?.components ?? [];
            const grouped: Record<PageType, PageComponent[]> = {
                home: [], product: [], blog: [], category: [], about: [],
            };

            if (Array.isArray(raw)) {
                raw.forEach((c: PageComponent) => {
                    if (grouped[c.pageType]) grouped[c.pageType].push(c);
                });
            } else {
                Object.assign(grouped, raw);
            }

            const typesFromMaster: ComponentType[] = masterRes.data?.components ?? [];
            setMasterTypes(typesFromMaster);

            // Chỉ cho phép chọn các loại đang ACTIVE ở Master
            const activeOptions: ComponentTypeOption[] = typesFromMaster
                .filter(t => t.isActive)
                .map(t => ({
                    value: t.name,
                    label: t.name.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()),
                }));

            setAllComponents(grouped);
            setComponentTypes(activeOptions);

            if (showRefreshing) toast.success("Refreshed successfully");
        } catch {
            toast.error("Failed to load data");
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => { fetchAll(); }, []);

    const currentComponents = (allComponents[activeTab] ?? [])
        .slice()
        .sort((a, b) => a.displayOrder - b.displayOrder);

    // ── Drag & Drop ──────────────────────────────────────────────────────────
    const handleDragEnd = async () => {
        const from = dragItem.current;
        const to = dragOver.current;
        if (from === null || to === null || from === to) return;

        const items = [...currentComponents];
        const [moved] = items.splice(from, 1);
        items.splice(to, 0, moved);
        const updated = items.map((item, idx) => ({ ...item, displayOrder: idx }));

        setAllComponents((prev) => ({ ...prev, [activeTab]: updated }));
        dragItem.current = null;
        dragOver.current = null;

        try {
            await axiosPrivate.patch("/page-components/reorder", {
                items: updated.map((i) => ({ id: i._id, displayOrder: i.displayOrder })),
            });
            toast.success("Order saved");
        } catch {
            toast.error("Failed to save order");
            fetchAll();
        }
    };

    // ── Add ──────────────────────────────────────────────────────────────────
    const handleOpenAdd = () => {
        formAdd.reset({ ...defaultFormValues, pageType: activeTab, displayOrder: currentComponents.length });
        setIsAddModalOpen(true);
    };

    const handleAdd = async (data: PageComponentFormData) => {
        setFormLoading(true);
        try {
            await axiosPrivate.post("/page-components", data);
            toast.success("Component created successfully");
            formAdd.reset();
            setIsAddModalOpen(false);
            fetchAll();
        } catch {
            toast.error("Failed to create component");
        } finally {
            setFormLoading(false);
        }
    };

    // ── Edit ─────────────────────────────────────────────────────────────────
    const handleOpenEdit = (comp: PageComponent) => {
        setSelectedComponent(comp);
        formEdit.reset({
            pageType: comp.pageType,
            componentType: comp.componentType,
            title: comp.title,
            description: comp.description ?? "",
            displayOrder: comp.displayOrder,
            isActive: comp.isActive,
        });
        setIsEditModalOpen(true);
    };

    const handleUpdate = async (data: PageComponentFormData) => {
        if (!selectedComponent) return;
        setFormLoading(true);
        try {
            await axiosPrivate.put(`/page-components/${selectedComponent._id}`, {
                ...data,
                config: selectedComponent.config, // Đảm bảo không làm mất dữ liệu cấu hình nâng cao hiện có
            });
            toast.success("Component updated successfully");
            setIsEditModalOpen(false);
            fetchAll();
        } catch {
            toast.error("Failed to update component");
        } finally {
            setFormLoading(false);
        }
    };

    // ── Delete ────────────────────────────────────────────────────────────────
    const handleDelete = async () => {
        if (!selectedComponent) return;
        setDeleteLoading(true);
        try {
            await axiosPrivate.delete(`/page-components/${selectedComponent._id}`);
            toast.success("Component deleted successfully");
            setIsDeleteModalOpen(false);
            fetchAll();
        } catch {
            toast.error("Failed to delete component");
        } finally {
            setDeleteLoading(false);
        }
    };

    // ── Shared form body ──────────────────────────────────────────────────────
    const renderFormBody = (form: typeof formAdd) => (
        <>
            <FormField
                control={form.control}
                name="pageType"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>Page Type <span className="text-destructive">*</span></FormLabel>
                        <Select value={field.value} onValueChange={field.onChange}>
                            <FormControl>
                                <SelectTrigger><SelectValue /></SelectTrigger>
                            </FormControl>
                            <SelectContent>
                                {PAGE_TABS.map((o) => (
                                    <SelectItem key={o.key} value={o.key}>{o.label}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <FormMessage />
                    </FormItem>
                )}
            />

            <FormField
                control={form.control}
                name="componentType"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>Component Type <span className="text-destructive">*</span></FormLabel>
                        <Select value={field.value} onValueChange={field.onChange}>
                            <FormControl>
                                <SelectTrigger><SelectValue /></SelectTrigger>
                            </FormControl>
                            <SelectContent>
                                {componentTypes.map((t) => (
                                    <SelectItem key={t.value} value={t.value}>
                                        {t.label || t.value}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <FormMessage />
                    </FormItem>
                )}
            />

            <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>Title <span className="text-destructive">*</span></FormLabel>
                        <FormControl>
                            <Input {...field} placeholder="e.g., Hero Banner, Featured Products" disabled={formLoading} />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )}
            />

            <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                            <textarea
                                {...field}
                                rows={3}
                                placeholder="Optional description for internal reference"
                                disabled={formLoading}
                                className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-none"
                            />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )}
            />

            <FormField
                control={form.control}
                name="displayOrder"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>
                            Display Order (Weight) <span className="text-destructive">*</span>
                            <span className="text-muted-foreground font-normal ml-1.5 text-xs">
                                Lower numbers appear first (0 = top)
                            </span>
                        </FormLabel>
                        <FormControl>
                            <Input
                                type="number"
                                {...field}
                                onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                                disabled={formLoading}
                            />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )}
            />

            <FormField
                control={form.control}
                name="isActive"
                render={({ field }) => (
                    <FormItem>
                        <div className="flex items-center justify-between rounded-lg border p-4">
                            <div className="space-y-0.5">
                                <FormLabel className="text-sm font-medium cursor-pointer">
                                    Active Status
                                </FormLabel>
                                <p className="text-sm text-muted-foreground">
                                    Component is visible on the website
                                </p>
                            </div>
                            <FormControl>
                                <Switch
                                    checked={field.value}
                                    onCheckedChange={field.onChange}
                                    disabled={formLoading}
                                />
                            </FormControl>
                        </div>
                    </FormItem>
                )}
            />
        </>
    );

    // ─── RENDER ───────────────────────────────────────────────────────────────
    return (
        <div className="p-5 space-y-6">

            {/* Read-only banner */}
            {!isAdmin && (
                <div className="flex items-center gap-2 bg-yellow-50 border border-yellow-200 rounded-lg px-4 py-2.5 text-sm text-yellow-800">
                    <AlertCircle className="w-4 h-4 text-yellow-600 shrink-0" />
                    Read-Only Mode: You have full access to view all admin pages and data,
                    but CRUD operations (create, update, delete) are disabled
                </div>
            )}

            {/* Header */}
            <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                    <Settings className="w-8 h-8" />
                    <div>
                        <h1 className="text-3xl font-bold">Website Configuration</h1>
                        <p className="text-muted-foreground text-sm mt-0.5">
                            Manage website components and their display order
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline" onClick={() => fetchAll(true)} disabled={refreshing}>
                        <RefreshCw className={`mr-2 h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
                        {refreshing ? "Refreshing..." : "Refresh"}
                    </Button>
                    {isAdmin && (
                        <Button onClick={handleOpenAdd}>
                            <Plus className="mr-2 h-4 w-4" />
                            Add Component
                        </Button>
                    )}
                </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-1 bg-muted/60 border rounded-xl p-1 w-fit">
                {PAGE_TABS.map((tab) => {
                    const count = (allComponents[tab.key] ?? []).length;
                    const active = activeTab === tab.key;
                    return (
                        <button
                            key={tab.key}
                            onClick={() => setActiveTab(tab.key)}
                            className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${active
                                    ? "bg-background text-foreground shadow-sm"
                                    : "text-muted-foreground hover:text-foreground"
                                }`}
                        >
                            {tab.label}
                            {count > 0 && (
                                <span className={`text-xs font-semibold rounded-full px-1.5 py-px ${active
                                        ? "bg-primary text-primary-foreground"
                                        : "bg-muted-foreground/20 text-muted-foreground"
                                    }`}>
                                    {count}
                                </span>
                            )}
                        </button>
                    );
                })}
            </div>

            {/* Content */}
            {loading ? (
                <div className="flex justify-center items-center min-h-[400px]">
                    <Loader2 className="h-8 w-8 animate-spin" />
                </div>
            ) : (
                <div className="rounded-md border">
                    {/* Section header */}
                    <div className="flex items-center justify-between px-4 py-3 border-b bg-muted/20">
                        <span className="text-sm font-semibold">
                            {PAGE_TABS.find((t) => t.key === activeTab)?.label} Components
                        </span>
                        <span className="text-xs text-muted-foreground border rounded-md px-2.5 py-1 bg-background">
                            {currentComponents.length}{" "}
                            {currentComponents.length === 1 ? "component" : "components"}
                        </span>
                    </div>

                    {/* Empty state */}
                    {currentComponents.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-16 gap-3 text-muted-foreground">
                            <Settings className="w-10 h-10 opacity-20" />
                            <p className="text-sm">No components configured for this page yet</p>
                            {isAdmin && (
                                <Button variant="outline" onClick={handleOpenAdd}>
                                    <Plus className="mr-2 h-4 w-4" />
                                    Add First Component
                                </Button>
                            )}
                        </div>
                    ) : (
                        currentComponents.map((comp, idx) => (
                            <div
                                key={comp._id}
                                draggable={isAdmin}
                                onDragStart={() => { dragItem.current = idx; }}
                                onDragEnter={() => { dragOver.current = idx; }}
                                onDragEnd={handleDragEnd}
                                onDragOver={(e) => e.preventDefault()}
                                className={`flex items-center px-4 py-3 hover:bg-muted/30 transition-colors ${idx < currentComponents.length - 1 ? "border-b" : ""
                                    } ${isAdmin ? "cursor-grab active:cursor-grabbing" : ""}`}
                            >
                                {/* Drag handle */}
                                <GripVertical className="w-4 h-4 text-muted-foreground/40 mr-2 shrink-0" />

                                {/* Order badge */}
                                <div className="w-7 h-7 rounded bg-muted flex items-center justify-center text-xs font-bold text-muted-foreground mr-3 shrink-0">
                                    #{comp.displayOrder}
                                </div>

                                {/* Info */}
                                <div className="flex-1 flex items-center gap-2 min-w-0">
                                    <span className="text-sm font-semibold">{comp.title}</span>
                                    <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded font-mono whitespace-nowrap">
                                        {comp.componentType}
                                    </span>
                                    {!comp.isActive && (
                                        <span className="text-xs font-medium bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded">
                                            Inactive
                                        </span>
                                    )}
                                    {/* Hiển thị nếu loại linh kiện bị tắt ở Master */}
                                    {masterTypes.find(t => t.name === comp.componentType)?.isActive === false && (
                                        <span className="text-xs font-medium bg-red-100 text-red-700 px-2 py-0.5 rounded border border-red-200">
                                            Globally Disabled
                                        </span>
                                    )}
                                </div>

                                {/* Actions */}
                                <div className="flex items-center shrink-0">
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => { setSelectedComponent(comp); setIsViewModalOpen(true); }}
                                    >
                                        <Eye className="h-4 w-4" />
                                    </Button>
                                    {isAdmin && (
                                        <>
                                            <Button variant="ghost" size="icon" onClick={() => handleOpenEdit(comp)}>
                                                <Edit className="h-4 w-4" />
                                            </Button>
                                            <Button variant="ghost" size="icon" onClick={() => { setSelectedComponent(comp); setIsDeleteModalOpen(true); }}>
                                                <Trash className="h-4 w-4" />
                                            </Button>
                                        </>
                                    )}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            )}

            {/* ── MODAL: VIEW ──────────────────────────────────────────────────── */}
            <Dialog open={isViewModalOpen} onOpenChange={setIsViewModalOpen}>
                <DialogContent className="sm:max-w-[440px] max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Component Details</DialogTitle>
                        <DialogDescription>Detailed view of component configuration</DialogDescription>
                    </DialogHeader>

                    {selectedComponent && (
                        <div className="space-y-4 text-sm">
                            {/* Card */}
                            <div className="rounded-lg border bg-muted/30 p-4">
                                <h3 className="font-bold text-base mb-2">{selectedComponent.title}</h3>
                                <div className="flex flex-wrap gap-2">
                                    <span className="text-xs bg-muted px-2 py-0.5 rounded font-mono">
                                        {selectedComponent.componentType}
                                    </span>
                                    <span className={`text-xs font-semibold px-2 py-0.5 rounded ${selectedComponent.isActive
                                            ? "bg-green-100 text-green-700"
                                            : "bg-yellow-100 text-yellow-700"
                                        }`}>
                                        {selectedComponent.isActive ? "Active" : "Inactive"}
                                    </span>
                                    <span className="text-xs bg-muted text-muted-foreground px-2 py-0.5 rounded">
                                        Weight: {selectedComponent.displayOrder}
                                    </span>
                                </div>
                            </div>

                            {/* Basic Info */}
                            <div>
                                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2 flex items-center gap-2">
                                    <span className="w-0.5 h-3.5 bg-primary rounded inline-block" />
                                    Basic Information
                                </p>
                                <div className="rounded-lg border p-3 grid grid-cols-2 gap-x-4 gap-y-3">
                                    <div>
                                        <p className="text-xs text-muted-foreground">Page Type</p>
                                        <p className="font-medium mt-0.5 capitalize">{selectedComponent.pageType}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-muted-foreground">Component Type</p>
                                        <p className="font-medium mt-0.5">{selectedComponent.componentType}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-muted-foreground">Display Order</p>
                                        <p className="font-medium mt-0.5">{selectedComponent.displayOrder}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-muted-foreground">Status</p>
                                        <p className="font-medium mt-0.5">{selectedComponent.isActive ? "Active" : "Inactive"}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Advanced Settings */}
                            <div>
                                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2 flex items-center gap-2">
                                    <span className="w-0.5 h-3.5 bg-primary rounded inline-block" />
                                    Advanced Settings
                                </p>
                                <pre className="rounded-lg border bg-muted/30 p-3 text-xs font-mono overflow-auto max-h-36 whitespace-pre-wrap">
                                    {JSON.stringify(selectedComponent.config ?? {}, null, 2)}
                                </pre>
                            </div>

                            {/* Metadata */}
                            <div>
                                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2 flex items-center gap-2">
                                    <span className="w-0.5 h-3.5 bg-primary rounded inline-block" />
                                    Metadata
                                </p>
                                <div className="rounded-lg border p-3 space-y-2.5">
                                    {[
                                        { label: "Component ID", value: selectedComponent._id },
                                        { label: "Created By", value: selectedComponent.createdBy?.name ?? "{}" },
                                        { label: "Created At", value: fmtDateTime(selectedComponent.createdAt) },
                                        { label: "Last Updated By", value: selectedComponent.updatedBy?.name ?? "{}" },
                                        { label: "Last Updated", value: fmtDateTime(selectedComponent.updatedAt) },
                                    ].map((row) => (
                                        <div key={row.label} className="flex justify-between items-start gap-4 border-b pb-2 last:border-0 last:pb-0">
                                            <span className="text-muted-foreground text-xs shrink-0">{row.label}</span>
                                            <span className="font-medium text-xs text-right break-all">{row.value}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsViewModalOpen(false)}>Close</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* ── MODAL: ADD ───────────────────────────────────────────────────── */}
            <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
                <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Add New Component</DialogTitle>
                        <DialogDescription>Configure a new component for your website page</DialogDescription>
                    </DialogHeader>
                    <Form {...formAdd}>
                        <form onSubmit={formAdd.handleSubmit(handleAdd)} className="space-y-4">
                            {renderFormBody(formAdd)}
                            <DialogFooter>
                                <Button type="button" variant="outline" onClick={() => setIsAddModalOpen(false)} disabled={formLoading}>
                                    Cancel
                                </Button>
                                <Button type="submit" disabled={formLoading}>
                                    {formLoading ? (
                                        <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Creating...</>
                                    ) : "Add Component"}
                                </Button>
                            </DialogFooter>
                        </form>
                    </Form>
                </DialogContent>
            </Dialog>

            {/* ── MODAL: EDIT ──────────────────────────────────────────────────── */}
            <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
                <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Edit Configuration</DialogTitle>
                        <DialogDescription>Update component settings and configuration</DialogDescription>
                    </DialogHeader>
                    <Form {...formEdit}>
                        <form onSubmit={formEdit.handleSubmit(handleUpdate)} className="space-y-4">
                            {renderFormBody(formEdit)}
                            <DialogFooter>
                                <Button type="button" variant="outline" onClick={() => setIsEditModalOpen(false)} disabled={formLoading}>
                                    Cancel
                                </Button>
                                <Button type="submit" disabled={formLoading}>
                                    {formLoading ? (
                                        <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Updating...</>
                                    ) : "Update Component"}
                                </Button>
                            </DialogFooter>
                        </form>
                    </Form>
                </DialogContent>
            </Dialog>

            {/* ── CONFIRM DELETE ───────────────────────────────────────────────── */}
            <AlertDialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete the component{" "}
                            <span className="font-semibold">"{selectedComponent?.title}"</span>.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={deleteLoading}>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDelete}
                            disabled={deleteLoading}
                            className="bg-destructive hover:bg-destructive/90"
                        >
                            {deleteLoading ? (
                                <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Deleting...</>
                            ) : "Delete"}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
};

export default WebsiteConfig;