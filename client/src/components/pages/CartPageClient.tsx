"use client"
import { useCartStore, useUserStore } from '@/lib/store';
import { useRouter } from 'next/router';
import React, { useEffect, useState } from 'react'
import { toast } from 'sonner';

const CartPageClient = () => {
  const {
    cartItemsWithQuantities,
    removeFromCart,
    updateCartItemQuantity,
    clearCart,
    syncCartFromServer,
  } = useCartStore();
  const { auth_token } = useUserStore();
  const [showClearDialog, setShowClearDialog] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const initializeCart = async () => {
      if (auth_token) {
        try {
          await syncCartFromServer();
        } catch (error) {
          console.error("Failed to sync cart:", error);
        }
      }
      setIsLoading(false);
    };

    initializeCart();
  }, [auth_token, syncCartFromServer]);

  const calculateSubtotal = () => {
    return cartItemsWithQuantities.reduce(
      (total, item) => total + item.product.price * item.quantity,
      0
    );
  };

  const calculateTotal = () => {
    const subtotal = calculateSubtotal();
    const shipping = subtotal > 100 ? 0 : 15; // Free shipping over $100
    const tax = subtotal * 0.08; // 8% tax
    return subtotal + shipping + tax;
  };

    const handleRemoveItem = async (itemId: string) => {
    try {
      await removeFromCart(itemId);
      toast.success("Item removed from cart");
    } catch (error) {
      console.error("Failed to remove item:", error);
      toast.error("Failed to remove item from cart");
    }
  };
  
  const handleQuantityChange = async (itemId: string, newQuantity: number) => {
    if (newQuantity < 1) {
      await handleRemoveItem(itemId);
      return;
    }
    try {
      await updateCartItemQuantity(itemId, newQuantity);
      toast.success("Quantity updated");
    } catch (error) {
      console.error("Failed to update quantity:", error);
      toast.error("Failed to update quantity");
    }
  };

  return (
    <div>CartPageClient</div>
  )
}

export default CartPageClient