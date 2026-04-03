"use client"

import { createOrderFromCart, getOrderById, Order } from '@/lib/orderApi';
import { useCartStore, useUserStore, useOrderStore } from '@/lib/store';
import { Address } from '@/types/type';
import { useRouter, useSearchParams } from 'next/navigation';
import React, { useEffect, useState } from 'react'
import { toast } from 'sonner';
import CheckoutSkeleton from '../skeleton/CheckoutSkeleton';
import Container from '@/components/common/container'
import { Button } from '../ui/button';
import PageBreadcrumb from '../common/PageBreadcrumb';
import { AlertCircle, CreditCard, Lock, Truck } from 'lucide-react';
import PriceFormatter from '../common/PriceFormatter';
import { Separator } from '../ui/separator';
import Image from 'next/image';
import AddressSelection from './shop/AddressSelection';
import { createCheckoutSession, redirectToCheckout, StripeCheckoutItem } from '@/lib/stripe';

const CheckoutPageClient = () => {
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);
  const [selectedAddress, setSelectedAddress] = useState<Address | null>(null);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [isCreatingOrder, setIsCreatingOrder] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<"card" | "cod">("card");
  const searchParams = useSearchParams();
  const router = useRouter();
  const { auth_token, authUser, isAuthenticated, verifyAuth } = useUserStore();
  const { cartItemsWithQuantities, clearCart } = useCartStore();
  const { addOrder } = useOrderStore();

  const orderId = searchParams.get("orderId");
  // Verify authentication on component mount
  useEffect(() => {
    const checkAuth = async () => {
      console.log("Checkout: Starting auth check", {
        auth_token: !!auth_token,
        authUser: !!authUser,
      });
      setAuthLoading(true);
      if (auth_token && !authUser) {
        console.log("Checkout: Calling verifyAuth");
        await verifyAuth();
      }
      console.log("Checkout: Auth check complete");
      setAuthLoading(false);
    };

    checkAuth();
  }, [auth_token, authUser, verifyAuth]);

  useEffect(() => {
    // Wait for auth check to complete
    if (authLoading) {
      console.log("Checkout: Waiting for auth check to complete");
      return;
    }

    console.log(
      "Checkout: Auth check complete, checking authentication state",
      {
        isAuthenticated,
        authUser: !!authUser,
        auth_token: !!auth_token,
      }
    );

    // Check if user is authenticated
    if (!isAuthenticated || !authUser || !auth_token) {
      console.log("Checkout: User not authenticated, redirecting to signin");
      toast.error("Please sign in to continue with checkout");
      router.push("/auth/signin");
      return;
    }

    // Load user addresses
    if (authUser.addresses && authUser.addresses.length > 0) {
      setAddresses(authUser.addresses);
      // Auto-select address logic
      if (authUser.addresses.length === 1) {
        // If only one address, select it automatically
        setSelectedAddress(authUser.addresses[0]);
      } else {
        // If multiple addresses, prefer default address
        const defaultAddress = authUser.addresses.find(
          (addr) => addr.isDefault
        );
        setSelectedAddress(defaultAddress || authUser.addresses[0]);
      }
    }

    const initializeCheckout = async () => {
      setLoading(true);
      try {
        if (orderId) {
          // If orderId is provided, load existing order
          console.log("Checkout: Fetching order", orderId);
          const orderData = await getOrderById(orderId, auth_token);
          if (orderData) {
            console.log("Checkout: Order fetched successfully");
            setOrder(orderData);
          } else {
            toast.error("Order not found");
            router.push("/user/cart");
          }
        } else {
          // If no orderId, check if we have cart items
          if (cartItemsWithQuantities.length === 0) {
            toast.error("Your cart is empty");
            router.push("/user/cart");
            return;
          }

          // Create a temporary order object for display
          const tempOrder: Order = {
            _id: "temp",
            userId: authUser._id,
            items: cartItemsWithQuantities.map((item) => ({
              productId: item.product._id,
              name: item.product.name,
              price: item.product.price,
              quantity: item.quantity,
              image: item.product.image,
            })),
            total: cartItemsWithQuantities.reduce(
              (total, item) => total + item.product.price * item.quantity,
              0
            ),
            status: "pending",
            shippingAddress: {
              street: "",
              city: "",
              country: "",
              postalCode: "",
            },
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };
          setOrder(tempOrder);
        }
      } catch (error) {
        console.error("Error initializing checkout:", error);
        toast.error("Failed to load checkout details");
        router.push("/user/cart");
      } finally {
        setLoading(false);
      }
    };

    initializeCheckout();
  }, [
    orderId,
    auth_token,
    router,
    isAuthenticated,
    authUser,
    authLoading,
    cartItemsWithQuantities,
  ]);

  const handleAddressesUpdate = (updatedAddresses: Address[]) => {
    setAddresses(updatedAddresses);

    // Auto-select address logic
    if (updatedAddresses.length === 1) {
      // If only one address, select it automatically
      setSelectedAddress(updatedAddresses[0]);
    } else if (updatedAddresses.length > 1) {
      // If multiple addresses, prefer default or keep current selection
      const defaultAddress = updatedAddresses.find((addr) => addr.isDefault);
      if (defaultAddress) {
        setSelectedAddress(defaultAddress);
      } else if (
        !selectedAddress ||
        !updatedAddresses.find((addr) => addr._id === selectedAddress._id)
      ) {
        // If no default and current selection is invalid, select first
        setSelectedAddress(updatedAddresses[0]);
      }
    } else {
      // No addresses, clear selection
      setSelectedAddress(null);
    }
  };

  const calculateSubtotal = () => {
    if (!order) return 0;
    return order.items.reduce(
      (total, item) => total + item.price * item.quantity,
      0
    );
  };

  const calculateShipping = () => {
    const subtotal = calculateSubtotal();
    return subtotal > 100 ? 0 : 15;
  };

  const calculateTax = () => {
    const subtotal = calculateSubtotal();
    return subtotal * 0.08; // 8% tax
  };

  const calculateTotal = () => {
    return calculateSubtotal() + calculateShipping() + calculateTax();
  };

  const handleCheckout = async () => {
    if (!order) return;

    if (!selectedAddress) {
      toast.error("Please select a shipping address");
      return;
    }

    setProcessing(true);
    try {
      let finalOrder = order;

      // If this is a temporary order (from cart), create the actual order first
      if (order._id === "temp") {
        setIsCreatingOrder(true);
        const orderItems = cartItemsWithQuantities.map((item) => ({
          _id: item.product._id,
          name: item.product.name,
          price: item.product.price,
          quantity: item.quantity,
          image: item.product.image,
        }));

        const response = await createOrderFromCart(
          auth_token!,
          orderItems,
          selectedAddress,
          paymentMethod
        );

        if (!response.success || !response.order) {
          throw new Error(response.message || "Failed to create order");
        }

        finalOrder = response.order;
        setOrder(finalOrder);
        addOrder(finalOrder);

        // Clear cart after successful order creation
        await clearCart();
        setIsCreatingOrder(false);
      }

      if (paymentMethod === "cod") {
        toast.success("Cash on Delivery order placed successfully. Check My Orders.");
        router.push("/user/orders");
        return;
      }

      // Stripe payment flow
      const stripeItems: StripeCheckoutItem[] = finalOrder.items.map((item) => ({
        name: item.name,
        description: `Quantity: ${item.quantity}`,
        amount: Math.round(item.price * 100),
        currency: "usd",
        quantity: item.quantity,
        images: item.image ? [item.image] : undefined,
      }));

      const shipping = calculateShipping();
      const tax = calculateTax();

      if (shipping > 0) {
        stripeItems.push({
          name: "Shipping",
          description: "Standard shipping",
          amount: Math.round(shipping * 100),
          currency: "usd",
          quantity: 1,
        });
      }

      if (tax > 0) {
        stripeItems.push({
          name: "Tax",
          description: "Sales tax",
          amount: Math.round(tax * 100),
          currency: "usd",
          quantity: 1,
        });
      }

      const result = await createCheckoutSession({
        items: stripeItems,
        customerEmail: authUser?.email,
        successUrl: `${window.location.origin}/success?orderId=${finalOrder._id}&session_id={CHECKOUT_SESSION_ID}`,
        cancelUrl: `${window.location.origin}/user/checkout?orderId=${finalOrder._id}`,
        metadata: {
          orderId: finalOrder._id,
          shippingAddress: JSON.stringify(selectedAddress),
        },
      });

      if (result && "url" in result) {
        redirectToCheckout(result.url as string);
      } else {
        throw new Error("Unable to get Stripe checkout URL");
      }
    } catch (error) {
      console.error("Error processing payment:", error);
      toast.error("Payment failed. Please try again.");
    } finally {
      setProcessing(false);
      setIsCreatingOrder(false);
    }
  };

  if (loading || authLoading) {
    return <CheckoutSkeleton />
  }


  if (!order) {
    return (
      <Container className="py-16">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              Order Not Found
            </h1>
            <p className="text-gray-600 mb-6">
              The order you&apos;re looking for doesn&apos;t exist or has been
              removed.
            </p>
            <Button onClick={() => router.push("/cart")}>Return to Cart</Button>
          </div>
        </div>
      </Container>
    );
  }
  return (
    <Container className="py-8">
      {/* Breadcrumb */}
      <PageBreadcrumb
        items={[{ label: "Cart", href: "/cart" }]}
        currentPage="Checkout"
      />

      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">Checkout</h1>
        <p className="text-gray-600">Complete your order</p>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Order Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Shipping Address */}
          <AddressSelection
            selectedAddress={selectedAddress}
            onAddressSelect={setSelectedAddress}
            addresses={addresses}
            onAddressesUpdate={handleAddressesUpdate}
          />

          {/* Order Items */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">
              Order Details
            </h2>

            <div className="space-y-4">
              {order.items.map((item, index) => (
                <div
                  key={index.toString()}
                  className="flex items-center gap-4 p-4 border border-gray-100 rounded-lg"
                >
                  <div className="relative w-16 h-16 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                    {item.image ? (
                      <Image
                        src={item.image}
                        alt={item.name}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                        <CreditCard className="w-6 h-6 text-gray-400" />
                      </div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-gray-900 mb-1">
                      {item.name}
                    </h3>
                    <p className="text-sm text-gray-600">
                      Quantity: {item.quantity} ×{" "}
                      <PriceFormatter amount={item.price} />
                    </p>
                  </div>

                  <div className="text-right">
                    <PriceFormatter
                      amount={item.price * item.quantity}
                      className="text-base font-semibold text-gray-900"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Payment Information */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">
              Payment Method
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setPaymentMethod("card")}
                className={`rounded-lg p-4 text-left border transition ${paymentMethod === "card"
                    ? "border-blue-500 bg-blue-50"
                    : "border-gray-200 bg-white"
                  }`}
              >
                <div className="flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-blue-600" />
                  <div>
                    <p className="font-medium text-gray-900">Card Payment</p>
                    <p className="text-sm text-gray-600">Credit/debit card via Stripe</p>
                  </div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod("cod")}
                className={`rounded-lg p-4 text-left border transition ${paymentMethod === "cod"
                    ? "border-blue-500 bg-blue-50"
                    : "border-gray-200 bg-white"
                  }`}
              >
                <div className="flex items-center gap-2">
                  <Truck className="w-5 h-5 text-green-600" />
                  <div>
                    <p className="font-medium text-gray-900">Cash on Delivery</p>
                    <p className="text-sm text-gray-600">Pay when the order arrives</p>
                  </div>
                </div>
              </button>
            </div>

            <div className="mt-4 flex items-center gap-2 text-sm text-gray-600">
              <Lock className="w-4 h-4" />
              <span>
                Your selection will be saved and applied to the order. For card payments, you will be redirected to Stripe.
              </span>
            </div>
          </div>
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 sticky top-4">
            <h2 className="text-xl font-bold text-gray-900 mb-6">
              Order Summary
            </h2>

            <div className="space-y-4">
              <div className="flex justify-between items-center py-2">
                <span className="text-gray-600">Subtotal</span>
                <PriceFormatter
                  amount={calculateSubtotal()}
                  className="text-base font-medium text-gray-900"
                />
              </div>

              <div className="flex justify-between items-center py-2">
                <span className="text-gray-600">Shipping</span>
                <span className="text-base font-medium">
                  {calculateShipping() === 0 ? (
                    <span className="text-green-600">Free shipping</span>
                  ) : (
                    <PriceFormatter
                      amount={calculateShipping()}
                      className="text-base font-medium text-gray-900"
                    />
                  )}
                </span>
              </div>

              <div className="flex justify-between items-center py-2">
                <span className="text-gray-600">Tax</span>
                <PriceFormatter
                  amount={calculateTax()}
                  className="text-base font-medium text-gray-900"
                />
              </div>

              {calculateShipping() === 0 && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                  <p className="text-green-700 text-sm font-medium">
                    🎉 You qualify for free shipping!
                  </p>
                </div>
              )}

              <Separator className="my-4" />

              <div className="flex justify-between items-center py-2">
                <span className="text-lg font-bold text-gray-900">Total</span>
                <PriceFormatter
                  amount={calculateTotal()}
                  className="text-xl font-bold text-gray-900"
                />
              </div>
            </div>

            <Button
              size="lg"
              onClick={handleCheckout}
              disabled={processing || isCreatingOrder || !selectedAddress}
              className="w-full mt-6 bg-blue-600 hover:bg-blue-700 text-white rounded-full py-3 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {processing ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  Processing...
                </>
              ) : isCreatingOrder ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  Creating Order...
                </>
              ) : !selectedAddress ? (
                <>
                  <AlertCircle className="w-4 h-4 mr-2" />
                  Select Address to Continue
                </>
              ) : (
                <>
                  <Lock className="w-4 h-4 mr-2" />
                  {paymentMethod === "card" ? "Pay with Card" : "Place Cash on Delivery Order"}
                </>
              )}
            </Button>

            {!selectedAddress && (
              <div className="mt-2 text-center">
                <p className="text-sm text-amber-600">
                  Please select a shipping address to proceed with payment
                </p>
              </div>
            )}

            <div className="mt-4 text-center">
              <p className="text-xs text-gray-500">
                Secure checkout • SSL encrypted • Powered by Stripe
              </p>
            </div>
          </div>
        </div>
      </div>
    </Container>
  )
}

export default CheckoutPageClient