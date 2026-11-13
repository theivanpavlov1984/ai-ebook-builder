"use client";

import { useParams } from "next/navigation";
import { FinalStep } from "@/components/steps/FinalStep";

export default function Page() {
  const { id } = useParams<{ id: string }>();
  return <FinalStep id={id} />;
}
