import { create } from 'zustand';

interface QuantityStore {
    productQuantities: Record<string, number>;
    setProductQuantity: (productId: string, quantity: number) => void;
    getProductQuantity: (productId: string) => number;
    clearProductQuantity: (productId: string) => void;
}

export const useQuantityStore = create<QuantityStore>((set, get) => ({
    productQuantities: {},
    setProductQuantity: (productId: string, quantity: number) =>
        set((state) => ({
            productQuantities: {
                ...state.productQuantities,
                [productId]: quantity,
            },
        })),
    getProductQuantity: (productId: string) => {
        const state = get();
        return state.productQuantities[productId] || 1;
    },
    clearProductQuantity: (productId: string) =>
        set((state) => {
            const newQuantities = { ...state.productQuantities };
            delete newQuantities[productId];
            return { productQuantities: newQuantities };
        }),
}));
