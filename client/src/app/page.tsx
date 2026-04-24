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

  const { productTypes = [] } = await fetchData<ProductTypesResponse>(
    "/product-types?status=Active&perPage=6&sortOrder=desc"
  );

  const { components = [] } = await fetchData<{
    components: { componentType: string }[];
  }>("/page-components/public/home", {
    next: { revalidate: 0 },
  });

  const hasCategories = components.some(
    (c) => c.componentType === "categories"
  );

  const componentMap: Record<string, (key: number) => React.ReactNode> = {
    home_banner: (key) => <Banner key={key} />,
    best_deals: (key) => <ProductsList key={key} />,
    home_brands: (key) => <HomeBrand key={key} brands={brands} />,
    featured_services: (key) => <FeaturedServicesSection key={key} />,
    home_product_types: () =>
      productTypes.map((pt) => (
        <ProductTypeShowcaseSection key={pt._id} productType={pt} />
      )),
  };

  return (
    <Container className="min-h-screen flex py-7 gap-3">
      {hasCategories && <CategoriesSection />}

      <div className="flex-1 space-y-10">
        {components.map((comp, idx) => {
          if (comp.componentType === "categories") return null;

          const render = componentMap[comp.componentType];
          return render ? render(idx) : null;
        })}
      </div>
    </Container>
  );
}
