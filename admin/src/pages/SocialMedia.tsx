import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useAxiosPrivate } from "@/hooks/useAxiosPrivate";
import type { SocialMedia } from "@/lib/type";
import { socialMediaSchema } from "@/lib/validation";
import useAuthStore from "@/store/useAuthStore";
import { zodResolver } from "@hookform/resolvers/zod";
import { AxiosError } from "axios";
import {
  ChevronLeft, ChevronRight, Edit, ExternalLink, Facebook,
  Filter, Globe, Instagram, Linkedin, Loader2,
  MessageCircle, Plus, RefreshCw, Send, Share2,
  Trash, Twitter, Youtube
} from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import z from "zod";

type FormData = z.infer<typeof socialMediaSchema>;

const PLATFORMS = [
  "Facebook", "Instagram", "Twitter", "LinkedIn",
  "YouTube", "TikTok", "Pinterest", "WhatsApp", "Telegram", "Other"
] as const;

const getPlatformIcon = (platform: string) => {
  switch (platform) {
    case "Facebook": return <Facebook className="h-4 w-4" />;
    case "Instagram": return <Instagram className="h-4 w-4" />;
    case "Twitter": return <Twitter className="h-4 w-4" />;
    case "LinkedIn": return <Linkedin className="h-4 w-4" />;
    case "YouTube": return <Youtube className="h-4 w-4" />;
    case "TikTok": return <Share2 className="h-4 w-4" />;
    case "Pinterest": return <Filter className="h-4 w-4" />;
    case "WhatsApp": return <MessageCircle className="h-4 w-4" />;
    case "Telegram": return <Send className="h-4 w-4" />;
    default: return <Globe className="h-4 w-4" />;
  }
};

