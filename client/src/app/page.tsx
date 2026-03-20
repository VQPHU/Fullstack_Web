import CategoriesSection from "@/components/home/CategoriesSection";
import Container from "@/components/common/container";
import Banner from "@/components/home/Banner";
import ProductsList from "@/components/home/ProductsList";
import HomeBrand from "@/components/home/HomeBrand";
import { fetchData } from "@/lib/api";
import { Brand } from "@/types/type";
import BabyTravelSection from "@/components/home/BabyTravelSection";
import ComfyApparelSection from "@/components/home/ComfyApparelSection";
import FeaturedServicesSection from "@/components/home/FeaturedServicesSection";


export default async function Home() {
  const brands = await fetchData<Brand[]>("/brands");
  return (
    <div>
      <Container className="min-h-screen flex py-7 gap-3">
        <CategoriesSection />
        <div className="flex-1">
          <Banner />
          <ProductsList />
          <HomeBrand brands={brands} />
          <BabyTravelSection />
          <ComfyApparelSection />
          <FeaturedServicesSection />
        </div>
      </Container>
    </div>
  );
}
