/* eslint-disable react-hooks/exhaustive-deps */
import { useState, useEffect } from "react";
import { useAxiosPrivate } from "@/hooks/useAxiosPrivate";
import useAuthStore from "@/store/useAuthStore";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
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
import { Badge } from "@/components/ui/badge";
import { Tag, Edit, Loader2, Plus, Trash, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import ImageUpLoad from "@/components/ui/image.upload";
import { adsBannerSchema } from "@/lib/validation";
import { AdsBanner, ProductType } from "@/lib/type";

type FormData = z.infer<typeof adsBannerSchema>;

const defaultValues: FormData = {
  name: "",
  title: "",
  image: "",
  type: "advertisement",
  order: 0,
  status: "Active",
};

export default function AdsBannersPage() {
  const [banners, setBanners] = useState<AdsBanner[]>([]);
  const [productTypes, setProductTypes] = useState<ProductType[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedBanner, setSelectedBanner] = useState<AdsBanner | null>(null);
  const [formLoading, setFormLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const axiosPrivate = useAxiosPrivate();
  const { checkIsAdmin } = useAuthStore();
  const isAdmin = checkIsAdmin();

  const formAdd = useForm<FormData, unknown, FormData>({
    resolver: zodResolver(adsBannerSchema),
    defaultValues,
  });

  const formEdit = useForm<FormData, unknown, FormData>({
    resolver: zodResolver(adsBannerSchema),
    defaultValues,
  });

  const fetchBanners = async () => {
    try {
      const response = await axiosPrivate.get("/ads-banners");
      setBanners(response.data);
    } catch (error) {
      console.log("Failed to load ads banners", error);
      toast.error("Failed to load ads banners");
    } finally {
      setLoading(false);
    }
  };
const fetchProductTypes = async () => {
    try {
        const response = await axiosPrivate.get("/product-types");
        
        // API có thể trả về { data: [...] } hoặc trực tiếp [...]
        const data = response.data;
        setProductTypes(Array.isArray(data) ? data : data.data ?? data.productTypes ?? []);
    } catch (error) {
        console.log("Failed to load product types", error);
        setProductTypes([]); // 👈 tránh crash
    }
};

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      const response = await axiosPrivate.get("/ads-banners");
      setBanners(response.data);
      toast.success("Refreshed successfully");
    } catch (error) {
      console.log("Failed to refresh", error);
      toast.error("Failed to refresh");
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchBanners();
    fetchProductTypes();
  }, []);

  const getTitleName = (banner: AdsBanner) => {
    if (typeof banner.title === "object" && banner.title !== null) {
      return banner.title.name;
    }
    return banner.title as string;
  };

  const handleEdit = (banner: AdsBanner) => {
    setSelectedBanner(banner);
    formEdit.reset({
      name: banner.name,
      title: typeof banner.title === "object" ? banner.title._id : banner.title,
      image: banner.image ?? "",
      type: banner.type,
      order: banner.order,
      status: banner.status,
    });
    setIsEditModalOpen(true);
  };

  const handleDelete = (banner: AdsBanner) => {
    setSelectedBanner(banner);
    setIsDeleteModalOpen(true);
  };

  const handleAddBanner = async (data: FormData) => {
    setFormLoading(true);
    try {
      await axiosPrivate.post("/ads-banners", {
        ...data,
        order: Number(data.order),
      });
      toast.success("Ads banner created successfully");
      formAdd.reset(defaultValues);
      setIsAddModalOpen(false);
      fetchBanners();
    } catch (error) {
      console.log("Failed to create", error);
      toast.error("Failed to create ads banner");
    } finally {
      setFormLoading(false);
    }
  };

  const handleUpdateBanner = async (data: FormData) => {
    if (!selectedBanner) return;
    setFormLoading(true);
    try {
      await axiosPrivate.put(`/ads-banners/${selectedBanner._id}`, {
        ...data,
        order: Number(data.order),
      });
      toast.success("Ads banner updated successfully");
      setIsEditModalOpen(false);
      fetchBanners();
    } catch (error) {
      console.log("Failed to update", error);
      toast.error("Failed to update ads banner");
    } finally {
      setFormLoading(false);
    }
  };

  const handleDeleteBanner = async () => {
    if (!selectedBanner) return;
    try {
      await axiosPrivate.delete(`/ads-banners/${selectedBanner._id}`);
      toast.success("Ads banner deleted successfully");
      setIsDeleteModalOpen(false);
      fetchBanners();
    } catch (error) {
      console.log("Failed to delete", error);
      toast.error("Failed to delete ads banner");
    }
  };

  return (
    <div className="p-5 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Ads Banners</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Manage advertisement banners for your website
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={handleRefresh} disabled={refreshing}>
            <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
          </Button>
          {isAdmin && (
            <Button onClick={() => setIsAddModalOpen(true)}>
              <Plus className="mr-2 h-4 w-4" /> Add Banner
            </Button>
          )}
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <div className="flex justify-center items-center min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      ) : (
        <div className="rounded-md border">
          <div className="flex items-center gap-2 px-4 py-3 border-b">
            <Tag className="h-4 w-4 text-muted-foreground" />
            <span className="font-medium text-sm">
              Ads Banners ({banners.length})
            </span>
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[100px]">Image</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Title</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Order</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {banners.map((banner) => (
                <TableRow key={banner._id}>
                  <TableCell>
                    <div className="h-14 w-20 rounded overflow-hidden bg-muted">
                      {banner.image ? (
                        <img
                          src={banner.image}
                          alt={banner.name}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="h-full w-full flex items-center justify-center text-xs text-muted-foreground">
                          No image
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="font-medium">{banner.name}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {getTitleName(banner)}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{banner.type}</Badge>
                  </TableCell>
                  <TableCell>{banner.order}</TableCell>
                  <TableCell>
                    <Badge
                      className={
                        banner.status === "Active"
                          ? "bg-black text-white hover:bg-black/80"
                          : "bg-muted text-muted-foreground"
                      }
                    >
                      {banner.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    {isAdmin ? (
                      <>
                        <Button variant="ghost" size="icon" onClick={() => handleEdit(banner)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDelete(banner)}>
                          <Trash className="h-4 w-4" />
                        </Button>
                      </>
                    ) : (
                      <span className="text-sm text-muted-foreground">View only</span>
                    )}
                  </TableCell>
                </TableRow>
              ))}
              {banners.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-10 text-muted-foreground">
                    No ads banners found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      )}

      {/* ===== ADD MODAL ===== */}
      <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Add Ads Banner</DialogTitle>
            <DialogDescription>Create a new advertisement banner</DialogDescription>
          </DialogHeader>
          <Form {...formAdd}>
            <form onSubmit={formAdd.handleSubmit(handleAddBanner)} className="space-y-4">
              <FormField control={formAdd.control} name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input {...field} disabled={formLoading} placeholder="e.g. Baby Deals" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField control={formAdd.control} name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value} disabled={formLoading}>
                      <FormControl>
                        <SelectTrigger><SelectValue placeholder="Select a title" /></SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {productTypes.map((pt) => (
                          <SelectItem key={pt._id} value={pt._id}>{pt.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-2 gap-4">
                <FormField control={formAdd.control} name="type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Type</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value} disabled={formLoading}>
                        <FormControl>
                          <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="advertisement">Advertisement</SelectItem>
                          <SelectItem value="promotion">Promotion</SelectItem>
                          <SelectItem value="banner">Banner</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField control={formAdd.control} name="order"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Order</FormLabel>
                      <FormControl>
                        <Input {...field} type="number" min="0" disabled={formLoading}
                          onChange={(e) => field.onChange(parseInt(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField control={formAdd.control} name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value} disabled={formLoading}>
                      <FormControl>
                        <SelectTrigger><SelectValue placeholder="Select status" /></SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Active">Active</SelectItem>
                        <SelectItem value="Inactive">Inactive</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField control={formAdd.control} name="image"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Banner Image</FormLabel>
                    <FormControl>
                      <ImageUpLoad value={field.value ?? ""} onChange={field.onChange} disabled={formLoading} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsAddModalOpen(false)} disabled={formLoading}>
                  Cancel
                </Button>
                <Button type="submit" disabled={formLoading}>
                  {formLoading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Creating...</> : "Create Banner"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* ===== EDIT MODAL ===== */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="sm:max-w-[600px] sm:max-h-[600px] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Ads Banner</DialogTitle>
            <DialogDescription>Update banner information</DialogDescription>
          </DialogHeader>
          <Form {...formEdit}>
            <form onSubmit={formEdit.handleSubmit(handleUpdateBanner)} className="space-y-4">
              <FormField control={formEdit.control} name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input {...field} disabled={formLoading} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField control={formEdit.control} name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value} disabled={formLoading}>
                      <FormControl>
                        <SelectTrigger><SelectValue placeholder="Select a title" /></SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {productTypes.map((pt) => (
                          <SelectItem key={pt._id} value={pt._id}>{pt.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-2 gap-4">
                <FormField control={formEdit.control} name="type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Type</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value} disabled={formLoading}>
                        <FormControl>
                          <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="advertisement">Advertisement</SelectItem>
                          <SelectItem value="promotion">Promotion</SelectItem>
                          <SelectItem value="banner">Banner</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField control={formEdit.control} name="order"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Order</FormLabel>
                      <FormControl>
                        <Input {...field} type="number" min="0" disabled={formLoading}
                          onChange={(e) => field.onChange(parseInt(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField control={formEdit.control} name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value} disabled={formLoading}>
                      <FormControl>
                        <SelectTrigger><SelectValue placeholder="Select status" /></SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Active">Active</SelectItem>
                        <SelectItem value="Inactive">Inactive</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField control={formEdit.control} name="image"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Banner Image</FormLabel>
                    <FormControl>
                      <ImageUpLoad value={field.value ?? ""} onChange={field.onChange} disabled={formLoading} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsEditModalOpen(false)} disabled={formLoading}>
                  Cancel
                </Button>
                <Button type="submit" disabled={formLoading}>
                  {formLoading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Updating...</> : "Update Banner"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* ===== DELETE MODAL ===== */}
      <AlertDialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete{" "}
              <span className="font-semibold">{selectedBanner?.name}</span>.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteBanner} className="bg-destructive hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}