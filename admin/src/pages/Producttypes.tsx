import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useAxiosPrivate } from "@/hooks/useAxiosPrivate";
import type { ProductType } from "@/lib/type";
import { productTypeSchema } from "@/lib/validation";
import useAuthStore from "@/store/useAuthStore";
import { zodResolver } from "@hookform/resolvers/zod";
import { AxiosError } from "axios";
import { ChevronLeft, ChevronRight, Edit, Loader2, Plus, RefreshCw, Trash } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import z from "zod";

type FormData = z.infer<typeof productTypeSchema>;

const ProductTypes = () => {
  const [productTypes, setProductTypes] = useState<ProductType[]>([]);
  const [total, setTotal] = useState(0);
  const [activeCount, setActiveCount] = useState(0);
  const [page, setPage] = useState(1);
  const [perPage] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [statusFilter, setStatusFilter] = useState<"all" | "Active" | "Inactive">("all");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedProductType, setSelectedProductType] = useState<ProductType | null>(null);
  const [formLoading, setFormLoading] = useState(false);

  const axiosPrivate = useAxiosPrivate();
  const { checkIsAdmin } = useAuthStore();
  const isAdmin = checkIsAdmin();

  const formAdd = useForm<FormData>({
    resolver: zodResolver(productTypeSchema),
    defaultValues: {
      name: "",
      type: "",
      description: "",
      status: "Active",
      color: "",
    },
  });

  const formEdit = useForm<FormData>({
    resolver: zodResolver(productTypeSchema),
    defaultValues: {
      name: "",
      type: "",
      description: "",
      status: "Active",
      color: "",
    },
  });

  const fetchProductTypes = async () => {
    setLoading(true);
    try {
      const params: Record<string, unknown> = { page, perPage };
      if (statusFilter !== "all") params.status = statusFilter;
      if (search) params.search = search;

      const response = await axiosPrivate.get("/product-types", { params });
      setProductTypes(response?.data?.productTypes || []);
      setTotal(response?.data?.total || 0);
      setActiveCount(response?.data?.activeCount || 0);
      setTotalPages(response?.data?.totalPages || 1);
    } catch (error) {
      console.log("Failed to fetch product types", error);
      toast.error("Failed to fetch product types");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProductTypes();
  }, [page, statusFilter]);

  const handleSearch = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      setPage(1);
      fetchProductTypes();
    }
  };

  const handleClearSearch = () => {
    setSearch("");
    setPage(1);
    setTimeout(() => fetchProductTypes(), 0);
  };

  const handlePreviousPage = () => {
    if (page > 1) setPage(page - 1);
  };

  const handleNextPage = () => {
    if (page < totalPages) setPage(page + 1);
  };

  const handleAddProductType = async (data: FormData) => {
    setFormLoading(true);
    try {
      await axiosPrivate.post("/product-types", data);
      toast("Product type created successfully");
      formAdd.reset();
      setIsAddModalOpen(false);
      setPage(1);
      fetchProductTypes();
    } catch (error: unknown) {
      console.log("Failed to create product type", error);
      let errorMessage = "Failed to create product type";
      if (error instanceof AxiosError && error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }
      if (errorMessage.includes("name already exists")) {
        formAdd.setError("name", { type: "manual", message: errorMessage });
      } else if (errorMessage.includes("key already exists")) {
        formAdd.setError("type", { type: "manual", message: errorMessage });
      } else {
        toast(errorMessage);
      }
    } finally {
      setFormLoading(false);
    }
  };

  const handleEdit = (productType: ProductType) => {
    setSelectedProductType(productType);
    formEdit.reset({
      name: productType.name,
      type: productType.type,
      description: productType.description || "",
      status: productType.status,
      color: productType.color || "",
    });
    setIsEditModalOpen(true);
  };

  const handleDelete = (productType: ProductType) => {
    setSelectedProductType(productType);
    setIsDeleteModalOpen(true);
  };

  const handleUpdateProductType = async (data: FormData) => {
    if (!selectedProductType) return;
    setFormLoading(true);
    try {
      await axiosPrivate.put(`/product-types/${selectedProductType._id}`, data);
      toast("Product type updated successfully");
      setIsEditModalOpen(false);
      fetchProductTypes();
    } catch (error: unknown) {
      console.log("Failed to update product type", error);
      let errorMessage = "Failed to update product type";
      if (error instanceof AxiosError && error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }
      if (errorMessage.includes("name already exists")) {
        formEdit.setError("name", { type: "manual", message: errorMessage });
      } else if (errorMessage.includes("key already exists")) {
        formEdit.setError("type", { type: "manual", message: errorMessage });
      } else {
        toast(errorMessage);
      }
    } finally {
      setFormLoading(false);
    }
  };

  const handleDeleteProductType = async () => {
    if (!selectedProductType) return;
    try {
      await axiosPrivate.delete(`/product-types/${selectedProductType._id}`);
      toast("Product type deleted successfully");
      setIsDeleteModalOpen(false);
      setPage(1);
      fetchProductTypes();
    } catch (error) {
      console.log("Failed to delete product type", error);
      toast("Failed to delete product type");
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      const params: Record<string, unknown> = { page, perPage };
      if (statusFilter !== "all") params.status = statusFilter;
      if (search) params.search = search;

      const response = await axiosPrivate.get("/product-types", { params });
      setProductTypes(response?.data?.productTypes || []);
      setTotal(response?.data?.total || 0);
      setActiveCount(response?.data?.activeCount || 0);
      setTotalPages(response?.data?.totalPages || 1);
      toast("Product types refreshed successfully");
    } catch (error) {
      console.log("Failed to refresh", error);
      toast("Failed to refresh");
    } finally {
      setRefreshing(false);
    }
  };

  return (
    <div className="p-5 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Product Types</h1>
          <p className="text-sm text-muted-foreground">Manage product classification types</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={handleRefresh} disabled={refreshing}>
            <RefreshCw className={`mr-2 h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
            {refreshing ? "Refreshing ..." : "Refresh"}
          </Button>
          <Select value={statusFilter} onValueChange={(val) => { setStatusFilter(val as "all" | "Active" | "Inactive"); setPage(1); }}>
            <SelectTrigger className="w-40 bg-background text-sm shadow-sm">
              <SelectValue placeholder="Filter Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="Active">Active</SelectItem>
              <SelectItem value="Inactive">Inactive</SelectItem>
            </SelectContent>
          </Select>
          {isAdmin && (
            <Button onClick={() => setIsAddModalOpen(true)}>
              <Plus className="mr-2 h-4 w-4" /> Add Product Type
            </Button>
          )}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-4 gap-4">
        <div className="rounded-lg border p-4 space-y-1">
          <p className="text-sm text-muted-foreground">Total Product Types</p>
          <p className="text-2xl font-bold">{total}</p>
        </div>
        <div className="rounded-lg border p-4 space-y-1">
          <p className="text-sm text-muted-foreground">Active</p>
          <p className="text-2xl font-bold">{activeCount}</p>
        </div>
        <div className="rounded-lg border p-4 space-y-1">
          <p className="text-sm text-muted-foreground">Current Page</p>
          <p className="text-2xl font-bold">{page} of {totalPages}</p>
        </div>
        <div className="rounded-lg border p-4 space-y-1">
          <p className="text-sm text-muted-foreground">Per Page</p>
          <p className="text-2xl font-bold">{perPage}</p>
        </div>
      </div>

      {/* Search */}
      <div className="rounded-md border p-4 space-y-3">
        <p className="font-medium">Search & Filters</p>
        <div className="flex items-center gap-2">
          <Input
            placeholder="Search by name, type, or description..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={handleSearch}
            className="flex-1"
          />
          {search && (
            <Button variant="ghost" size="sm" onClick={handleClearSearch}>
              ✕ Clear
            </Button>
          )}
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      ) : (
        <>
          <p className="text-sm text-muted-foreground">Showing {productTypes.length} of {total} product types</p>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[50px]">#</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Color</TableHead>
                  <TableHead>Created</TableHead>
                  {isAdmin && <TableHead className="text-right">Actions</TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {productTypes.map((pt, index) => (
                  <TableRow key={pt._id}>
                    <TableCell>{(page - 1) * perPage + index + 1}</TableCell>
                    <TableCell className="font-medium">{pt.name}</TableCell>
                    <TableCell>
                      <span className="rounded-full border px-2 py-0.5 text-xs font-mono">
                        {pt.type}
                      </span>
                    </TableCell>
                    <TableCell className="max-w-[260px] truncate text-sm text-muted-foreground">
                      {pt.description || "—"}
                    </TableCell>
                    <TableCell>
                      <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${pt.status === "Active" ? "bg-black text-white" : "bg-muted text-muted-foreground"}`}>
                        {pt.status}
                      </span>
                    </TableCell>
                    <TableCell>
                      {pt.color ? (
                        <div className="flex items-center gap-2">
                          <div className="h-5 w-5 rounded border" style={{ backgroundColor: pt.color }} />
                          <span className="text-xs text-muted-foreground">{pt.color}</span>
                        </div>
                      ) : (
                        <span className="text-xs text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell>{new Date(pt.createdAt).toLocaleDateString()}</TableCell>
                    {isAdmin && (
                      <TableCell className="text-right">
                        <Button variant="ghost" size="icon" onClick={() => handleEdit(pt)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDelete(pt)}>
                          <Trash className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    )}
                  </TableRow>
                ))}
                {productTypes.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={isAdmin ? 8 : 7} className="text-center py-10 text-muted-foreground">
                      No product types found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          {total > 0 && (
            <div className="flex items-center justify-between">
              <div className="text-sm text-muted-foreground">
                Showing {(page - 1) * perPage + 1} to {Math.min(page * perPage, total)} of {total} product types
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={handlePreviousPage} disabled={page === 1}>
                  <ChevronLeft className="h-4 w-4 mr-2" />
                  Previous
                </Button>
                <Button variant="outline" size="sm" onClick={handleNextPage} disabled={page === totalPages}>
                  Next
                  <ChevronRight className="h-4 w-4 ml-2" />
                </Button>
              </div>
            </div>
          )}
        </>
      )}

      {/* Add Modal */}
      <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Add Product Type</DialogTitle>
            <DialogDescription>Create a new product classification type</DialogDescription>
          </DialogHeader>
          <Form {...formAdd}>
            <form onSubmit={formAdd.handleSubmit(handleAddProductType)} className="space-y-4">
              <FormField control={formAdd.control} name="name" render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl><Input {...field} disabled={formLoading} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={formAdd.control} name="type" render={({ field }) => (
                <FormItem>
                  <FormLabel>Type Key</FormLabel>
                  <FormControl><Input {...field} disabled={formLoading} placeholder="_example_type" /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={formAdd.control} name="description" render={({ field }) => (
                <FormItem>
                  <FormLabel>Description (Optional)</FormLabel>
                  <FormControl><Input {...field} disabled={formLoading} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={formAdd.control} name="status" render={({ field }) => (
                <FormItem>
                  <FormLabel>Status</FormLabel>
                  <FormControl>
                    <select {...field} disabled={formLoading} className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2">
                      <option value="Active">Active</option>
                      <option value="Inactive">Inactive</option>
                    </select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={formAdd.control} name="color" render={({ field }) => (
                <FormItem>
                  <FormLabel>Color (Optional)</FormLabel>
                  <FormControl>
                    <div className="flex items-center gap-2">
                      <Input {...field} disabled={formLoading} placeholder="#000000" />
                      {field.value && (
                        <div className="h-9 w-9 rounded border flex-shrink-0" style={{ backgroundColor: field.value }} />
                      )}
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsAddModalOpen(false)} disabled={formLoading}>Cancel</Button>
                <Button type="submit" disabled={formLoading}>
                  {formLoading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Creating ...</> : "Create Product Type"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Edit Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Product Type</DialogTitle>
            <DialogDescription>Update product type information</DialogDescription>
          </DialogHeader>
          <Form {...formEdit}>
            <form onSubmit={formEdit.handleSubmit(handleUpdateProductType)} className="space-y-4">
              <FormField control={formEdit.control} name="name" render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl><Input {...field} disabled={formLoading} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={formEdit.control} name="type" render={({ field }) => (
                <FormItem>
                  <FormLabel>Type Key</FormLabel>
                  <FormControl><Input {...field} disabled={formLoading} placeholder="_example_type" /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={formEdit.control} name="description" render={({ field }) => (
                <FormItem>
                  <FormLabel>Description (Optional)</FormLabel>
                  <FormControl><Input {...field} disabled={formLoading} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={formEdit.control} name="status" render={({ field }) => (
                <FormItem>
                  <FormLabel>Status</FormLabel>
                  <FormControl>
                    <select {...field} disabled={formLoading} className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2">
                      <option value="Active">Active</option>
                      <option value="Inactive">Inactive</option>
                    </select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={formEdit.control} name="color" render={({ field }) => (
                <FormItem>
                  <FormLabel>Color (Optional)</FormLabel>
                  <FormControl>
                    <div className="flex items-center gap-2">
                      <Input {...field} disabled={formLoading} placeholder="#000000" />
                      {field.value && (
                        <div className="h-9 w-9 rounded border flex-shrink-0" style={{ backgroundColor: field.value }} />
                      )}
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsEditModalOpen(false)} disabled={formLoading}>Cancel</Button>
                <Button type="submit" disabled={formLoading}>
                  {formLoading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Updating ...</> : "Update Product Type"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Delete Modal */}
      <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Are you sure?</DialogTitle>
            <DialogDescription>
              This action cannot be undone. This will permanently delete the product type{" "}
              <span className="font-semibold">{selectedProductType?.name}</span>.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setIsDeleteModalOpen(false)} disabled={formLoading}>Cancel</Button>
            <Button type="submit" disabled={formLoading} onClick={handleDeleteProductType} className="bg-destructive hover:bg-destructive/90">
              {formLoading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Deleting ...</> : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ProductTypes;
