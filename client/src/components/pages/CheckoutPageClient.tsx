"use client"

import { createOrderFromCart, getOrderById, Order, updateOrderStatus } from '@/lib/orderApi';
import { useCartStore, useUserStore, useOrderStore } from '@/lib/store';
import { Address } from '@/types/type';
import { useRouter, useSearchParams } from 'next/navigation';
import React, { useEffect, useRef, useState } from 'react'
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
import { payWithMetaMask, isMetaMaskInstalled } from '@/lib/metamaskApi';

// ── Icon MetaMask SVG ────────────────────────────────────────────────────────
const MetaMaskIcon = () => (
  <svg width="20" height="20" viewBox="0 0 318 318" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M274.1 35.5L174.6 109.7L193 65.8L274.1 35.5Z" fill="#E2761B" stroke="#E2761B" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M44.4 35.5L143.1 110.4L125.5 65.8L44.4 35.5Z" fill="#E4761B" stroke="#E4761B" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M238.3 206.8L211.8 247.4L268.5 263L284.8 207.7L238.3 206.8Z" fill="#E4761B" stroke="#E4761B" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M33.9 207.7L50.1 263L106.8 247.4L80.3 206.8L33.9 207.7Z" fill="#E4761B" stroke="#E4761B" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M103.6 138.2L87.8 162.1L144.1 164.6L142.1 104.1L103.6 138.2Z" fill="#E4761B" stroke="#E4761B" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M214.9 138.2L175.9 103.4L174.6 164.6L230.8 162.1L214.9 138.2Z" fill="#E4761B" stroke="#E4761B" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M106.8 247.4L140.6 230.9L111.4 208.1L106.8 247.4Z" fill="#E4761B" stroke="#E4761B" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M177.9 230.9L211.8 247.4L207.1 208.1L177.9 230.9Z" fill="#E4761B" stroke="#E4761B" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

// ── Icon dấu tích ────────────────────────────────────────────────────────────
const CheckIcon = () => (
  <span className="ml-auto text-blue-500">
    <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2.5}>
      <path d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  </span>
);

type PaymentMethod = "card" | "cod";
type CardGateway = "stripe" | "metamask";

