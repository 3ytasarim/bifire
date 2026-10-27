import type { Metadata } from "next";
import { BiwoolBand } from "@/components/home/BiwoolBand";
import { DesignInvite } from "@/components/home/DesignInvite";
import { FeaturedProducts } from "@/components/home/FeaturedProducts";
import { FeaturedProjects } from "@/components/home/FeaturedProjects";
import { HeroFallback } from "@/components/home/HeroFallback";
import { HeroSlider } from "@/components/home/HeroSlider";
import { HomeCollections } from "@/components/home/HomeCollections";
import { HomeGuide } from "@/components/home/HomeGuide";
import { HomeRegions } from "@/components/home/HomeRegions";
import { HomeShowroom } from "@/components/home/HomeShowroom";
import { SelectionFeature } from "@/components/home/SelectionFeature";
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
    FEATURES.homeFeaturedProducts ? getFeaturedProducts(8) : Promise.resolve([]),
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
      {/* Sadeleştirilmiş akış: koleksiyonlar → Bifire × Biwool → özel tasarım → showroom → hizmet bölgeleri → rehber → seçim */}
      <HomeCollections categories={categories} />
      {FEATURES.homeFeaturedProducts ? <FeaturedProducts products={featured} /> : null}
      <BiwoolBand />
      <DesignInvite image={settings.designAfterImage || settings.featureImage} imageAlt={settings.designAfterImage ? null : settings.featureImageAlt} />
      {FEATURES.projects ? <FeaturedProjects projects={projects} /> : null}
      <HomeShowroom image={settings.showroomImage} imageAlt={settings.showroomImageAlt} />
      <HomeRegions />
      <HomeGuide posts={posts} />
      <SelectionFeature image={settings.aboutImage} imageAlt={settings.aboutImageAlt} video={settings.aboutVideo} />
    </>
  );
}
