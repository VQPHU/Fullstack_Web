import ProductSkeleton from '@/components/skeletons/ProductSkeleton';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAxiosPrivate } from '@/hooks/useAxiosPrivate';
import { Brand, Category, Product } from '@/lib/type';
import { productSchema } from '@/lib/validation';
import useAuthStore from '@/store/useAuthStore';
import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowDown, ArrowUp, Plus, RefreshCw } from 'lucide-react';
import React, { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import z from 'zod';

type FormData = z.infer<typeof productSchema>

const Products = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1); // Default page = 1; 
  const [perPage] = useState(10); // Default perPage = 10;
  const [totalPages, setTotalPages] = useState(1); // Track total pages
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc"); // Default asc
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedModalOpen, setSelectedModalOpen] = useState<Product | null>(null);
  const [formLoading, setFormLoading] = useState(false);

  const axiosPrivate = useAxiosPrivate();
  const { checkIsAdmin } = useAuthStore();
  const isAdmin = checkIsAdmin();

  const formAdd = useForm<FormData>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: "",
      description: "",
      price: 0,
      discountPercentage: 10,
      stock: 10,
      category: "",
      brand: "",
      image: "",
    }
  });


  const formEdit = useForm<FormData>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: "",
      description: "",
      price: 0,
      discountPercentage: 10,
      stock: 10,
      category: "",
      brand: "",
      image: "",
    }
  });

  const fetchProducts = async (resetPage = false) => {
    setLoading(true);
    try {
      const currentPage = resetPage ? 1 : page;
      const response = await axiosPrivate.get("/products", {
        params: { page: currentPage, perPage, sortOrder },
      });

      setProducts(response.data.products || []);
      setTotal(response.data.total || 0);
      setTotalPages(
        response.data.totalPages ||
        Math.ceil((response.data.total || 0) / perPage)
      );

      // if  we reset the page, update the page state
      if (resetPage) {
        setPage(1);
      }
    } catch (error) {
      console.log("Failed to load products", error);
      toast("Failed to load products");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  return (
    <div className="p-5 space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-end gap-3">
          <h1 className="text-3xl font-bold">Products</h1>
          <p className="text-sm font-medium">
            Total <span className="font-bold">{total}</span>
          </p>
        </div>

        <div className="flex items-center gap-3 rounded-lg bg-muted/50 p-2 shadow-sm">
          <Button
            variant="outline"
            // onClick={handleRefresh}
            disabled={refreshing}
            className="bg-background text-sm shadow-sm hover:bg-muted/10 focus:ring-2 focus:ring-ring"
          >
            <RefreshCw
              className={`mr-2 h-4 w-4 ${refreshing ? "animate-spin" : ""}`}
            />
            {refreshing ? "Refreshing..." : "Refresh"}
          </Button>

          <Select value={sortOrder}>
            {/* onValueChange={handleSortChange} */}
            <SelectTrigger
              className="w-40 bg-background text-sm shadow-sm hover:bg-muted/10 focus:ring-2 focus:ring-ring"
              aria-label="Sort order"
            >
              <SelectValue placeholder="Sort Order" />
            </SelectTrigger>

            <SelectContent>
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
            <Button
              onClick={() => setIsAddModalOpen(true)}
              className="bg-primary text-primary-foreground shadow-sm hover:bg-primary/90"
            >
              <Plus className="mr-2 h-4 w-4" /> Add Product
            </Button>
          )}
        </div>
      </div>
      {loading ? (
        <ProductSkeleton isAdmin={isAdmin} />
      ) : (
        <>
          <div>Products</div>
        </>
      )}
    </div>
  );
};
export default Products;