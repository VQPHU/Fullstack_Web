export const getDiscountedPrice = (price: number, discountPercentage?: number) => {
    const discount = discountPercentage ?? 0;
    if (!discount) return price;
    return price * (1 - discount / 100);
};