const SocialMediaPage = () => {
  const [socialMediaLinks, setSocialMediaLinks] = useState<SocialMedia[]>([]);
  const [total, setTotal] = useState(0);
  const [activeCount, setActiveCount] = useState(0);
  const [platformCount, setPlatformCount] = useState(0);
  const [page, setPage] = useState(1);
  const [perPage] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [platformFilter, setPlatformFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<SocialMedia | null>(null);
  const [formLoading, setFormLoading] = useState(false);
  const [showFilters, setShowFilters] = useState(true);

  const axiosPrivate = useAxiosPrivate();
  const { checkIsAdmin } = useAuthStore();
  const isAdmin = checkIsAdmin();

  const formAdd = useForm<FormData>({
    resolver: zodResolver(socialMediaSchema),
    defaultValues: {
      name: "", platform: "Facebook", url: "",
      icon: "", order: 0, isActive: true,
    },
  });

  const formEdit = useForm<FormData>({
    resolver: zodResolver(socialMediaSchema),
    defaultValues: {
      name: "", platform: "Facebook", url: "",
      icon: "", order: 0, isActive: true,
    },
  });

  const buildParams = () => {
    const params: Record<string, unknown> = { page, perPage, sortOrder };
    if (platformFilter !== "all") params.platform = platformFilter;
    if (search) params.search = search;
    return params;
  };

  const fetchData = async (showLoader = true) => {
    if (showLoader) setLoading(true);
    try {
      const response = await axiosPrivate.get("/social-media", { params: buildParams() });
      setSocialMediaLinks(response?.data?.socialMediaLinks || []);
      setTotal(response?.data?.total || 0);
      setActiveCount(response?.data?.activeCount || 0);
      setPlatformCount(response?.data?.platformCount || 0);
      setTotalPages(response?.data?.totalPages || 1);
    } catch (error) {
      console.log("Failed to fetch social media links", error);
      toast.error("Failed to fetch social media links");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, [page, platformFilter, sortOrder]);

  const handleSearch = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") { setPage(1); fetchData(); }
  };

  const handleClearSearch = () => {
    setSearch("");
    setPage(1);
    setTimeout(() => fetchData(), 0);
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      const response = await axiosPrivate.get("/social-media", { params: buildParams() });
      setSocialMediaLinks(response?.data?.socialMediaLinks || []);
      setTotal(response?.data?.total || 0);
      setActiveCount(response?.data?.activeCount || 0);
      setPlatformCount(response?.data?.platformCount || 0);
      setTotalPages(response?.data?.totalPages || 1);
      toast.success("Refreshed successfully");
    } catch {
      toast.error("Failed to refresh");
    } finally {
      setRefreshing(false);
    }
  };

  const handleAdd = async (data: FormData) => {
    setFormLoading(true);
    try {
      await axiosPrivate.post("/social-media", data);
      toast.success("Social media link created successfully");
      formAdd.reset();
      setIsAddModalOpen(false);
      setPage(1);
      fetchData();
    } catch (error: unknown) {
      let errorMessage = "Failed to create social media link";
      if (error instanceof AxiosError && error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }
      toast.error(errorMessage);
    } finally {
      setFormLoading(false);
    }
  };

  const handleEdit = (item: SocialMedia) => {
    setSelectedItem(item);
    formEdit.reset({
      name: item.name,
      platform: item.platform,
      url: item.url,
      icon: item.icon || "",
      order: item.order,
      isActive: item.isActive,
    });
    setIsEditModalOpen(true);
  };

  const handleUpdate = async (data: FormData) => {
    if (!selectedItem) return;
    setFormLoading(true);
    try {
      await axiosPrivate.put(`/social-media/${selectedItem._id}`, data);
      toast.success("Social media link updated successfully");
      setIsEditModalOpen(false);
      fetchData();
    } catch (error: unknown) {
      let errorMessage = "Failed to update social media link";
      if (error instanceof AxiosError && error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }
      toast.error(errorMessage);
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = (item: SocialMedia) => {
    setSelectedItem(item);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedItem) return;
    try {
      await axiosPrivate.delete(`/social-media/${selectedItem._id}`);
      toast.success("Social media link deleted successfully");
      setIsDeleteModalOpen(false);
      setPage(1);
      fetchData();
    } catch {
      toast.error("Failed to delete social media link");
    }
  };

  const SocialMediaForm = ({ form, onSubmit, submitLabel }: {
    form: ReturnType<typeof useForm<FormData>>;
    onSubmit: (data: FormData) => void;
    submitLabel: string;
  }) => (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField control={form.control} name="name" render={({ field }) => (
          <FormItem>
            <FormLabel>Name *</FormLabel>
            <FormControl><Input {...field} disabled={formLoading} placeholder="e.g. Baby Mart Ecommerce" /></FormControl>
            <FormMessage />
          </FormItem>
        )} />
        <FormField control={form.control} name="platform" render={({ field }) => (
          <FormItem>
            <FormLabel>Platform *</FormLabel>
            <Select onValueChange={field.onChange} value={field.value} disabled={formLoading}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Select platform" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {PLATFORMS.map((p) => (
                  <SelectItem key={p} value={p}>
                    <div className="flex items-center gap-2">
                      {getPlatformIcon(p)}
                      {p}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )} />
        <FormField control={form.control} name="url" render={({ field }) => (
          <FormItem>
            <FormLabel>URL *</FormLabel>
            <FormControl><Input {...field} disabled={formLoading} placeholder="https://..." /></FormControl>
            <FormMessage />
          </FormItem>
        )} />
        <div className="grid grid-cols-2 gap-4">
          <FormField control={form.control} name="order" render={({ field }) => (
            <FormItem>
              <FormLabel>Display Order</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  disabled={formLoading}
                  value={field.value}
                  onChange={(e) => field.onChange(Number(e.target.value))}
                />
              </FormControl>
              <p className="text-xs text-muted-foreground">Lower numbers appear first</p>
              <FormMessage />
            </FormItem>
          )} />
          <FormField control={form.control} name="isActive" render={({ field }) => (
            <FormItem>
              <FormLabel>Active</FormLabel>
              <div className="rounded-md border p-3 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">Active</p>
                  <p className="text-xs text-muted-foreground">Show on website</p>
                </div>
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    disabled={formLoading}
                  />
                </FormControl>
              </div>
              <FormMessage />
            </FormItem>
          )} />
        </div>
        <DialogFooter>
          <Button type="button" variant="outline" disabled={formLoading}
            onClick={() => { setIsAddModalOpen(false); setIsEditModalOpen(false); }}>
            Cancel
          </Button>
          <Button type="submit" disabled={formLoading}>
            {formLoading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />{submitLabel}...</> : submitLabel}
          </Button>
        </DialogFooter>
      </form>
    </Form>
  );

  return (
    <div className="p-5 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Social Media</h1>
          <p className="text-sm text-muted-foreground">Manage your social media links and integrations</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={handleRefresh} disabled={refreshing}>
            <RefreshCw className={`mr-2 h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
            {refreshing ? "Refreshing..." : "Refresh"}
          </Button>
          {isAdmin && (
            <Button onClick={() => setIsAddModalOpen(true)}>
              <Plus className="mr-2 h-4 w-4" /> Add Social Media
            </Button>
          )}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-3 gap-4">
        <div className="rounded-lg border p-4 flex justify-between items-start">
          <div>
            <p className="text-sm text-muted-foreground">Total Social Media Links</p>
            <p className="text-2xl font-bold">{total}</p>
          </div>
          <Share2 className="h-5 w-5 text-muted-foreground" />
        </div>
        <div className="rounded-lg border p-4 flex justify-between items-start">
          <div>
            <p className="text-sm text-muted-foreground">Active Links</p>
            <p className="text-2xl font-bold">{activeCount}</p>
          </div>
          <span className="text-xs border border-green-500 text-green-600 rounded-full px-2 py-0.5">Active</span>
        </div>
        <div className="rounded-lg border p-4 flex justify-between items-start">
          <div>
            <p className="text-sm text-muted-foreground">Platforms</p>
            <p className="text-2xl font-bold">{platformCount}</p>
          </div>
          <Filter className="h-5 w-5 text-muted-foreground" />
        </div>
      </div>

      {/* Filters */}
      <div className="rounded-md border p-4 space-y-3">
        <div className="flex items-center justify-between">
          <p className="font-medium flex items-center gap-2">
            <Filter className="h-4 w-4" /> Filters
          </p>
          <Button variant="ghost" size="sm" onClick={() => setShowFilters(!showFilters)}>
            {showFilters ? "Hide Filters" : "Show Filters"}
          </Button>
        </div>
        {showFilters && (
          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex items-center gap-2 flex-1 min-w-[200px]">
              <Input
                placeholder="Search..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={handleSearch}
                className="flex-1"
              />
              {search && (
                <Button variant="ghost" size="sm" onClick={handleClearSearch}>✕</Button>
              )}
            </div>
            <Select value={platformFilter} onValueChange={(val) => { setPlatformFilter(val); setPage(1); }}>
              <SelectTrigger className="w-44">
                <SelectValue placeholder="All Platforms" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Platforms</SelectItem>
                {PLATFORMS.map((p) => (
                  <SelectItem key={p} value={p}>{p}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={sortOrder} onValueChange={(val) => { setSortOrder(val as "asc" | "desc"); setPage(1); }}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="desc">Newest First</SelectItem>
                <SelectItem value="asc">Oldest First</SelectItem>
              </SelectContent>
            </Select>
            <Select value={String(perPage)} onValueChange={() => { }}>
              <SelectTrigger className="w-36">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="10">10 per page</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}
      </div>

      {loading ? (
        <div className="flex justify-center items-center min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      ) : (
        <>
          <p className="text-sm text-muted-foreground">
            Showing {socialMediaLinks.length} of {total} links
          </p>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[60px]">Icon</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Platform</TableHead>
                  <TableHead>URL</TableHead>
                  <TableHead>Order</TableHead>
                  <TableHead>Status</TableHead>
                  {isAdmin && <TableHead className="text-right">Actions</TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {socialMediaLinks.map((item) => (
                  <TableRow key={item._id}>
                    <TableCell>
                      <div className="flex items-center justify-center h-8 w-8 rounded-md border bg-muted">
                        {getPlatformIcon(item.platform)}
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">{item.name}</TableCell>
                    <TableCell>
                      <span className="rounded-full border px-2 py-0.5 text-xs">
                        {item.platform}
                      </span>
                    </TableCell>
                    <TableCell>

                      <a
                        href={item.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-500 hover:underline flex items-center gap-1 text-sm max-w-[260px] truncate"
                      >
                        {item.url}
                        <ExternalLink className="h-3 w-3 flex-shrink-0" />
                      </a>
                    </TableCell>
                    <TableCell>{item.order}</TableCell>
                    <TableCell>
                      <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${item.isActive ? "bg-black text-white" : "bg-muted text-muted-foreground"}`}>
                        {item.isActive ? "Active" : "Inactive"}
                      </span>
                    </TableCell>
                    {isAdmin && (
                      <TableCell className="text-right">
                        <Button variant="ghost" size="icon" onClick={() => handleEdit(item)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDelete(item)}>
                          <Trash className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    )}
                  </TableRow>
                ))}
                {socialMediaLinks.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={isAdmin ? 7 : 6} className="text-center py-10 text-muted-foreground">
                      No social media links found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          {total > 0 && (
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                Showing {(page - 1) * perPage + 1} to {Math.min(page * perPage, total)} of {total} links
              </p>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={() => setPage(p => p - 1)} disabled={page === 1}>
                  <ChevronLeft className="h-4 w-4 mr-2" /> Previous
                </Button>
                <Button variant="outline" size="sm" onClick={() => setPage(p => p + 1)} disabled={page === totalPages}>
                  Next <ChevronRight className="h-4 w-4 ml-2" />
                </Button>
              </div>
            </div>
          )}
        </>
      )}

      {/* Add Modal */}
      <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
        <DialogContent className="sm:max-w-[480px]">
          <DialogHeader>
            <DialogTitle>Add Social Media Link</DialogTitle>
            <DialogDescription>Add a new social media link and integration</DialogDescription>
          </DialogHeader>
          <SocialMediaForm form={formAdd} onSubmit={handleAdd} submitLabel="Create" />
        </DialogContent>
      </Dialog>

      {/* Edit Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="sm:max-w-[480px]">
          <DialogHeader>
            <DialogTitle>Edit Social Media Link</DialogTitle>
            <DialogDescription>Update social media link details</DialogDescription>
          </DialogHeader>
          <SocialMediaForm form={formEdit} onSubmit={handleUpdate} submitLabel="Update" />
        </DialogContent>
      </Dialog>

      {/* Delete Modal */}
      <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Are you sure?</DialogTitle>
            <DialogDescription>
              This action cannot be undone. This will permanently delete{" "}
              <span className="font-semibold">{selectedItem?.name}</span>.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteModalOpen(false)}>Cancel</Button>
            <Button onClick={handleConfirmDelete} className="bg-destructive hover:bg-destructive/90">
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SocialMediaPage;