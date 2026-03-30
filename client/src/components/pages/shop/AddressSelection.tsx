import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { addAddress, AddressInput, deleteAddress, updateAddress } from '@/lib/addressApi';
import { useUserStore } from '@/lib/store';
import { Address } from '@/types/type';
import { Edit, MapPin, Plus, Trash2 } from 'lucide-react';
import React, { useEffect, useState } from 'react'
import { toast } from 'sonner';


interface AddressSelectionProps {
    selectedAddress: Address | null;
    onAddressSelect: (address: Address) => void;
    addresses: Address[];
    onAddressesUpdate: (addresses: Address[]) => void;
}


const AddressSelection: React.FC<AddressSelectionProps> = ({
    selectedAddress,
    onAddressSelect,
    addresses,
    onAddressesUpdate,
}) => {
    const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [editingAddress, setEditingAddress] = useState<Address | null>(null);
    const [formData, setFormData] = useState<AddressInput>({
        street: "",
        city: "",
        country: "",
        postalCode: "",
        isDefault: false,
    });
    const [isLoading, setIsLoading] = useState(false);

    // Update form when dialog opens
    useEffect(() => {
        if (isAddDialogOpen) {
            resetForm();
        }
    }, [isAddDialogOpen, addresses.length]);

    const resetForm = () => {
        setFormData({
            street: "",
            city: "",
            country: "",
            postalCode: "",
            isDefault: addresses.length === 0, // Auto-check if this is the first address
        });
    };

    const handleAddAddress = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!authUser || !auth_token) return;

        setIsLoading(true);
        try {
            const result = await addAddress(authUser._id, formData, auth_token);
            onAddressesUpdate(result.addresses || []);
            toast.success(result.message);
            setIsAddDialogOpen(false);
            resetForm();
        } catch (error) {
            toast.error(
                error instanceof Error ? error.message : "Failed to add address"
            );
        } finally {
            setIsLoading(false);
        }
    };

    const handleEditAddress = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!authUser || !auth_token || !editingAddress) return;

        setIsLoading(true);
        try {
            const result = await updateAddress(
                authUser._id,
                editingAddress._id,
                formData,
                auth_token
            );
            onAddressesUpdate(result.addresses || []);
            toast.success(result.message);
            setIsEditDialogOpen(false);
            setEditingAddress(null);
            resetForm();
        } catch (error) {
            toast.error(
                error instanceof Error ? error.message : "Failed to update address"
            );
        } finally {
            setIsLoading(false);
        }
    };

    const handleDeleteAddress = async (addressId: string) => {
        if (!authUser || !auth_token) return;

        setIsLoading(true);
        try {
            const result = await deleteAddress(authUser._id, addressId, auth_token);
            onAddressesUpdate(result.addresses || []);
            toast.success(result.message);
        } catch (error) {
            toast.error(
                error instanceof Error ? error.message : "Failed to delete address"
            );
        } finally {
            setIsLoading(false);
        }
    };

    const openEditDialog = (address: Address) => {
        setEditingAddress(address);
        setFormData({
            street: address.street,
            city: address.city,
            country: address.country,
            postalCode: address.postalCode,
            isDefault: address.isDefault,
        });
        setIsEditDialogOpen(true);
    };

    const { authUser, auth_token } = useUserStore();
    return <Card className="w-full">
        <CardHeader>
            <CardTitle>Shipping Address</CardTitle>
        </CardHeader>
        <CardContent>
            {addresses?.length === 0 ? (
                <div className="text-center py-12 px-6">
                    <div className="w-20 h-20 mx-auto mb-6 bg-gray-100 rounded-full flex items-center justify-center">
                        <MapPin className="w-10 h-10 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        No shipping address found
                    </h3>
                    <p className="text-gray-600 mb-6 max-w-md mx-auto">
                        Add your shipping address to proceed with your order. This will be
                        used for delivery.
                    </p>
                    <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                        <DialogTrigger asChild>
                            <Button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2">
                                <Plus className="w-4 h-4 mr-2" />
                                Add Your First Address
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Add New Address</DialogTitle>
                            </DialogHeader>
                            <form onSubmit={handleAddAddress} className="space-y-6">
                                <div className="space-y-4">
                                    <div>
                                        <Label
                                            htmlFor="street"
                                            className="text-sm font-medium text-gray-700"
                                        >
                                            Street Address *
                                        </Label>
                                        <Input
                                            id="street"
                                            value={formData.street}
                                            onChange={(e) =>
                                                setFormData({ ...formData, street: e.target.value })
                                            }
                                            placeholder="123 Main Street, Apt 4B"
                                            required
                                            className="mt-1"
                                        />
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div>
                                            <Label
                                                htmlFor="city"
                                                className="text-sm font-medium text-gray-700"
                                            >
                                                City *
                                            </Label>
                                            <Input
                                                id="city"
                                                value={formData.city}
                                                onChange={(e) =>
                                                    setFormData({ ...formData, city: e.target.value })
                                                }
                                                placeholder="New York"
                                                required
                                                className="mt-1"
                                            />
                                        </div>
                                        <div>
                                            <Label
                                                htmlFor="postalCode"
                                                className="text-sm font-medium text-gray-700"
                                            >
                                                Postal Code *
                                            </Label>
                                            <Input
                                                id="postalCode"
                                                value={formData.postalCode}
                                                onChange={(e) =>
                                                    setFormData({
                                                        ...formData,
                                                        postalCode: e.target.value,
                                                    })
                                                }
                                                placeholder="10001"
                                                required
                                                className="mt-1"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <Label
                                            htmlFor="country"
                                            className="text-sm font-medium text-gray-700"
                                        >
                                            Country *
                                        </Label>
                                        <Input
                                            id="country"
                                            value={formData.country}
                                            onChange={(e) =>
                                                setFormData({ ...formData, country: e.target.value })
                                            }
                                            placeholder="United States"
                                            required
                                            className="mt-1"
                                        />
                                    </div>
                                </div>

                                <div className="border-t pt-4">
                                    <div className="flex items-center space-x-3">
                                        <input
                                            type="checkbox"
                                            id="isDefault"
                                            checked={formData.isDefault}
                                            onChange={(e) =>
                                                setFormData({
                                                    ...formData,
                                                    isDefault: e.target.checked,
                                                })
                                            }
                                            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                        />
                                        <Label
                                            htmlFor="isDefault"
                                            className="text-sm text-gray-700"
                                        >
                                            Set as default shipping address
                                        </Label>
                                    </div>
                                    {addresses.length === 0 && (
                                        <div className="mt-3 text-sm text-blue-600 bg-blue-50 p-3 rounded-lg">
                                            💡 This will be your primary shipping address for future
                                            orders
                                        </div>
                                    )}
                                </div>

                                <div className="flex flex-col sm:flex-row gap-3 pt-4">
                                    <Button
                                        type="submit"
                                        disabled={isLoading}
                                        className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                                    >
                                        {isLoading ? (
                                            <>
                                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                                                Adding...
                                            </>
                                        ) : (
                                            "Add Address"
                                        )}
                                    </Button>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => setIsAddDialogOpen(false)}
                                        className="flex-1 sm:flex-none sm:min-w-[100px]"
                                    >
                                        Cancel
                                    </Button>
                                </div>
                            </form>
                        </DialogContent>
                    </Dialog>
                </div>
            ) : (
                <>
                    {addresses.length === 1 && (
                        <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                            <p className="text-sm text-green-800">
                                ✓ Your address has been automatically selected for shipping
                            </p>
                        </div>
                    )}

                    <RadioGroup
                        value={selectedAddress?._id || ""}
                        onValueChange={(value) => {
                            const address = addresses.find((addr) => addr._id === value);
                            if (address) {
                                onAddressSelect(address);
                            }
                        }}
                    >
                        <div className="space-y-4">
                            {addresses.map((address) => (
                                <div
                                    key={address._id}
                                    className={`relative p-4 border-2 rounded-xl transition-all duration-200 hover:shadow-md ${selectedAddress?._id === address._id
                                        ? "border-blue-500 bg-blue-50/50 ring-2 ring-blue-500/20"
                                        : "border-gray-200 hover:border-gray-300"
                                        }`}
                                >
                                    <div className="flex items-start space-x-4">
                                        {/* Radio Button */}
                                        <RadioGroupItem
                                            value={address._id}
                                            id={address._id}
                                            className="mt-1 flex-shrink-0"
                                        />

                                        {/* Address Content */}
                                        <div className="flex-1 min-w-0">
                                            <Label
                                                htmlFor={address._id}
                                                className="cursor-pointer block"
                                            >
                                                {/* Address Header */}
                                                <div className="flex flex-wrap items-center gap-2 mb-2">
                                                    <div className="flex items-center gap-2">
                                                        <MapPin className="w-4 h-4 text-gray-500" />
                                                        <span className="font-semibold text-gray-900">
                                                            Shipping Address
                                                        </span>
                                                    </div>
                                                    {address.isDefault && (
                                                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                                            ✓ Default
                                                        </span>
                                                    )}
                                                </div>

                                                {/* Address Details */}
                                                <div className="space-y-1">
                                                    <div className="font-medium text-gray-900">
                                                        {address.street}
                                                    </div>
                                                    <div className="text-sm text-gray-600 flex flex-wrap gap-1">
                                                        <span>{address.city},</span>
                                                        <span>{address.country}</span>
                                                        <span>{address.postalCode}</span>
                                                    </div>
                                                </div>
                                            </Label>
                                        </div>

                                        {/* Action Buttons */}
                                        <div className="flex flex-col sm:flex-row gap-1 flex-shrink-0">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => openEditDialog(address)}
                                                className="p-2 h-8 w-8 hover:bg-gray-100"
                                                title="Edit Address"
                                            >
                                                <Edit className="w-4 h-4" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => handleDeleteAddress(address._id)}
                                                disabled={isLoading}
                                                className="p-2 h-8 w-8 hover:bg-red-50 hover:text-red-600"
                                                title="Delete Address"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    </div>

                                    {/* Selected Indicator */}
                                    {selectedAddress?._id === address._id && (
                                        <div className="absolute top-2 right-2">
                                            <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </RadioGroup>

                    <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                        <DialogTrigger asChild>
                            <Button
                                variant="outline"
                                className="w-full mt-4 h-12 border-2 border-dashed border-gray-300 hover:border-blue-400 hover:bg-blue-50 transition-colors duration-200"
                            >
                                <Plus className="w-5 h-5 mr-2" />
                                Add New Address
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Add New Address</DialogTitle>
                            </DialogHeader>
                            <form onSubmit={handleAddAddress} className="space-y-4">
                                <div>
                                    <Label htmlFor="street">Street Address</Label>
                                    <Input
                                        id="street"
                                        value={formData.street}
                                        onChange={(e) =>
                                            setFormData({ ...formData, street: e.target.value })
                                        }
                                        placeholder="123 Main St"
                                        required
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="city">City</Label>
                                    <Input
                                        id="city"
                                        value={formData.city}
                                        onChange={(e) =>
                                            setFormData({ ...formData, city: e.target.value })
                                        }
                                        placeholder="New York"
                                        required
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="country">Country</Label>
                                    <Input
                                        id="country"
                                        value={formData.country}
                                        onChange={(e) =>
                                            setFormData({ ...formData, country: e.target.value })
                                        }
                                        placeholder="United States"
                                        required
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="postalCode">Postal Code</Label>
                                    <Input
                                        id="postalCode"
                                        value={formData.postalCode}
                                        onChange={(e) =>
                                            setFormData({ ...formData, postalCode: e.target.value })
                                        }
                                        placeholder="10001"
                                        required
                                    />
                                </div>
                                <div className="flex items-center space-x-2">
                                    <input
                                        type="checkbox"
                                        id="isDefault"
                                        checked={formData.isDefault}
                                        onChange={(e) =>
                                            setFormData({
                                                ...formData,
                                                isDefault: e.target.checked,
                                            })
                                        }
                                    />
                                    <Label htmlFor="isDefault">Set as default address</Label>
                                </div>
                                <div className="flex gap-2">
                                    <Button type="submit" disabled={isLoading}>
                                        {isLoading ? "Adding..." : "Add Address"}
                                    </Button>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => setIsAddDialogOpen(false)}
                                    >
                                        Cancel
                                    </Button>
                                </div>
                            </form>
                        </DialogContent>
                    </Dialog>

                    <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Edit Address</DialogTitle>
                            </DialogHeader>
                            <form onSubmit={handleEditAddress} className="space-y-4">
                                <div>
                                    <Label htmlFor="edit-street">Street Address</Label>
                                    <Input
                                        id="edit-street"
                                        value={formData.street}
                                        onChange={(e) =>
                                            setFormData({ ...formData, street: e.target.value })
                                        }
                                        placeholder="123 Main St"
                                        required
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="edit-city">City</Label>
                                    <Input
                                        id="edit-city"
                                        value={formData.city}
                                        onChange={(e) =>
                                            setFormData({ ...formData, city: e.target.value })
                                        }
                                        placeholder="New York"
                                        required
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="edit-country">Country</Label>
                                    <Input
                                        id="edit-country"
                                        value={formData.country}
                                        onChange={(e) =>
                                            setFormData({ ...formData, country: e.target.value })
                                        }
                                        placeholder="United States"
                                        required
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="edit-postalCode">Postal Code</Label>
                                    <Input
                                        id="edit-postalCode"
                                        value={formData.postalCode}
                                        onChange={(e) =>
                                            setFormData({ ...formData, postalCode: e.target.value })
                                        }
                                        placeholder="10001"
                                        required
                                    />
                                </div>
                                <div className="flex items-center space-x-2">
                                    <input
                                        type="checkbox"
                                        id="edit-isDefault"
                                        checked={formData.isDefault}
                                        onChange={(e) =>
                                            setFormData({
                                                ...formData,
                                                isDefault: e.target.checked,
                                            })
                                        }
                                    />
                                    <Label htmlFor="edit-isDefault">
                                        Set as default address
                                    </Label>
                                </div>
                                <div className="flex gap-2">
                                    <Button type="submit" disabled={isLoading}>
                                        {isLoading ? "Updating..." : "Update Address"}
                                    </Button>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => setIsEditDialogOpen(false)}
                                    >
                                        Cancel
                                    </Button>
                                </div>
                            </form>
                        </DialogContent>
                    </Dialog>
                </>
            )}
        </CardContent>
    </Card>
}

export default AddressSelection