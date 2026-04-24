import Container from "@/components/common/container";
import Banner from "@/components/home/Banner";
import ProductsList from "@/components/home/ProductsList";
import FeaturedServicesSection from "@/components/home/FeaturedServicesSection";
import { fetchData } from "@/lib/api";

export const dynamic = "force-dynamic";

const componentMap: Record<string, React.FC> = {
  home_banner: Banner,
  best_deals: ProductsList,
  featured_services: FeaturedServicesSection,
};

const AboutPage = async () => {
  const data = await fetchData<{ components: { componentType: string }[] }>(
    "/page-components/public/about"
  );

  const components = data?.components || [];

  return (
    <Container className="py-7 space-y-10">
      {components.map((c, idx) => {
        const Comp = componentMap[c.componentType];
        return Comp ? <Comp key={idx} /> : null;
      })}
    </Container>
  );
};

export default AboutPage;