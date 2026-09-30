import { PageHeader } from "@/components/admin/ui";
import { SlideForm } from "../SlideForm";

export const metadata = { title: "Yeni slayt" };

export default function NewSlidePage() {
  return (
    <div>
      <PageHeader title="Yeni slayt" back={{ label: "Slider", href: "/admin/slider" }} />
      <SlideForm />
    </div>
  );
}
