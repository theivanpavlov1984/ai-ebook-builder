"use client";

import { useParams } from "next/navigation";
import { OutlineStep } from "@/views/create-book";

export default function Page() {
  const { id } = useParams<{ id: string }>();
  return <OutlineStep id={id} />;
}
