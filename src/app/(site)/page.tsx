import type { Metadata } from "next";
import { ArchitectureFeature } from "@/components/home/ArchitectureFeature";
import { CategoryShowcase } from "@/components/home/CategoryShowcase";
import { FeaturedProducts } from "@/components/home/FeaturedProducts";
import { FeaturedProjects } from "@/components/home/FeaturedProjects";
import { HeroFallback } from "@/components/home/HeroFallback";
import { HeroSlider } from "@/components/home/HeroSlider";
import { HomeRegions } from "@/components/home/HomeRegions";
import { TrustBand } from "@/components/home/TrustBand";
import { ProcessSteps } from "@/components/site/ProcessSteps";
import { ShowroomBlock } from "@/components/site/ShowroomBlock";
import { Journal } from "@/components/home/Journal";
import { Manifesto } from "@/components/home/Manifesto";
import { WhyBifire } from "@/components/home/WhyBifire";
import { FinalCta } from "@/components/site/FinalCta";
import { JsonLd } from "@/components/site/JsonLd";
import { HOME } from "@/content/home";
import { getFeaturedProducts, getHeroSlides, getHomePosts, getNavCategories, getProjects } from "@/lib/queries";
import { getSiteSettings } from "@/lib/settings";
import { buildStaticPageMetadata } from "@/lib/seo/metadata";
import { STATIC_PAGES } from "@/lib/seo/static-pages";
import { graph, ids, imageNode, webPageNode } from "@/lib/seo/json-ld";
import { getImageMeta } from "@/lib/seo/image-meta";
import { FEATURES } from "@/lib/features";

export const revalidate = 300;

export function generateMetadata(): Promise<Metadata> {
  return buildStaticPageMetadata("home");
}

export default async function HomePage() {
  const [slides, categories, featured, projects, posts, settings] = await Promise.all([
    getHeroSlides(),
    getNavCategories(),
    getFeaturedProducts(8),
    FEATURES.projects ? getProjects({ featured: true, take: 5 }) : Promise.resolve([]),
    getHomePosts(3),
    getSiteSettings(),
  ]);
  const heroImage = slides[0]?.desktopImage;
  const heroMeta = heroImage ? await getImageMeta(heroImage) : null;

  return (
    <>
      <JsonLd
        data={graph(
          heroImage ? imageNode("/", { url: heroImage, alt: slides[0]?.imageAlt, meta: heroMeta }) : null,
          webPageNode({
            path: "/",
            name: STATIC_PAGES.home.defaults.title,
            description: STATIC_PAGES.home.defaults.description,
            hasPrimaryImage: Boolean(heroImage),
            mainEntityId: ids.organization(),
          }),
        )}
      />
      {slides.length ? (
        <HeroSlider
          heading={HOME.heading}
          slides={slides.map((s) => ({
            id: s.id,
            desktopImage: s.desktopImage,
            mobileImage: s.mobileImage,
            desktopVideo: s.desktopVideo,
            mobileVideo: s.mobileVideo,
            focalX: s.focalX,
            imageAlt: s.imageAlt,
            eyebrow: s.eyebrow,
            title: s.title,
            description: s.description,
            ctaText: s.ctaText,
            ctaUrl: s.ctaUrl,
            secondaryCtaText: s.secondaryCtaText,
            secondaryCtaUrl: s.secondaryCtaUrl,
            textPosition: s.textPosition,
            overlay: s.overlay,
          }))}
        />
      ) : (
        <HeroFallback />
      )}
      <TrustBand />
      <CategoryShowcase categories={categories} />
      <Manifesto image={settings.aboutImage} imageAlt={settings.aboutImageAlt} caption={settings.aboutImageCaption} video={settings.aboutVideo} />
      <FeaturedProducts products={featured} />
      <ArchitectureFeature image={settings.featureImage} imageAlt={settings.featureImageAlt} video={settings.featureVideo} />
      {FEATURES.projects ? <FeaturedProjects projects={projects} /> : null}
      <ProcessSteps eyebrow="Projenizin adımları" title="İlk fikirden uygulamaya." id="home-process" />
      <WhyBifire />
      <ShowroomBlock />
      <HomeRegions />
      <Journal posts={posts} />
      <FinalCta />
    </>
  );
}
