import { notFound } from "next/navigation";
import { ConfirmAction } from "@/components/admin/ConfirmAction";
import { Flash, PageHeader } from "@/components/admin/ui";
import { prisma } from "@/lib/db";
import { deleteSlide } from "../actions";
import { SlideForm } from "../SlideForm";

export const metadata = { title: "Slayt düzenle" };

export default async function EditSlidePage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ kaydedildi?: string }> }) {
  const [{ id }, { kaydedildi }] = await Promise.all([params, searchParams]);
  const slide = await prisma.heroSlide.findUnique({ where: { id } });
  if (!slide) notFound();
  return (
    <div>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <PageHeader title={slide.title} back={{ label: "Slider", href: "/admin/slider" }} />
        <ConfirmAction action={deleteSlide.bind(null, slide.id)} redirectTo="/admin/slider" title="Slayt silinsin mi?" description="Slayt silinir. Görseller medya kütüphanesinde kalır." />
      </div>
      <Flash message={kaydedildi ? "Slayt kaydedildi." : null} />
      <SlideForm key={slide.updatedAt.toISOString()} slide={slide} />
    </div>
  );
}
