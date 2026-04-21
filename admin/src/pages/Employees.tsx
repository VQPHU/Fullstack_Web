import React, { useEffect, useState } from 'react';
import type { Employee } from '@/lib/type';
import { useAxiosPrivate } from "@/hooks/useAxiosPrivate";
import useAuthStore from '@/store/useAuthStore';
import { Edit, Eye, Plus, RefreshCw, Search, Trash, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import {
    Table, TableBody, TableCell, TableHead,
    TableHeader, TableRow
} from '@/components/ui/table';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
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
import {
    AlertDialog, AlertDialogAction, AlertDialogCancel,
    AlertDialogContent, AlertDialogDescription,
    AlertDialogFooter, AlertDialogHeader, AlertDialogTitle
} from '@/components/ui/alert-dialog';
import { Label } from '@/components/ui/label';
import { zodResolver } from '@hookform/resolvers/zod';
import { employeeSchema } from '@/lib/validation';
import z from 'zod';
import { useForm } from 'react-hook-form';
import ImageUpLoad from '@/components/ui/image.upload';

type FormData = z.infer<typeof employeeSchema>;

const EMPLOYEE_ROLES = [
    { value: "incharge", label: "Incharge" },
    { value: "call_center", label: "Call Center" },
    { value: "accounts", label: "Accounts" },
    { value: "delivery", label: "Delivery" },
    { value: "packer", label: "Packer" },
] as const;

const getRoleColor = (role: string) => {
    switch (role) {
        case "incharge":
            return "bg-purple-100 text-purple-800";
        case "call_center":
            return "bg-pink-100 text-pink-800";
        case "accounts":
            return "bg-orange-100 text-orange-800";
        case "delivery":
            return "bg-green-100 text-green-800";
        case "packer":
            return "bg-blue-100 text-blue-800";
        default:
            return "bg-gray-100 text-gray-800";
    }
};

const getRoleLabel = (role: string) => {
    return EMPLOYEE_ROLES.find((r) => r.value === role)?.label ?? role;
};

// Skeleton
const EmployeeSkeleton = () => (
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
                    <div className="h-12 w-12 rounded-full bg-gray-200" />
                    <div className="h-4 w-32 bg-gray-200 rounded" />
                    <div className="h-4 w-40 bg-gray-200 rounded ml-8" />
                    <div className="h-6 w-20 bg-gray-200 rounded ml-auto" />
                </div>
            ))}
        </div>
    </div>
);