const CheckoutPageClient = () => {
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);
  const [selectedAddress, setSelectedAddress] = useState<Address | null>(null);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [isCreatingOrder, setIsCreatingOrder] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("card");
  const [cardGateway, setCardGateway] = useState<CardGateway>("stripe");

  const searchParams = useSearchParams();
  const router = useRouter();
  const { auth_token, authUser, isAuthenticated, verifyAuth } = useUserStore();
  const { cartItemsWithQuantities, clearCart } = useCartStore();
  const { addOrder } = useOrderStore();
  const initializedRef = useRef(false);

  const orderId = searchParams.get("orderId");

  // ── Auth check ───────────────────────────────────────────────────────────
  useEffect(() => {
    const checkAuth = async () => {
      setAuthLoading(true);
      if (auth_token && !authUser) await verifyAuth();
      setAuthLoading(false);
    };
    checkAuth();
  }, [auth_token, authUser, verifyAuth]);

  // ── Init checkout ────────────────────────────────────────────────────────
  useEffect(() => {
    if (authLoading) return;

    if (!isAuthenticated || !authUser || !auth_token) {
      toast.error("Please sign in to continue with checkout");
      router.push("/auth/signin");
      return;
    }

    if (authUser.addresses && authUser.addresses.length > 0) {
      setAddresses(authUser.addresses);
      if (authUser.addresses.length === 1) {
        setSelectedAddress(authUser.addresses[0]);
      } else {
        const defaultAddress = authUser.addresses.find((addr) => addr.isDefault);
        setSelectedAddress(defaultAddress || authUser.addresses[0]);
      }
    }

    if (initializedRef.current) return;
    initializedRef.current = true;

    const initializeCheckout = async () => {
      setLoading(true);
      try {
        if (orderId) {
          const orderData = await getOrderById(orderId, auth_token);
          if (orderData) {
            setOrder(orderData);
          } else {
            toast.error("Order not found");
            router.push("/user/cart");
          }
        } else {
          if (cartItemsWithQuantities.length === 0) {
            toast.error("Your cart is empty");
            router.push("/user/cart");
            return;
          }
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
              (total, item) => total + item.product.price * item.quantity, 0
            ),
            status: "pending",
            paymentStatus: "pending",
            paymentMethod: "card",
            shippingAddress: { street: "", city: "", country: "", postalCode: "" },
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
  }, [authLoading, isAuthenticated, authUser, auth_token, orderId, cartItemsWithQuantities, router]);

  const handleAddressesUpdate = (updatedAddresses: Address[]) => {
    setAddresses(updatedAddresses);
    if (updatedAddresses.length === 1) {
      setSelectedAddress(updatedAddresses[0]);
    } else if (updatedAddresses.length > 1) {
      const defaultAddress = updatedAddresses.find((addr) => addr.isDefault);
      if (defaultAddress) {
        setSelectedAddress(defaultAddress);
      } else if (!selectedAddress || !updatedAddresses.find((addr) => addr._id === selectedAddress._id)) {
        setSelectedAddress(updatedAddresses[0]);
      }
    } else {
      setSelectedAddress(null);
    }
  };

  const calculateSubtotal = () => {
    if (!order) return 0;
    return order.items.reduce((total, item) => total + item.price * item.quantity, 0);
  };
  const calculateShipping = () => (calculateSubtotal() > 100 ? 0 : 15);
  const calculateTax = () => calculateSubtotal() * 0.08;
  const calculateTotal = () => calculateSubtotal() + calculateShipping() + calculateTax();

  // ── Tạo order thật từ cart ───────────────────────────────────────────────
  const ensureOrder = async (): Promise<Order | null> => {
    if (!order || !auth_token || !selectedAddress) return null;
    if (order._id !== "temp") return order;

    setIsCreatingOrder(true);
    try {
      const orderItems = cartItemsWithQuantities.map((item) => ({
        _id: item.product._id,
        name: item.product.name,
        price: item.product.price,
        quantity: item.quantity,
        image: item.product.image,
      }));

      // Chỉ truyền "card" hoặc "cod" — backend không cần biết stripe/metamask
      const finalPaymentMethod: "card" | "cod" =
        paymentMethod === "cod" ? "cod" : "card";
      const response = await createOrderFromCart(
        auth_token,
        orderItems,
        selectedAddress,
        finalPaymentMethod
      );

      if (!response.success || !response.order) {
        throw new Error(response.message || "Failed to create order");
      }

      const finalOrder = response.order;
      setOrder(finalOrder);
      addOrder(finalOrder);
      await clearCart();
      return finalOrder;
    } finally {
      setIsCreatingOrder(false);
    }
  };

  // ── MetaMask payment ─────────────────────────────────────────────────────
  const handleMetaMaskPayment = async () => {
    if (!isMetaMaskInstalled()) {
      toast.error("MetaMask chưa được cài! Vui lòng cài MetaMask extension.");
      return;
    }
    if (!selectedAddress) {
      toast.error("Please select a shipping address");
      return;
    }

    setProcessing(true);
    try {
      // 1. Tạo order trong DB
      const finalOrder = await ensureOrder();
      if (!finalOrder) throw new Error("Không thể tạo đơn hàng");

      // 2. Gọi MetaMask thanh toán
      const result = await payWithMetaMask(calculateTotal());

      // 3. Cập nhật trạng thái order → giữ pending, chỉ đánh dấu paymentStatus paid
      //    Truyền transactionHash vào paymentIntentId để lưu lại tx
      await updateOrderStatus(
        finalOrder._id,
        "pending",
        auth_token!,
        result.transactionHash,
        undefined,
        "paid"
      );

      toast.success(`Thanh toán thành công! TX: ${result.transactionHash.slice(0, 16)}...`);
      router.push(`/success?orderId=${finalOrder._id}&tx=${result.transactionHash}`);
    } catch (error: any) {
      toast.error(error.message || "Thanh toán MetaMask thất bại.");
    } finally {
      setProcessing(false);
    }
  };

  // ── Stripe / COD payment ─────────────────────────────────────────────────
  const handleCheckout = async () => {
    if (!order || !selectedAddress) {
      toast.error("Please select a shipping address");
      return;
    }

    setProcessing(true);
    try {
      const finalOrder = await ensureOrder();
      if (!finalOrder) throw new Error("Không thể tạo đơn hàng");

      if (paymentMethod === "cod") {
        toast.success("Cash on Delivery order placed successfully. Check My Orders.");
        router.push("/user/orders");
        return;
      }

      // Stripe
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
      if (shipping > 0) stripeItems.push({ name: "Shipping", description: "Standard shipping", amount: Math.round(shipping * 100), currency: "usd", quantity: 1 });
      if (tax > 0) stripeItems.push({ name: "Tax", description: "Sales tax", amount: Math.round(tax * 100), currency: "usd", quantity: 1 });

      const result = await createCheckoutSession({
        items: stripeItems,
        customerEmail: authUser?.email,
        successUrl: `${window.location.origin}/success?orderId=${finalOrder._id}&session_id={CHECKOUT_SESSION_ID}`,
        cancelUrl: `${window.location.origin}/user/checkout?orderId=${finalOrder._id}`,
        metadata: { orderId: finalOrder._id, shippingAddress: JSON.stringify(selectedAddress) },
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
    }
  };

  // ── Nút thanh toán chính ─────────────────────────────────────────────────
  const handleMainAction = () => {
    if (paymentMethod === "card" && cardGateway === "metamask") {
      handleMetaMaskPayment();
    } else {
      handleCheckout();
    }
  };

  const getButtonLabel = () => {
    if (processing || isCreatingOrder) {
      return (
        <>
          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
          {isCreatingOrder ? "Creating Order..." : "Processing..."}
        </>
      );
    }
    if (!selectedAddress) return (<><AlertCircle className="w-4 h-4 mr-2" />Select Address to Continue</>);
    if (paymentMethod === "cod") return (<><Truck className="w-4 h-4 mr-2" />Place Cash on Delivery Order</>);
    if (cardGateway === "metamask") return (<><MetaMaskIcon /><span className="ml-2">Pay with MetaMask</span></>);
    return (<><Lock className="w-4 h-4 mr-2" />Pay with Card (Stripe)</>);
  };

  if (loading || authLoading) return <CheckoutSkeleton />;

  if (!order) {
    return (
      <Container className="py-16">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Order Not Found</h1>
          <p className="text-gray-600 mb-6">The order you&apos;re looking for doesn&apos;t exist or has been removed.</p>
          <Button onClick={() => router.push("/cart")}>Return to Cart</Button>
        </div>
      </Container>
    );
  }

  return (
    <Container className="py-8">
      <PageBreadcrumb items={[{ label: "Cart", href: "/cart" }]} currentPage="Checkout" />

      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">Checkout</h1>
        <p className="text-gray-600">Complete your order</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* ── Left column ── */}
        <div className="lg:col-span-2 space-y-6">

          <AddressSelection
            selectedAddress={selectedAddress}
            onAddressSelect={setSelectedAddress}
            addresses={addresses}
            onAddressesUpdate={handleAddressesUpdate}
          />

          {/* Order Items */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Order Details</h2>
            <div className="space-y-4">
              {order.items.map((item, index) => (
                <div key={index.toString()} className="flex items-center gap-4 p-4 border border-gray-100 rounded-lg">
                  <div className="relative w-16 h-16 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                    {item.image ? (
                      <Image src={item.image} alt={item.name} fill className="object-cover" />
                    ) : (
                      <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                        <CreditCard className="w-6 h-6 text-gray-400" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-gray-900 mb-1">{item.name}</h3>
                    <p className="text-sm text-gray-600">
                      Quantity: {item.quantity} × <PriceFormatter amount={item.price} />
                    </p>
                  </div>
                  <PriceFormatter amount={item.price * item.quantity} className="text-base font-semibold text-gray-900" />
                </div>
              ))}
            </div>
          </div>

          {/* ── Payment Method ── */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Payment Method</h2>

            <div className="space-y-3">
              {/* Card Payment */}
              <div className={`rounded-xl border-2 transition-all ${paymentMethod === "card" ? "border-blue-500 bg-blue-50" : "border-gray-200 bg-white"}`}>
                <button
                  type="button"
                  onClick={() => setPaymentMethod("card")}
                  className="w-full flex items-center gap-3 p-4 text-left"
                >
                  <span className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${paymentMethod === "card" ? "border-blue-500" : "border-gray-300"}`}>
                    {paymentMethod === "card" && <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />}
                  </span>
                  <CreditCard className="w-5 h-5 text-blue-600" />
                  <div>
                    <p className="font-semibold text-gray-900">Card Payment</p>
                    <p className="text-sm text-gray-500">Pay securely online</p>
                  </div>
                  {paymentMethod === "card" && <CheckIcon />}
                </button>

                {paymentMethod === "card" && (
                  <div className="px-4 pb-4 space-y-2">
                    <p className="text-sm font-medium text-gray-600 mb-2">Choose Payment Gateway:</p>

                    {/* Stripe */}
                    <button
                      type="button"
                      onClick={() => setCardGateway("stripe")}
                      className={`w-full flex items-center gap-3 rounded-lg p-3 border transition ${cardGateway === "stripe" ? "border-blue-400 bg-white" : "border-gray-200 bg-white hover:bg-gray-50"}`}
                    >
                      <span className={`w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${cardGateway === "stripe" ? "border-blue-500" : "border-gray-300"}`}>
                        {cardGateway === "stripe" && <span className="w-2 h-2 rounded-full bg-blue-500" />}
                      </span>
                      <span className="font-bold text-indigo-600 text-sm tracking-wide">stripe</span>
                      <div className="text-left">
                        <p className="font-medium text-gray-900 text-sm">Stripe</p>
                        <p className="text-xs text-gray-500">International cards (USD)</p>
                      </div>
                    </button>

                    {/* MetaMask */}
                    <button
                      type="button"
                      onClick={() => setCardGateway("metamask")}
                      className={`w-full flex items-center gap-3 rounded-lg p-3 border transition ${cardGateway === "metamask" ? "border-blue-400 bg-white" : "border-gray-200 bg-white hover:bg-gray-50"}`}
                    >
                      <span className={`w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${cardGateway === "metamask" ? "border-blue-500" : "border-gray-300"}`}>
                        {cardGateway === "metamask" && <span className="w-2 h-2 rounded-full bg-blue-500" />}
                      </span>
                      <MetaMaskIcon />
                      <div className="text-left">
                        <p className="font-medium text-gray-900 text-sm">MetaMask</p>
                        <p className="text-xs text-gray-500">Pay with ETH via Ganache</p>
                      </div>
                    </button>
                  </div>
                )}
              </div>

              {/* Cash on Delivery */}
              <button
                type="button"
                onClick={() => setPaymentMethod("cod")}
                className={`w-full flex items-center gap-3 rounded-xl p-4 border-2 text-left transition ${paymentMethod === "cod" ? "border-blue-500 bg-blue-50" : "border-gray-200 bg-white hover:bg-gray-50"}`}
              >
                <span className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${paymentMethod === "cod" ? "border-blue-500" : "border-gray-300"}`}>
                  {paymentMethod === "cod" && <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />}
                </span>
                <Truck className="w-5 h-5 text-gray-500" />
                <div>
                  <p className="font-semibold text-gray-900">Cash on Delivery</p>
                  <p className="text-sm text-gray-500">Pay when you receive</p>
                </div>
                {paymentMethod === "cod" && <CheckIcon />}
              </button>
            </div>

            <div className="mt-4 flex items-center gap-2 text-sm text-gray-500">
              <Lock className="w-4 h-4" />
              <span>Your payment info is securely processed. We never store card details.</span>
            </div>
          </div>
        </div>

        {/* ── Order Summary ── */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 sticky top-4">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Order Summary</h2>

            <div className="space-y-4">
              <div className="flex justify-between items-center py-2">
                <span className="text-gray-600">Subtotal</span>
                <PriceFormatter amount={calculateSubtotal()} className="text-base font-medium text-gray-900" />
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-gray-600">Shipping</span>
                {calculateShipping() === 0 ? (
                  <span className="text-green-600 font-medium">Free shipping</span>
                ) : (
                  <PriceFormatter amount={calculateShipping()} className="text-base font-medium text-gray-900" />
                )}
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-gray-600">Tax</span>
                <PriceFormatter amount={calculateTax()} className="text-base font-medium text-gray-900" />
              </div>

              {calculateShipping() === 0 && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                  <p className="text-green-700 text-sm font-medium">🎉 You qualify for free shipping!</p>
                </div>
              )}

              <Separator className="my-4" />

              <div className="flex justify-between items-center py-2">
                <span className="text-lg font-bold text-gray-900">Total</span>
                <PriceFormatter amount={calculateTotal()} className="text-xl font-bold text-gray-900" />
              </div>

              {paymentMethod === "card" && cardGateway === "metamask" && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <p className="text-blue-700 text-sm">
                    ≈ <span className="font-semibold">{(calculateTotal() / 2000).toFixed(6)} ETH</span>
                    <span className="text-blue-500 ml-1">(1 ETH = $2,000)</span>
                  </p>
                </div>
              )}
            </div>

            <Button
              size="lg"
              onClick={handleMainAction}
              disabled={processing || isCreatingOrder || !selectedAddress}
              className="w-full mt-6 rounded-full py-3 font-medium disabled:opacity-50 disabled:cursor-not-allowed text-white transition bg-blue-600 hover:bg-blue-700"
            >
              {getButtonLabel()}
            </Button>

            {!selectedAddress && (
              <p className="mt-2 text-center text-sm text-amber-600">
                Please select a shipping address to proceed with payment
              </p>
            )}

            <div className="mt-4 text-center">
              <p className="text-xs text-gray-500">
                {paymentMethod === "card" && cardGateway === "metamask"
                  ? "Secured by MetaMask • Ganache local network"
                  : "Secure checkout • SSL encrypted • Powered by Stripe"}
              </p>
            </div>
          </div>
        </div>
      </div>
    </Container>
  );
};

export default CheckoutPageClient;