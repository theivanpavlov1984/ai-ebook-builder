"use client";

import { useParams } from "next/navigation";
import { BuildStep } from "@/components/steps/BuildStep";

export default function Page() {
  const { id } = useParams<{ id: string }>();
  return <BuildStep id={id} />;
}
