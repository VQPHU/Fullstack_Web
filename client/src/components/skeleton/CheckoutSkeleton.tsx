import React from 'react'
import { Skeleton } from '../ui/skeleton'
import Container from '@/components/common/container'

const CheckoutSkeleton = () => {
    return <Container className="py-8">
        {/* Breadcrumb Skeleton */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 mb-8">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Skeleton className="h-4 w-4" />
                    <span>/</span>
                    <Skeleton className="h-4 w-8" />
                    <span>/</span>
                    <Skeleton className="h-4 w-16" />
                </div>
            </div>
        </div>

        {/* Title Skeleton */}
        <div className="mb-8">
            <Skeleton className="h-10 w-32 mb-2" />
        </div>

        {/* Content Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                    <Skeleton className="h-6 w-32 mb-4" />
                    <div className="space-y-4">
                        {[1, 2, 3].map((index) => (
                            <div key={index} className="flex items-center gap-4">
                                <Skeleton className="w-16 h-16 rounded-lg" />
                                <div className="flex-1 space-y-2">
                                    <Skeleton className="h-4 w-3/4" />
                                    <Skeleton className="h-3 w-1/2" />
                                </div>
                                <Skeleton className="h-4 w-16" />
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div className="lg:col-span-1">
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                    <Skeleton className="h-6 w-24 mb-6" />
                    <div className="space-y-4">
                        {[1, 2, 3, 4].map((index) => (
                            <div key={index} className="flex justify-between">
                                <Skeleton className="h-4 w-16" />
                                <Skeleton className="h-4 w-12" />
                            </div>
                        ))}
                    </div>
                    <Skeleton className="h-12 w-full mt-6" />
                </div>
            </div>
        </div>
    </Container>
}

export default CheckoutSkeleton