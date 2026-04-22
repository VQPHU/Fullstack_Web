import React, { useEffect, useState } from 'react';
import { useAxiosPrivate } from "@/hooks/useAxiosPrivate";
import type { Salary, Employee, EmployeeRole } from '@/lib/type';
import useAuthStore from '@/store/useAuthStore';

import {
  Edit, Eye, Plus, RefreshCw,
  Search, DollarSign
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

import {
  Table, TableBody, TableCell,
  TableHead, TableHeader, TableRow
} from '@/components/ui/table';

import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

import {
  Select, SelectContent, SelectItem,
  SelectTrigger, SelectValue
} from '@/components/ui/select';

import {
  Dialog, DialogContent, DialogDescription,
  DialogFooter, DialogHeader, DialogTitle
} from '@/components/ui/dialog';

import {
  Form, FormControl, FormField,
  FormItem, FormLabel, FormMessage
} from '@/components/ui/form';

import { zodResolver } from '@hookform/resolvers/zod';
import { salarySchema } from '@/lib/validation';
import z from 'zod';
import { useForm } from 'react-hook-form';

import { ROLE_LABELS } from '@/lib/type'; // Import ROLE_LABELS from type.ts

const getStatusColor = (status: string) => {
  switch (status) {
    case "paid":
      return "bg-green-100 text-green-800";
    case "pending":
      return "bg-yellow-100 text-yellow-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

type FormData = z.infer<typeof salarySchema>;

// ===== Skeleton =====
const SalarySkeleton = () => (
  <div className="p-5 space-y-5 animate-pulse">
    <div className="flex items-center justify-between">
      <div className="space-y-2">
        <div className="h-8 w-64 bg-gray-200 rounded" />
        <div className="h-4 w-48 bg-gray-200 rounded" />
      </div>
      <div className="flex gap-3">
        <div className="h-10 w-24 bg-gray-200 rounded" />
        <div className="h-10 w-36 bg-gray-200 rounded" />
      </div>
    </div>

    <div className="flex gap-4">
      <div className="h-10 w-64 bg-gray-200 rounded" />
      <div className="h-10 w-48 bg-gray-200 rounded" />
    </div>

    <div className="bg-white rounded-lg border overflow-hidden">
      {[...Array(5)].map((_, i) => (
        <div key={i} className="flex items-center gap-4 p-4 border-b">
          <div className="h-4 w-32 bg-gray-200 rounded" />
          <div className="h-4 w-40 bg-gray-200 rounded ml-8" />
          <div className="h-6 w-20 bg-gray-200 rounded ml-auto" />
        </div>
      ))}
    </div>
  </div>
);

const SalariesPage = () => {
  const axiosPrivate = useAxiosPrivate();
  const { checkIsAdmin } = useAuthStore();
  const isAdmin = checkIsAdmin();

  const [salaries, setSalaries] = useState<Salary[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");

  const [selected, setSelected] = useState<Salary | null>(null);

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);

  const [formLoading, setFormLoading] = useState(false);
  const [total, setTotal] = useState(0);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  const formAdd = useForm<FormData>({
    resolver: zodResolver(salarySchema),
    defaultValues: {
      employee: "",
      period: "",
      baseSalary: 0,
      bonus: 0,
      allowance: 0,
      tax: 0,
      netSalary: 0,
      status: "unpaid",
    },
  });

  const formEdit = useForm<FormData>({
    resolver: zodResolver(salarySchema),
    // Default values will be set when opening the edit modal
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [salRes, empRes] = await Promise.all([
        axiosPrivate.get("/salaries"),
        axiosPrivate.get("/employees"),
      ]);

      const salaryData: Salary[] = salRes.data;
      setSalaries(salaryData);
      setEmployees(empRes.data.employees);
      const totalSalary = salaryData.reduce((acc, curr) => acc + curr.netSalary, 0);
      setTotal(totalSalary);
    } catch (error) {
      console.log(error);
      toast.error("Failed to load salaries");
    } finally {
      setLoading(false);
    }
  };


  useEffect(() => {
    fetchData();
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
  };

  const handleAdd = async (data: FormData) => {
    setFormLoading(true);
    try {
      await axiosPrivate.post("/salaries", data);
      toast.success("Created successfully");
      setIsAddModalOpen(false);
      fetchData();
    } catch {
      toast.error("Create failed");
    } finally {
      setFormLoading(false);
    }
  };

  // Merge employees who don't have salary records into the list
  const displayData = [
    ...salaries,
    ...employees
      .filter(emp => !salaries.some(s => s.employee._id === emp._id))
      .map(emp => ({
        _id: `placeholder-${emp._id}`,
        employee: emp,
        period: "—",
        baseSalary: 0,
        bonus: 0,
        allowance: 0,
        tax: 0,
        netSalary: 0,
        status: "pending" as const,
        isPlaceholder: true,
      }))
  ];

  const filtered = displayData.filter((item) => {
    const matchSearch = item.employee.fullName
      .toLowerCase()
      .includes(searchTerm.toLowerCase());

    const matchRole =
      roleFilter === "all" || item.employee.role === roleFilter;

    return matchSearch && matchRole;
  });
  

  if (loading) return <SalarySkeleton />;

  return (
    <div className="p-5 space-y-5">

      {/* HEADER */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Salary Management
          </h1>
          <p className="text-gray-600 my-0.5">
            Manage all salary records
          </p>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <DollarSign className="h-8 w-8 text-blue-600" />
            <span className="text-2xl font-bold text-blue-600">{formatCurrency(total)}</span>
          </div>

          <Button
            variant="outline"
            onClick={handleRefresh}
            disabled={refreshing}
            className="border-blue-600 text-blue-600 hover:bg-blue-50"
          >
            <RefreshCw className={`mr-2 h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
            {refreshing ? "Refreshing..." : "Refresh"}
          </Button>
        </div>
      </div>

      {/* FILTER */}
      <div className="flex items-center gap-4 flex-wrap">
        <div className="flex items-center gap-2">
          <Search className="h-4 w-4 text-gray-500" />
          <Input
            placeholder="Search salary..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-64"
          />
        </div>

        <Select value={roleFilter} onValueChange={setRoleFilter}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="All Roles" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Roles</SelectItem>
            {Object.entries(ROLE_LABELS).map(([k, v]) => (
              <SelectItem key={k} value={k}>{v}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* TABLE */}
      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50/50">
              <TableHead className="font-semibold text-gray-900">Employee</TableHead>
              <TableHead className="font-semibold text-gray-900">Role</TableHead>
              <TableHead className="font-semibold text-gray-900">Net Salary</TableHead>
              <TableHead className="font-semibold text-gray-900">Period</TableHead>
              <TableHead className="font-semibold text-gray-900">Status</TableHead>
              <TableHead className="font-semibold text-gray-900 text-right pr-6">Actions</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {filtered.length > 0 ? (
              filtered.map((item) => (
                <TableRow key={item._id}>
                  <TableCell className="font-medium text-gray-900">{item.employee.fullName}</TableCell>
                  <TableCell>{ROLE_LABELS[item.employee.role]}</TableCell>
                  <TableCell className="font-semibold text-blue-600">${item.netSalary}</TableCell>
                  <TableCell>{item.period}</TableCell>
                  <TableCell>
                    <Badge className={cn("capitalize shadow-sm", getStatusColor(item.status))}>
                      {item.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right pr-4">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        title="View salary details"
                        onClick={() => {
                          setSelected(item as Salary);
                          setIsViewModalOpen(true);
                        }}
                        disabled={(item as any).isPlaceholder}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      
                      {isAdmin && (
                        <>
                          {!(item as any).isPlaceholder ? (
                            /* Edit button for existing salary */
                            <Button
                              variant="ghost"
                              size="icon"
                              title="Edit salary"
                              onClick={() => {
                                setSelected(item as Salary);
                                formEdit.reset({
                                  employee: item.employee._id,
                                  period: item.period,
                                  baseSalary: item.baseSalary,
                                  bonus: item.bonus,
                                  allowance: item.allowance,
                                  tax: item.tax,
                                  netSalary: item.netSalary,
                                  status: item.status as "paid" | "unpaid",
                                });
                                setIsEditModalOpen(true);
                              }}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                          ) : (
                            /* Plus button for new employees without salary */
                            <Button
                              variant="ghost"
                              size="icon"
                              title="Add salary record"
                              onClick={() => {
                                formAdd.reset({
                                  employee: item.employee._id,
                                  period: "",
                                  baseSalary: 0,
                                  bonus: 0,
                                  allowance: 0,
                                  tax: 0,
                                  netSalary: 0,
                                  status: "unpaid",
                                });
                                setIsAddModalOpen(true);
                              }}
                            >
                              <Plus className="h-4 w-4 text-green-600" />
                            </Button>
                          )}
                        </>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-12">
                  <div className="flex flex-col items-center gap-4">
                    <DollarSign className="h-12 w-12 text-gray-400" />
                    <div>
                      <p className="text-lg font-medium text-gray-900">
                        No salary records found
                      </p>
                      <p className="text-sm text-gray-500">
                        {searchTerm || roleFilter !== "all" ? "Try adjusting your search or filters" : "Salary records will appear here once added"}
                      </p>
                    </div>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Add Salary Modal */}
      <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
        <DialogContent className="sm:max-w-[550px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add Salary</DialogTitle>
            <DialogDescription>Create salary record</DialogDescription>
          </DialogHeader>

          <Form {...formAdd}>
            <form
              onSubmit={formAdd.handleSubmit(handleAdd)}
              className="space-y-6 mt-4"
            >

              {/* Employee */}
              <FormField
                control={formAdd.control}
                name="employee"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-700 font-medium">Employee</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value} // Ensure the selected value is displayed
                      disabled={formLoading}
                    // Add consistent styling
                    // className="border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200"
                    >
                      <FormControl>
                        <SelectTrigger className="border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500">
                          <SelectValue placeholder="Select employee" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {employees.map((emp) => (
                          <SelectItem key={emp._id} value={emp._id}>
                            {emp.fullName}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Period */}
              <FormField
                control={formAdd.control}
                name="period"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-700 font-medium">Period</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="2024-03"
                        disabled={formLoading}
                        className="border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Base Salary */}
              <FormField
                control={formAdd.control}
                name="baseSalary"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-700 font-medium">Base Salary</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="number"
                        disabled={formLoading}
                        className="border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Bonus */}
              <FormField
                control={formAdd.control}
                name="bonus"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-700 font-medium">Bonus</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="number"
                        disabled={formLoading}
                        className="border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              {/* Allowance */}
              <FormField
                control={formAdd.control}
                name="allowance"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-700 font-medium">Allowance</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="number"
                        disabled={formLoading}
                        className="border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              {/* Tax */}
              <FormField
                control={formAdd.control}
                name="tax"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-700 font-medium">Tax</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="number"
                        disabled={formLoading}
                        className="border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              {/* Net Salary */}
              <FormField
                control={formAdd.control}
                name="netSalary"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-700 font-medium">Net Salary</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="number"
                        disabled={formLoading}
                        className="border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              {/* Status */}
              <FormField
                control={formAdd.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-700 font-medium">Status</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value} // Ensure the selected value is displayed
                      disabled={formLoading}
                    // className="border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200"
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="paid">Paid</SelectItem>
                        <SelectItem value="pending">Pending</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <DialogFooter className="mt-6 flex justify-end gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsAddModalOpen(false)}
                  disabled={formLoading}
                  className="border-gray-300 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors duration-200"
                >
                  Cancel
                </Button>

                <Button
                  type="submit"
                  disabled={formLoading}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg shadow-md transition-colors duration-200"
                >
                  {formLoading ? (
                    <>
                      <svg className="animate-spin h-5 w-5 mr-2 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" /></svg>
                      Creating...
                    </>
                  ) : "Create Salary"}
                </Button>
              </DialogFooter>

            </form>
          </Form>
        </DialogContent>
      </Dialog>


      {/* Edit Salary Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={(open) => {
        setIsEditModalOpen(open);
        if (!open) {
          formEdit.reset(); // Reset form when closing
          setSelected(null); // Clear selected employee
        }
      }}>
        <DialogContent className="sm:max-w-[550px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Salary</DialogTitle>
            <DialogDescription>Update salary info</DialogDescription>
          </DialogHeader>

          <Form {...formEdit}>
            <form
              onSubmit={formEdit.handleSubmit(async (data) => {
                if (!selected) return;
                setFormLoading(true);
                try {
                  await axiosPrivate.put(`/salaries/${selected._id}`, data);
                  toast.success("Updated successfully");
                  setIsEditModalOpen(false);
                  fetchData();
                } catch (error) {
                  console.error("Update failed", error);
                  toast.error("Update failed");
                } finally {
                  setFormLoading(false);
                }
              })}
              className="space-y-6 mt-4"
            >

              {/* Employee (Read-only for edit, or allow changing if business logic permits) */}
              <FormItem>
                <FormLabel className="text-gray-700 font-medium">Employee</FormLabel>
                <Input
                  value={selected?.employee.fullName || ''}
                  disabled
                  className="border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
                <FormMessage />
              </FormItem>

              {/* Period */}
              <FormField
                control={formEdit.control}
                name="period"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-700 font-medium">Period</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="YYYY-MM"
                        disabled={formLoading}
                        className="border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      />
                    </FormControl>
                    <FormMessage className="text-red-500 text-xs" />
                  </FormItem>
                )}
              />

              {/* Base Salary */}
              <FormField
                control={formEdit.control}
                name="baseSalary"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-700 font-medium">Base Salary</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="number"
                        disabled={formLoading}
                        className="border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        onChange={(e) => field.onChange(parseFloat(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage className="text-red-500 text-xs" />
                  </FormItem>
                )}
              />

              {/* Bonus */}
              <FormField
                control={formEdit.control}
                name="bonus"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-700 font-medium">Bonus</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="number"
                        disabled={formLoading}
                        className="border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        onChange={(e) => field.onChange(parseFloat(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage className="text-red-500 text-xs" />
                  </FormItem>
                )}
              />

              {/* Allowance */}
              <FormField
                control={formEdit.control}
                name="allowance"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-700 font-medium">Allowance</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="number"
                        disabled={formLoading}
                        className="border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        onChange={(e) => field.onChange(parseFloat(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage className="text-red-500 text-xs" />
                  </FormItem>
                )}
              />

              {/* Tax */}
              <FormField
                control={formEdit.control}
                name="tax"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-700 font-medium">Tax</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="number"
                        disabled={formLoading}
                        className="border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        onChange={(e) => field.onChange(parseFloat(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage className="text-red-500 text-xs" />
                  </FormItem>
                )}
              />

              {/* Net Salary */}
              <FormField
                control={formEdit.control}
                name="netSalary"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-700 font-medium">Net Salary</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="number"
                        disabled={formLoading}
                        className="border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        onChange={(e) => field.onChange(parseFloat(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage className="text-red-500 text-xs" />
                  </FormItem>
                )}
              />

              {/* Status */}
              <FormField
                control={formEdit.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-700 font-medium">Status</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value}
                      disabled={formLoading}
                    >
                      <FormControl>
                        <SelectTrigger className="border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500">
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="paid">Paid</SelectItem>
                        <SelectItem value="pending">Pending</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage className="text-red-500 text-xs" />
                  </FormItem>
                )}
              />

              <DialogFooter className="mt-6 flex justify-end gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsEditModalOpen(false)}
                  disabled={formLoading}
                  className="border-gray-300 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors duration-200"
                >
                  Cancel
                </Button>

                <Button
                  type="submit"
                  disabled={formLoading}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg shadow-md transition-colors duration-200"
                >
                  {formLoading ? (
                    <>
                      <svg className="animate-spin h-5 w-5 mr-2 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" /></svg>
                      Updating...
                    </>
                  ) : "Update Salary"}
                </Button>
              </DialogFooter>

            </form>
          </Form>
        </DialogContent>
      </Dialog>
      <Dialog open={isViewModalOpen} onOpenChange={setIsViewModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Salary Details</DialogTitle>
            <DialogDescription>View complete salary information</DialogDescription>
          </DialogHeader>

          {selected && (
            <div className="space-y-6">
              {/* Employee Info */}
              <div className="flex items-center gap-4">
                <div className="h-16 w-16 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-semibold shadow-sm overflow-hidden flex-shrink-0">
                  {selected.employee.avatar ? (
                    <img
                      src={selected.employee.avatar}
                      alt={selected.employee.fullName}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <span className="text-xl">
                      {selected.employee.fullName.charAt(0).toUpperCase()}
                    </span>
                  )}
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">
                    {selected.employee.fullName}
                  </h3>
                  <p className="text-gray-600">{selected.employee.email}</p>
                  <Badge className={cn("capitalize mt-1", getStatusColor(selected.status))}>
                    {ROLE_LABELS[selected.employee.role as EmployeeRole]}
                  </Badge>
                </div>
              </div>

              {/* Salary Details */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-gray-500">Period</Label>
                  <p className="text-sm font-semibold text-gray-900 mt-0.5">{selected.period}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">Status</Label>
                  <Badge className={cn("capitalize mt-0.5", getStatusColor(selected.status))}>
                    {selected.status}
                  </Badge>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">Base Salary</Label>
                  <p className="text-sm font-semibold text-gray-900 mt-0.5">${selected.baseSalary}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">Bonus</Label>
                  <p className="text-sm font-semibold text-gray-900 mt-0.5">${selected.bonus}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">Allowance</Label>
                  <p className="text-sm font-semibold text-gray-900 mt-0.5">${selected.allowance}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">Tax</Label>
                  <p className="text-sm font-semibold text-gray-900 mt-0.5">${selected.tax}</p>
                </div>
                <div className="col-span-2">
                  <Label className="text-sm font-medium text-gray-500">Net Salary</Label>
                  <p className="text-lg font-bold text-green-600 mt-0.5">${selected.netSalary}</p>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SalariesPage;