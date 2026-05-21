import Container from "@/components/common/container";
import AboutSection from "@/components/about/AboutSection";
import { fetchData } from "@/lib/api";

export const dynamic = "force-dynamic";

interface AboutData {
  story: { title: string; content: string };
  mission: { title: string; content: string };
  whyChooseUs: {
    title: string;
    items: { _id: string; title: string; description: string }[];
  };
  commitment: { title: string; content: string };
  _id: string;
}

interface AboutComponent {
  componentType: string;
  title: string;
  data: AboutData[];
}

const AboutPage = async () => {
  const result = await fetchData<{ components: AboutComponent[] }>(
    "/page-components/public/about",
    { next: { revalidate: 0 } }
  );

  const components = result?.components || [];
  const aboutComp = components.find((c) => c.componentType === "about");

  return (
    <Container className="min-h-screen py-7">
      <div className="space-y-10">
        {aboutComp && <AboutSection data={aboutComp.data} />}
      </div>
    </Container>
  );
};

export default AboutPage;