import React from "react";

const ShopSkeleton = () => {
  // Create an array of 5 skeleton cards
  const skeletonCards = Array.from({ length: 10 }).map((_, index) => (
    <div key={index} className="animate-pulse w-full">
      <div className="h-48 bg-gray-200 rounded-lg mb-2"></div>
      <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
      <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
      <div className="h-8 w-24 bg-gray-200 rounded"></div>{" "}
      {/* Add to Cart button */}
      <div className="h-4 w-16 bg-gray-200 rounded mt-2"></div> {/* Rating */}
    </div>
  ));

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 w-full bg-babyshopWhite">
      {skeletonCards}
    </div>
  );
};

export default ShopSkeleton;
