import CategoriesSection from "@/components/home/CategoriesSection";
import Container from "@/components/common/container";
import Banner from "@/components/home/Banner";
import ProductsList from "@/components/home/ProductsList";
import HomeBrand from "@/components/home/HomeBrand";
import FeaturedServicesSection from "@/components/home/FeaturedServicesSection";
import ProductTypeShowcaseSection from "@/components/home/ProductTypeShowcaseSection";
import { Brand, ProductType } from "@/types/type";
import { fetchData } from "@/lib/api";

interface ProductTypesResponse {
  productTypes: ProductType[];
}


export default async function Home() {
  const brands = await fetchData<Brand[]>("/brands");
  const productTypesData = await fetchData<ProductTypesResponse>(
    "/product-types?status=Active&perPage=6&sortOrder=desc"
  );
  const featuredProductTypes = productTypesData.productTypes || [];
  console.log("productTypesData:", productTypesData);

  return (
    <div>
      <Container className="min-h-screen flex py-7 gap-3">
        <CategoriesSection />
        <div className="flex-1">
          <Banner />
          <ProductsList />
          <HomeBrand brands={brands} />
          {featuredProductTypes.map((productType) => (
            <ProductTypeShowcaseSection
              key={productType._id}
              productType={productType}
            />
          ))}
          <FeaturedServicesSection />
        </div>
      </Container>
    </div>
  );
}
