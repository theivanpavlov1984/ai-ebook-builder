"use client";

import { useParams } from "next/navigation";
import { DescribeStep } from "@/views/create-book";

export default function Page() {
  const { id } = useParams<{ id: string }>();
  return <DescribeStep id={id} />;
}
