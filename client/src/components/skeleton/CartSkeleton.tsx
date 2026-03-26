import React from 'react'
import { Skeleton } from '../ui/skeleton'
import Container from "@/components/common/container";

const CartSkeleton = () => {
  return (
      <Container className="py-8">
           {/* Breadcrumb Skeleton */}
           <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 mb-8">
             <div className="flex items-center justify-between">
               <div className="flex items-center gap-2">
                 <Skeleton className="h-4 w-4" />
                 <span>/</span>
                 <Skeleton className="h-4 w-8" />
               </div>
               <div className="flex items-center gap-2">
                 <Skeleton className="h-3 w-8" />
                 <Skeleton className="h-8 w-8 rounded-full" />
                 <Skeleton className="h-8 w-8 rounded-full" />
                 <Skeleton className="h-8 w-8 rounded-full" />
                 <Skeleton className="h-8 w-8 rounded-full" />
               </div>
             </div>
           </div>
   
           {/* Title Skeleton */}
           <div className="mb-8">
             <Skeleton className="h-10 w-24 mb-2" />
           </div>
   
           <div className="grid grid-cols-1 xl:grid-cols-4 gap-6 lg:gap-8">
             {/* Cart Items Section Skeleton */}
             <div className="xl:col-span-3">
               <div className="bg-babyshopWhite rounded-2xl border border-gray-100 shadow-sm p-6">
                 {/* Table Header Skeleton - Desktop */}
                 <div className="hidden lg:grid grid-cols-12 gap-4 py-4 border-b border-gray-200 mb-6">
                   <div className="col-span-6">
                     <Skeleton className="h-4 w-16" />
                   </div>
                   <div className="col-span-2 text-center">
                     <Skeleton className="h-4 w-12 mx-auto" />
                   </div>
                   <div className="col-span-2 text-center">
                     <Skeleton className="h-4 w-16 mx-auto" />
                   </div>
                   <div className="col-span-2 text-center">
                     <Skeleton className="h-4 w-16 mx-auto" />
                   </div>
                 </div>
   
                 {/* Cart Items Skeleton */}
                 <div className="space-y-4">
                   {[1, 2, 3].map((index) => (
                     <div
                       key={index}
                       className="border border-gray-100 rounded-lg p-4 lg:p-0 lg:border-0 lg:rounded-none"
                     >
                       {/* Mobile Layout Skeleton */}
                       <div className="block lg:hidden">
                         <div className="flex items-start gap-4">
                           <Skeleton className="w-20 h-20 rounded-lg" />
                           <div className="flex-1 space-y-3">
                             <Skeleton className="h-4 w-full" />
                             <div className="flex justify-between items-center">
                               <div className="space-y-1">
                                 <Skeleton className="h-3 w-8" />
                                 <Skeleton className="h-4 w-12" />
                               </div>
                               <Skeleton className="h-8 w-24" />
                             </div>
                             <div className="flex justify-between items-center">
                               <div className="space-y-1">
                                 <Skeleton className="h-3 w-12" />
                                 <Skeleton className="h-4 w-16" />
                               </div>
                               <Skeleton className="h-6 w-16" />
                             </div>
                           </div>
                         </div>
                       </div>
   
                       {/* Desktop Layout Skeleton */}
                       <div className="hidden lg:grid lg:grid-cols-12 gap-4 items-center py-6 border-b border-gray-100">
                         <div className="lg:col-span-6 flex items-center gap-4">
                           <Skeleton className="w-20 h-20 rounded-lg" />
                           <div className="flex-1 space-y-2">
                             <Skeleton className="h-5 w-3/4" />
                             <Skeleton className="h-4 w-16" />
                           </div>
                         </div>
                         <div className="lg:col-span-2 text-center">
                           <Skeleton className="h-5 w-16 mx-auto" />
                         </div>
                         <div className="lg:col-span-2 flex justify-center">
                           <Skeleton className="h-10 w-32" />
                         </div>
                         <div className="lg:col-span-2 text-center">
                           <Skeleton className="h-5 w-20 mx-auto" />
                         </div>
                       </div>
                     </div>
                   ))}
                 </div>
   
                 {/* Cart Actions Skeleton */}
                 <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3 mt-8 pt-6 border-t border-gray-200">
                   <Skeleton className="h-12 w-full sm:w-48" />
                   <Skeleton className="h-12 w-full sm:w-32" />
                 </div>
               </div>
             </div>
   
             {/* Cart Totals Skeleton */}
             <div className="xl:col-span-1">
               <div className="bg-babyshopWhite rounded-2xl p-6 sticky top-4 border border-gray-100 shadow-sm">
                 <Skeleton className="h-6 w-24 mb-6" />
   
                 <div className="space-y-4">
                   {[1, 2, 3].map((index) => (
                     <div
                       key={index}
                       className="flex justify-between items-center py-2"
                     >
                       <Skeleton className="h-4 w-16" />
                       <Skeleton className="h-4 w-12" />
                     </div>
                   ))}
   
                   <div className="my-4">
                     <Skeleton className="h-px w-full" />
                   </div>
   
                   <div className="flex justify-between items-center py-2">
                     <Skeleton className="h-5 w-10" />
                     <Skeleton className="h-6 w-16" />
                   </div>
                 </div>
   
                 <Skeleton className="h-12 w-full mt-6" />
   
                 <div className="mt-4 text-center">
                   <Skeleton className="h-3 w-32 mx-auto" />
                 </div>
               </div>
             </div>
           </div>
         </Container>
  )
}

export default CartSkeleton