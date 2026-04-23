import CategoriesSection from "@/components/home/CategoriesSection";
import Container from "@/components/common/container";
import Banner from "@/components/home/Banner";
import ProductsList from "@/components/home/ProductsList";
import HomeBrand from "@/components/home/HomeBrand";
import FeaturedServicesSection from "@/components/home/FeaturedServicesSection";
import ProductTypeShowcaseSection from "@/components/home/ProductTypeShowcaseSection";
import { Brand, ProductType } from "@/types/type";
import { fetchData } from "@/lib/api";
import ComfyApparelSection from "@/components/home/ComfyApparelSection";
import BabyTravelSection from "@/components/home/BabyTravelSection";

interface ProductTypesResponse {
  productTypes: ProductType[];
}

export const dynamic = 'force-dynamic';

export default async function Home() {
  const brands = await fetchData<Brand[]>("/brands");
  const productTypesData = await fetchData<ProductTypesResponse>(
    "/product-types?status=Active&perPage=6&sortOrder=desc"
  );
  const featuredProductTypes = productTypesData.productTypes || [];

  const homepageData = await fetchData<{ components: { name: string }[] }>(
    "/components/homepage",
    { next: { revalidate: 0 } }
  );

  const activeComponents = homepageData?.components?.map((c) => c.name) || [];

  console.log("Active Components logic:", activeComponents);

  return (
    <div>
      <Container className="min-h-screen flex py-7 gap-3">
        {activeComponents.includes("categories") && <CategoriesSection />}
        <div className="flex-1">
          {activeComponents.includes("home_banner") && <Banner />}
          {activeComponents.includes("best_deals") && <ProductsList />}
          {activeComponents.includes("home_brands") && <HomeBrand brands={brands} />}
          {activeComponents.includes("home_product_types") &&
            featuredProductTypes.map((productType) => (
              <ProductTypeShowcaseSection
                key={productType._id}
                productType={productType}
              />
            ))}
          <FeaturedServicesSection />
          {/* <ComfyApparelSection/>
          <BabyTravelSection/> */}
        </div>
      </Container>
    </div>
  );
}
