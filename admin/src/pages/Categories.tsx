import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import ImageUpLoad from "@/components/ui/image.upload";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useAxiosPrivate } from "@/hooks/useAxiosPrivate";
import type { Category } from "@/lib/type";
import { categorySchema } from "@/lib/validation";
import useAuthStore from "@/store/useAuthStore";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowDown, ArrowUp, ChevronFirst, ChevronLeft, Edit, Loader2, Plus, RefreshCw, Trash } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import z from "zod";

type FormData = z.infer<typeof categorySchema>;

const Categories = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1); // Default page = 1
  const [perPage] = useState(10); // Default perPage = 10
  const [totalPages, setTotalPages] = useState(1); // Track total pages
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc")  // default asc
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [formLoading, setFormLoading] = useState(false);

  const axiosPrivate = useAxiosPrivate();
  const { checkIsAdmin } = useAuthStore();
  const isAdmin = checkIsAdmin();

  const formAdd = useForm<FormData>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      name: "",
      image: "",
      categoryType: "Featured",
    },
  });

  const formEdit = useForm<FormData>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      name: "",
      image: "",
      categoryType: "Featured",
    },
  });

  const handleAddCategory = async () => { };

  return (
    <div className="p-5 space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-end gap-3">
          <h1 className="text-3xl font-bold">Categories</h1>
          <p className="text-sm font-medium">
            Total <span className="font-bold">{total}</span>
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            // onClick={handleRefresh}
            disabled={refreshing}
          >
            <RefreshCw
              className={`mr-2 h-4 w-4 ${refreshing ? "animate-spin" : ""}`}
            />
            {refreshing ? "Refreshing ..." : "Refresh"}
          </Button>
          <Select
            value={sortOrder}
          // onValueChange={handleSortChange}
          >
            <SelectTrigger className="w-40 bg-background text-sm shadow-sm">
              <SelectValue placeholder="Sort Order" />
            </SelectTrigger>
            <SelectContent className="">
              <SelectItem value="asc" className="flex items-center">
                <span className="flex items-center">
                  <ArrowUp className="mr-2 h-4 w-4" />
                  Ascending
                </span>
              </SelectItem>
              <SelectItem value="desc" className="flex items-center">
                <span className="flex items-center">
                  <ArrowDown className="mr-2 h-4 w-4" />
                  Descending
                </span>
              </SelectItem>
            </SelectContent>
          </Select>
          {isAdmin && (
            <Button onClick={() => setIsAddModalOpen(true)}>
              <Plus className="mr-2 h-4 w-4" /> Add Category
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
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[80px]">Image</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Created At</TableHead>
                  {isAdmin && (
                    <TableHead className="text-right">Actions</TableHead>
                  )}
                </TableRow>
              </TableHeader>
              <TableBody>
                {categories.map((category) => (
                  <TableRow key={category._id}>
                    <TableCell>
                      {category.image ? (
                        <div className="h-12 w-12 rounded overflow-hidden bg-muted">
                          <img
                            src={category.image}
                            alt={category.name}
                            className="h-full w-full object-cover"
                          />
                        </div>
                      ) : (
                        <div className="h-12 w-12 rounded bg-muted flex
                      items-center justify-center text-muted-foreground">
                          No Image
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="font-medium">
                      {category.name}
                    </TableCell>
                    <TableCell>{category.categoryType}</TableCell>
                    <TableCell>
                      {new Date(category.createdAt).toLocaleDateString()}
                    </TableCell>
                    {isAdmin && (
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="icon"
                        // onClick={() => handleEdit(category)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>

                        <Button
                          variant="ghost"
                          size="icon"
                        // onClick={() => handleDelete(category)}
                        >
                          <Trash className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    )}
                  </TableRow>
                ))}
                {categories.length === 0 && (
                  <TableRow>
                    <TableCell
                      colSpan={isAdmin ? 5 : 4}
                      className="text-center py-10 text-muted-foreground"
                    >
                      No categories found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination Controls  */}
          {total > 0 && (
            <div className="flex items-center justify-between">
              <div className="text-sm text-muted-foreground">
                Showing {(page - 1) * perPage + 1} to {" "}
                {Math.min(page * perPage, total)} of (total) categories
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handlePreviousPage}
                  disabled={page === 1}
                >
                  <ChevronLeft className="h-4 w-4 mr-2" />
                  Previous
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleNextPage}
                  disabled={page === totalPages}
                >
                  Next
                  <ChevronFirst className="h-4 w-4 ml-2" />
                </Button>
              </div>
            </div>
          )}
        </>
      )}

      {/* Add Category Modal */}
      <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Add Category</DialogTitle>
            <DialogDescription>Create a new product category
            </DialogDescription>
          </DialogHeader>
          <Form {...formAdd}>
            <form
              onSubmit={formAdd.handleSubmit(handleAddCategory)}
              className="space-y-4"
            >
              <FormField
                control={formAdd.control}
                name="name"
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

              <FormField
                control={formAdd.control}
                name="categoryType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>category Type</FormLabel>
                    <FormControl>
                      <select
                        {...field}
                        disabled={formLoading}
                        className="w-full rounded-md border border-input 
                        bg-background px-3 py-2 text-sm
                        ring-offset-background focus:outline-none 
                        focus:ring-2 focus:ring-ring focus:ring-offset-2"
                      >
                        <option value="" disabled>
                          Select a category type
                        </option>
                        <option value="Featured">Featured</option>
                        <option value="Hot Categories">Hot Categories</option>
                        <option value="Top Categories">Top Categories</option>
                      </select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={formAdd.control}
                name="image"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category Image (Optional)</FormLabel>
                    <FormControl>
                      <ImageUpLoad
                        value={field.value ?? ""}
                        onChange={field.onChange}
                        disabled={formLoading}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsAddModalOpen(false)}
                  disabled={formLoading}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={formLoading}>
                  {formLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating ...
                    </>
                  ) : (
                    "Create Category"
                  )}

                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default Categories