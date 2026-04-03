import ShopPageClient from '@/components/pages/shop/ShopPageClient';
import { fetchData } from '@/lib/api'
import { Brand, Category } from '@/types/type'
import React, { Suspense } from 'react'

interface CategoriesResponse {
    categories: Category[];
}

const ShopPage = async () => {
    const brands = await fetchData<Brand[]>('/brands');
    let categories: Category[] = [];
    let error: string | null = null;

    try {
        const data = await fetchData<CategoriesResponse>('/categories');
        categories = data.categories;
    } catch (err) {
        error = err instanceof Error ? err.message : 'An unknown error occurred';
        console.log('error', error);
    }

    return (
        <Suspense fallback={<div className='p-8 text-center'>Loading shop ...</div>}>
            <ShopPageClient categories={categories} brands={brands} />
        </Suspense>
    )
}

export default ShopPage