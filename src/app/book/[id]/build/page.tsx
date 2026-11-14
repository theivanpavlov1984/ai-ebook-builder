"use client";

import { useParams } from "next/navigation";
import { BuildStep } from "@/views/create-book";

export default function Page() {
  const { id } = useParams<{ id: string }>();
  return <BuildStep id={id} />;
}
