"use client";

import { useParams } from "next/navigation";
import { Studio } from "@/views/review";

export default function Page() {
  const { id } = useParams<{ id: string }>();
  return <Studio id={id} />;
}
