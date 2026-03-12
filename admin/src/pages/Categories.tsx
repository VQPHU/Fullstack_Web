import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useAxiosPrivate } from "@/hooks/useAxiosPrivate";
import type { Category } from "@/lib/type";
import { categorySchema } from "@/lib/validation";
import useAuthStore from "@/store/useAuthStore";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowDown, ArrowUp, Loader2, Plus, RefreshCw } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";


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

                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </>
      )}
    </div>
  )
}

export default Categories