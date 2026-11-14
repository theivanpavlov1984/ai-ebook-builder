"use client";

import { useParams } from "next/navigation";
import { TitleStep } from "@/views/create-book";

export default function Page() {
  const { id } = useParams<{ id: string }>();
  return <TitleStep id={id} />;
}
