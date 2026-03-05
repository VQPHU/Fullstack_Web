import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import ImageUpLoad from '@/components/ui/image.upload';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useAxiosPrivate } from '@/hooks/useAxiosPrivate';
import { Brand } from '@/lib/type';
import { brandSchema } from '@/lib/validation';
import useAuthStore from '@/store/useAuthStore';
import { zodResolver } from '@hookform/resolvers/zod';
import { Edit, ImageUpIcon, Loader2, Plus, RefreshCw, Trash } from 'lucide-react';
import React, { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from "zod";

type FormData = z.infer<typeof brandSchema>
const Brands = () => {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedBrand, setSelectedBrand] = useState<Brand | null>(null);
  const [formLoading, setFormLoading] = useState(false);
  const axiosPrivate = useAxiosPrivate();

  const { checkIsAdmin } = useAuthStore();
  const isAdmin = checkIsAdmin();

  const formAdd = useForm<FormData>({
    resolver: zodResolver(brandSchema),
    defaultValues: {
      name: "",
      image: "", // Default to empty string for optional image 
    },
  });

  const fetchBrands = async () => {
    try {
      const response = await axiosPrivate.get("/brands");
      setBrands(response.data);
    } catch (error) {
      console.log("Failed to load brands");
      toast("Failed to load brands");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBrands();
  }, []);

  const handleAddbrand = async (data: FormData) => {
    setFormLoading(true);
    try {
      await axiosPrivate.post("/brands", data);
      toast("Brand creared successfully");
      formAdd.reset();
      setIsAddModalOpen(false);
      fetchBrands();
    } catch (error) {
      console.log("Failed to create brand", error);
      toast("Failed to creare brand");
    } finally {
      setFormLoading(false);
    }
  }

  return (
    <div className='p-5 space-y-6'>
      <div className='flex justify-between items-center'>
        <h1 className='text-3xl font-bold'>Brands</h1>
        <div className='flex items-center gap-2'>
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
          {isAdmin && (
            <Button onClick={() => setIsAddModalOpen(true)}>
              <Plus className='mr-2 h-4 w-4' /> Add Brand
            </Button>
          )}
        </div>
      </div>
      {loading ? (
        <div className='flex justify-center items-center min-h-[400px]'>
          <Loader2 className='h-8 w-8 animate-spin' />
        </div>
      ) : (
        <div className='rounded-md border'>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className='w-[80px]'>Image</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Created At</TableHead>
                {isAdmin && (
                  <TableHead className='text-right'>Actions</TableHead>
                )}
              </TableRow>
            </TableHeader>
            <TableBody>
              {brands.map((brand) => (
                <TableRow key={brand._id}>
                  <TableCell>
                    {brand.image ? (
                      <div className='h-12 w-12 rounded overflow-hidden bg-muted'>
                        <img
                          src={brand.image}
                          alt={brand.name}
                          className='h-full w-full object-cover'
                        />
                      </div>
                    ) : (
                      <div className='h-12 w-12 rounded bg-muted flex 
                      items-center justify-center text-muted-foreground'>
                        No Image
                      </div>
                    )}
                  </TableCell>
                  <TableCell className='font-medium'>{brand.name}</TableCell>
                  <TableCell>
                    {new Date(brand.createdAt).toLocaleDateString()}
                  </TableCell>
                  {isAdmin && (
                    <TableCell className='text-right' >
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEdit(brand)}
                      >
                        <Edit className='h-4 w-4' />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(brand)}
                      >
                        <Trash className='h-4 w-4' />
                      </Button>
                    </TableCell>
                  )}
                </TableRow>
              ))}
              {brands.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={isAdmin ? 4 : 3}
                    className='text-center py-10 text-muted-foreground'
                  >
                    No brands found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      )}
      <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen} >
        <DialogContent className='sm:max-w-[425px]'>
          <DialogHeader>
            <DialogTitle>Add brand</DialogTitle>
            <DialogDescription>Create a new product brand</DialogDescription>
          </DialogHeader>
          <Form {...formAdd}>
            <form
              onSubmit={formAdd.handleSubmit(handleAddbrand)}
              className='space-y-4'
            >
              <FormField
                control={formAdd.control}
                name='name'
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
                name='image'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Brand image (Optional)</FormLabel>
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
                  type='button'
                  variant='outline'
                  onClick={() => setIsAddModalOpen(false)}
                  disabled={formLoading}
                >
                  Cancel
                </Button>

                <Button
                  type='submit'
                  disabled={formLoading}>
                  {formLoading ? (
                    <>
                      <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                      Creating ...
                    </>
                  ) : (
                    "Create Brand"
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

export default Brands;