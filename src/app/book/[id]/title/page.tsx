"use client";

import { useParams } from "next/navigation";
import { TitleStep } from "@/components/steps/TitleStep";

export default function Page() {
  const { id } = useParams<{ id: string }>();
  return <TitleStep id={id} />;
}
