import ShopPageClient from '@/components/pages/shop/ShopPageClient';
import { fetchData } from '@/lib/api'
import { Brand, Category, ProductType } from '@/types/type'
import React, { Suspense } from 'react'

interface CategoriesResponse {
    categories: Category[];
}

interface ProductTypesResponse {
    productTypes: ProductType[];
}

const ShopPage = async () => {
    const brands = await fetchData<Brand[]>('/brands');
    const productTypesData = await fetchData<ProductTypesResponse>('/product-types?status=Active&perPage=100&sortOrder=asc');
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
            <ShopPageClient categories={categories} brands={brands} productTypes={productTypesData.productTypes || []} />
        </Suspense>
    )
}

export default ShopPage