const EmployeesPage = () => {
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
    const [formLoading, setFormLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [roleFilter, setRoleFilter] = useState<string>("all");
    const [total, setTotal] = useState(0);

    const axiosPrivate = useAxiosPrivate();
    const { checkIsAdmin } = useAuthStore();
    const isAdmin = checkIsAdmin();

    const formAdd = useForm<FormData>({
        resolver: zodResolver(employeeSchema),
        defaultValues: {
            employeeId: "",
            fullName: "",
            email: "",
            gender: undefined,
            dateOfBirth: "",
            hometown: "",
            university: "",
            role: undefined,
            avatar: "",
        },
    });

    const formEdit = useForm<FormData>({
        resolver: zodResolver(employeeSchema),
        defaultValues: {
            employeeId: "",
            fullName: "",
            email: "",
            gender: undefined,
            dateOfBirth: "",
            hometown: "",
            university: "",
            role: undefined,
            avatar: "",
        },
    });

    const fetchEmployees = async () => {
        setLoading(true);
        try {
            const params: Record<string, string> = {};
            if (searchTerm) params.keyword = searchTerm;
            if (roleFilter !== "all") params.role = roleFilter;

            const response = await axiosPrivate.get("/employees", { params });
            if (response?.data) {
                setEmployees(response.data.employees);
                setTotal(response.data.count);
            }
        } catch (error) {
            console.log("Failed to load employees", error);
            toast.error("Failed to load employees");
        } finally {
            setLoading(false);
        }
    };

    const handleRefresh = async () => {
        setRefreshing(true);
        setLoading(true);
        try {
            const response = await axiosPrivate.get("/employees");
            if (response?.data) {
                setEmployees(response.data.employees);
                setTotal(response.data.count);
            }
            toast("Employees refreshed successfully");
        } catch (error) {
            console.log("Failed to refresh employees", error);
            toast.error("Failed to refresh employees");
        } finally {
            setRefreshing(false);
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchEmployees();
    }, []);

    const handleAddEmployee = async (data: FormData) => {
        setFormLoading(true);
        try {
            await axiosPrivate.post("/employees", data);
            toast.success("Employee created successfully!");
            formAdd.reset();
            setIsAddModalOpen(false);
            fetchEmployees();
        } catch (error) {
            console.log("Failed to create employee", error);
            toast.error("Failed to create employee");
        } finally {
            setFormLoading(false);
        }
    };

    const handleView = (employee: Employee) => {
        setSelectedEmployee(employee);
        setIsViewModalOpen(true);
    };

    const handleEdit = (employee: Employee) => {
        setSelectedEmployee(employee);
        formEdit.reset({
            employeeId: employee.employeeId,
            fullName: employee.fullName,
            email: employee.email,
            gender: employee.gender,
            dateOfBirth: employee.dateOfBirth ?? "",
            hometown: employee.hometown ?? "",
            university: employee.university ?? "",
            role: employee.role,
            avatar: employee.avatar ?? "",
        });
        setIsEditModalOpen(true);
    };

    const handleUpdateEmployee = async (data: FormData) => {
        if (!selectedEmployee) return;
        setFormLoading(true);
        try {
            await axiosPrivate.put(`/employees/${selectedEmployee._id}`, data);
            toast.success("Employee updated successfully!");
            setIsEditModalOpen(false);
            fetchEmployees();
        } catch (error) {
            console.log("Failed to update employee", error);
            toast.error("Failed to update employee");
        } finally {
            setFormLoading(false);
        }
    };

    const handleDelete = (employee: Employee) => {
        setSelectedEmployee(employee);
        setIsDeleteModalOpen(true);
    };

    const handleDeleteEmployee = async () => {
        if (!selectedEmployee) return;
        try {
            await axiosPrivate.delete(`/employees/${selectedEmployee._id}`);
            toast("Employee deleted successfully");
            setIsDeleteModalOpen(false);
            fetchEmployees();
        } catch (error) {
            console.log("Failed to delete employee", error);
            toast.error("Failed to delete employee");
        }
    };

    const filteredEmployees = employees.filter((emp) => {
        const matchesSearch =
            emp.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            emp.email.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesRole = roleFilter === "all" || emp.role === roleFilter;
        return matchesSearch && matchesRole;
    });

    if (loading) return <EmployeeSkeleton />;

    return (
        <div className="p-5 space-y-5">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">
                        Employees Management
                    </h1>
                    <p className="text-gray-600 my-0.5">
                        Manage all employee information and roles
                    </p>
                </div>
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                        <Users className="h-8 w-8 text-blue-600" />
                        <span className="text-2xl font-bold text-blue-600">{total}</span>
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
                    {isAdmin && (
                        <Button
                            onClick={() => setIsAddModalOpen(true)}
                            className="bg-indigo-600 hover:bg-indigo-700"
                        >
                            <Plus className="mr-2 h-4 w-4" />
                            Add Employee
                        </Button>
                    )}
                </div>
            </div>

            {/* Filters */}
            <div className="flex items-center gap-4 flex-wrap">
                <div className="flex items-center gap-2">
                    <Search className="h-4 w-4 text-gray-500" />
                    <Input
                        placeholder="Search employees..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-64"
                    />
                </div>
                <Select value={roleFilter} onValueChange={setRoleFilter}>
                    <SelectTrigger className="w-48">
                        <SelectValue placeholder="All Employee Roles" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Employee Roles</SelectItem>
                        {EMPLOYEE_ROLES.map((role) => (
                            <SelectItem key={role.value} value={role.value}>{role.label}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            {/* Table */}
            <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
                <Table>
                    <TableHeader>
                        <TableRow className="text-gray-50">
                            <TableHead className="font-semibold">Avatar</TableHead>
                            <TableHead className="font-semibold">Name</TableHead>
                            <TableHead className="font-semibold">Email</TableHead>
                            <TableHead className="font-semibold">Role</TableHead>
                            <TableHead className="font-semibold">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredEmployees.length > 0 ? (
                            filteredEmployees.map((emp) => (
                                <TableRow key={emp._id}>
                                    <TableCell>
                                        <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-semibold shadow-sm overflow-hidden">
                                            {emp.avatar ? (
                                                <img
                                                    src={emp.avatar}
                                                    alt={emp.fullName}
                                                    className="h-full w-full object-cover"
                                                />
                                            ) : (
                                                <span className="text-lg">
                                                    {emp.fullName.charAt(0).toUpperCase()}
                                                </span>
                                            )}
                                        </div>
                                    </TableCell>
                                    <TableCell className="font-medium">{emp.fullName}</TableCell>
                                    <TableCell className="font-medium">{emp.email}</TableCell>
                                    <TableCell>
                                        <Badge className={cn("capitalize", getRoleColor(emp.role))}>
                                            {getRoleLabel(emp.role)}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => handleView(emp)}
                                                title="View employee details"
                                            >
                                                <Eye className="h-4 w-4" />
                                            </Button>
                                            {isAdmin && (
                                                <>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() => handleEdit(emp)}
                                                        title="Edit employee"
                                                    >
                                                        <Edit className="h-4 w-4" />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() => handleDelete(emp)}
                                                        className="text-red-600 hover:text-red-700"
                                                        title="Delete employee"
                                                    >
                                                        <Trash className="h-4 w-4" />
                                                    </Button>
                                                </>
                                            )}
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={5} className="text-center py-12">
                                    <div className="flex flex-col items-center gap-4">
                                        <Users className="h-12 w-12 text-gray-400" />
                                        <div>
                                            <p className="text-lg font-medium text-gray-900">
                                                No employees found
                                            </p>
                                            <p className="text-sm text-gray-500">
                                                {searchTerm || roleFilter !== "all"
                                                    ? "Try adjusting your search or filters"
                                                    : "Employees will appear here once added"}
                                            </p>
                                        </div>
                                    </div>
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* Add Employee Modal */}
            <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
                <DialogContent className="sm:max-w-[550px] max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Add Employee</DialogTitle>
                        <DialogDescription>Create a new employee record</DialogDescription>
                    </DialogHeader>
                    <Form {...formAdd}>
                        <form onSubmit={formAdd.handleSubmit(handleAddEmployee)} className="space-y-6 mt-4">
                            {/* Employee ID */}
                            <FormField
                                control={formAdd.control}
                                name="employeeId"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-gray-700 font-medium">Employee ID</FormLabel>
                                        <FormControl>
                                            <Input
                                                {...field}
                                                disabled={formLoading}
                                                placeholder="e.g. EMP001"
                                                className="border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200"
                                            />
                                        </FormControl>
                                        <FormMessage className="text-red-500 text-xs" />
                                    </FormItem>
                                )}
                            />
                            {/* Full Name */}
                            <FormField
                                control={formAdd.control}
                                name="fullName"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-gray-700 font-medium">Full Name</FormLabel>
                                        <FormControl>
                                            <Input
                                                {...field}
                                                disabled={formLoading}
                                                className="border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200"
                                            />
                                        </FormControl>
                                        <FormMessage className="text-red-500 text-xs" />
                                    </FormItem>
                                )}
                            />
                            {/* Email */}
                            <FormField
                                control={formAdd.control}
                                name="email"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-gray-700 font-medium">Email</FormLabel>
                                        <FormControl>
                                            <Input
                                                {...field}
                                                disabled={formLoading}
                                                className="border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200"
                                            />
                                        </FormControl>
                                        <FormMessage className="text-red-500 text-xs" />
                                    </FormItem>
                                )}
                            />
                            {/* Gender */}
                            <FormField
                                control={formAdd.control}
                                name="gender"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-gray-700 font-medium">Gender</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value} disabled={formLoading}>
                                            <FormControl>
                                                <SelectTrigger className="border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 w-full">
                                                    <SelectValue placeholder="Select gender" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="male">Male</SelectItem>
                                                <SelectItem value="female">Female</SelectItem>
                                                <SelectItem value="other">Other</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage className="text-red-500 text-xs" />
                                    </FormItem>
                                )}
                            />
                            {/* Date of Birth */}
                            <FormField
                                control={formAdd.control}
                                name="dateOfBirth"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-gray-700 font-medium">Date of Birth</FormLabel>
                                        <FormControl>
                                            <Input
                                                {...field}
                                                type="date"
                                                disabled={formLoading}
                                                className="border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200"
                                            />
                                        </FormControl>
                                        <FormMessage className="text-red-500 text-xs" />
                                    </FormItem>
                                )}
                            />
                            {/* Hometown */}
                            <FormField
                                control={formAdd.control}
                                name="hometown"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-gray-700 font-medium">Hometown</FormLabel>
                                        <FormControl>
                                            <Input
                                                {...field}
                                                disabled={formLoading}
                                                className="border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200"
                                            />
                                        </FormControl>
                                        <FormMessage className="text-red-500 text-xs" />
                                    </FormItem>
                                )}
                            />
                            {/* University */}
                            <FormField
                                control={formAdd.control}
                                name="university"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-gray-700 font-medium">University</FormLabel>
                                        <FormControl>
                                            <Input
                                                {...field}
                                                disabled={formLoading}
                                                className="border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200"
                                            />
                                        </FormControl>
                                        <FormMessage className="text-red-500 text-xs" />
                                    </FormItem>
                                )}
                            />
                            {/* Role */}
                            <FormField
                                control={formAdd.control}
                                name="role"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-gray-700 font-medium">Role</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value} disabled={formLoading}>
                                            <FormControl>
                                                <SelectTrigger className="border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 w-full">
                                                    <SelectValue placeholder="Select a role" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {EMPLOYEE_ROLES.map((role) => (
                                                    <SelectItem key={role.value} value={role.value}>{role.label}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage className="text-red-500 text-xs" />
                                    </FormItem>
                                )}
                            />
                            {/* Avatar */}
                            <FormField
                                control={formAdd.control}
                                name="avatar"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-gray-700 font-medium">Avatar</FormLabel>
                                        <FormControl>
                                            <ImageUpLoad
                                                value={field.value ?? ""}
                                                onChange={field.onChange}
                                                disabled={formLoading}
                                            />
                                        </FormControl>
                                        <FormMessage className="text-red-500 text-xs" />
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
                                            <svg className="animate-spin h-5 w-5 mr-2 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                                            </svg>
                                            Creating...
                                        </>
                                    ) : (
                                        "Create Employee"
                                    )}
                                </Button>
                            </DialogFooter>
                        </form>
                    </Form>
                </DialogContent>
            </Dialog>

            {/* Edit Employee Modal */}
            <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
                <DialogContent className="sm:max-w-[550px] max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Edit Employee</DialogTitle>
                        <DialogDescription>Update employee information</DialogDescription>
                    </DialogHeader>
                    <Form {...formEdit}>
                        <form onSubmit={formEdit.handleSubmit(handleUpdateEmployee)} className="space-y-6 mt-4">
                            <FormField control={formEdit.control} name="employeeId"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-gray-700 font-medium">Employee ID</FormLabel>
                                        <FormControl>
                                            <Input {...field} disabled={formLoading} className="border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200" />
                                        </FormControl>
                                        <FormMessage className="text-red-500 text-xs" />
                                    </FormItem>
                                )}
                            />
                            <FormField control={formEdit.control} name="fullName"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-gray-700 font-medium">Full Name</FormLabel>
                                        <FormControl>
                                            <Input {...field} disabled={formLoading} className="border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200" />
                                        </FormControl>
                                        <FormMessage className="text-red-500 text-xs" />
                                    </FormItem>
                                )}
                            />
                            <FormField control={formEdit.control} name="email"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-gray-700 font-medium">Email</FormLabel>
                                        <FormControl>
                                            <Input {...field} disabled={formLoading} className="border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200" />
                                        </FormControl>
                                        <FormMessage className="text-red-500 text-xs" />
                                    </FormItem>
                                )}
                            />
                            <FormField control={formEdit.control} name="gender"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-gray-700 font-medium">Gender</FormLabel>
                                        <Select onValueChange={field.onChange} value={field.value} disabled={formLoading}>
                                            <FormControl>
                                                <SelectTrigger className="border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 w-full">
                                                    <SelectValue placeholder="Select gender" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="male">Male</SelectItem>
                                                <SelectItem value="female">Female</SelectItem>
                                                <SelectItem value="other">Other</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage className="text-red-500 text-xs" />
                                    </FormItem>
                                )}
                            />
                            <FormField control={formEdit.control} name="dateOfBirth"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-gray-700 font-medium">Date of Birth</FormLabel>
                                        <FormControl>
                                            <Input {...field} type="date" disabled={formLoading} className="border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200" />
                                        </FormControl>
                                        <FormMessage className="text-red-500 text-xs" />
                                    </FormItem>
                                )}
                            />
                            <FormField control={formEdit.control} name="hometown"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-gray-700 font-medium">Hometown</FormLabel>
                                        <FormControl>
                                            <Input {...field} disabled={formLoading} className="border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200" />
                                        </FormControl>
                                        <FormMessage className="text-red-500 text-xs" />
                                    </FormItem>
                                )}
                            />
                            <FormField control={formEdit.control} name="university"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-gray-700 font-medium">University</FormLabel>
                                        <FormControl>
                                            <Input {...field} disabled={formLoading} className="border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200" />
                                        </FormControl>
                                        <FormMessage className="text-red-500 text-xs" />
                                    </FormItem>
                                )}
                            />
                            <FormField control={formEdit.control} name="role"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-gray-700 font-medium">Role</FormLabel>
                                        <Select onValueChange={field.onChange} value={field.value} disabled={formLoading}>
                                            <FormControl>
                                                <SelectTrigger className="border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 w-full">
                                                    <SelectValue placeholder="Select a role" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {EMPLOYEE_ROLES.map((role) => (
                                                    <SelectItem key={role.value} value={role.value}>{role.label}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage className="text-red-500 text-xs" />
                                    </FormItem>
                                )}
                            />
                            <FormField control={formEdit.control} name="avatar"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-gray-700 font-medium">Avatar</FormLabel>
                                        <FormControl>
                                            <ImageUpLoad value={field.value ?? ""} onChange={field.onChange} disabled={formLoading} />
                                        </FormControl>
                                        <FormMessage className="text-red-500 text-xs" />
                                    </FormItem>
                                )}
                            />
                            <DialogFooter className="mt-6 flex justify-end gap-3">
                                <Button type="button" variant="outline" onClick={() => setIsEditModalOpen(false)} disabled={formLoading} className="border-gray-300 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors duration-200">
                                    Cancel
                                </Button>
                                <Button type="submit" disabled={formLoading} className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg shadow-md transition-colors duration-200">
                                    {formLoading ? (
                                        <>
                                            <svg className="animate-spin h-5 w-5 mr-2 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                                            </svg>
                                            Updating...
                                        </>
                                    ) : "Update Employee"}
                                </Button>
                            </DialogFooter>
                        </form>
                    </Form>
                </DialogContent>
            </Dialog>

            {/* View Employee Modal */}
            <Dialog open={isViewModalOpen} onOpenChange={setIsViewModalOpen}>
                <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                        <DialogTitle>Employee Details</DialogTitle>
                        <DialogDescription>View complete employee information</DialogDescription>
                    </DialogHeader>
                    {selectedEmployee && (
                        <div className="space-y-6">
                            {/* Avatar + Name + Role */}
                            <div className="flex items-center gap-4">
                                <div className="h-20 w-20 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-semibold shadow-sm overflow-hidden flex-shrink-0">
                                    {selectedEmployee.avatar ? (
                                        <img
                                            src={selectedEmployee.avatar}
                                            alt={selectedEmployee.fullName}
                                            className="h-full w-full object-cover"
                                        />
                                    ) : (
                                        <span className="text-2xl">
                                            {selectedEmployee.fullName.charAt(0).toUpperCase()}
                                        </span>
                                    )}
                                </div>
                                <div>
                                    <h3 className="text-2xl font-bold text-gray-900">
                                        {selectedEmployee.fullName}
                                    </h3>
                                    <p className="text-gray-600">{selectedEmployee.email}</p>
                                    <Badge className={cn("capitalize mt-2", getRoleColor(selectedEmployee.role))}>
                                        {getRoleLabel(selectedEmployee.role)}
                                    </Badge>
                                </div>
                            </div>

                            {/* Detail fields */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label className="text-sm font-medium text-gray-500">Employee ID</Label>
                                    <p className="text-sm font-semibold text-gray-900 mt-0.5">{selectedEmployee.employeeId || "—"}</p>
                                </div>
                                <div>
                                    <Label className="text-sm font-medium text-gray-500">Gender</Label>
                                    <p className="text-sm font-semibold text-gray-900 mt-0.5">{selectedEmployee.gender || "—"}</p>
                                </div>
                                <div>
                                    <Label className="text-sm font-medium text-gray-500">Date of Birth</Label>
                                    <p className="text-sm font-semibold text-gray-900 mt-0.5">
                                        {selectedEmployee.dateOfBirth
                                            ? new Date(selectedEmployee.dateOfBirth).toLocaleDateString()
                                            : "—"}
                                    </p>
                                </div>
                                <div>
                                    <Label className="text-sm font-medium text-gray-500">Hometown</Label>
                                    <p className="text-sm font-semibold text-gray-900 mt-0.5">{selectedEmployee.hometown || "—"}</p>
                                </div>
                                <div className="col-span-2">
                                    <Label className="text-sm font-medium text-gray-500">University</Label>
                                    <p className="text-sm font-semibold text-gray-900 mt-0.5">{selectedEmployee.university || "—"}</p>
                                </div>
                                <div className="col-span-2">
                                    <Label className="text-sm font-medium text-gray-500">Created At</Label>
                                    <p className="text-sm font-semibold text-gray-900 mt-0.5">
                                        {new Date(selectedEmployee.createdAt).toLocaleDateString()}
                                    </p>
                                </div>
                            </div>

                        </div>
                    )}
                </DialogContent>
            </Dialog>

            {/* Delete Confirm Modal */}
            <AlertDialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete{" "}
                            <span className="font-semibold">{selectedEmployee?.fullName}</span>'s record.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDeleteEmployee}
                            className="bg-red-600 hover:bg-red-700"
                        >
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
};

export default EmployeesPage;