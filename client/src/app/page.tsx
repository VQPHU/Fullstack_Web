import CategoriesSection from "@/components/home/CategoriesSection";
import Container from "@/components/common/container";
import Banner from "@/components/home/Banner";
import ProductsList from "@/components/home/ProductsList";


export default function Home() {
  return (
    <div>
      <Container className="min-h-screen flex py-7 gap-3">
        <CategoriesSection />
        <div className="flex-1">
          <Banner />
          <ProductsList />
          {/* BabyTravelSection */}
          {/* ComfyApparelSection */}
          {/* FeaturedServicesSection */}
        </div>
      </Container>
    </div>
  );
}
