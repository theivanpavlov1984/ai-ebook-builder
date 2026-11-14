"use client";

import { useParams } from "next/navigation";
import { FinalStep } from "@/views/create-book";

export default function Page() {
  const { id } = useParams<{ id: string }>();
  return <FinalStep id={id} />;
}
