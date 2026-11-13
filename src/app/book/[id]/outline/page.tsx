"use client";

import { useParams } from "next/navigation";
import { OutlineStep } from "@/components/steps/OutlineStep";

export default function Page() {
  const { id } = useParams<{ id: string }>();
  return <OutlineStep id={id} />;
}
