"use client";

import type { ReactNode } from "react";
import { useFormStatus } from "react-dom";

import { Button } from "@/components/ui/button";

type SubmitButtonProps = {
  children: ReactNode;
  pendingLabel?: string;
  className?: string;
  variant?: "primary" | "secondary" | "ghost";
};

export function SubmitButton({
  children,
  pendingLabel = "Saving...",
  className,
  variant,
}: SubmitButtonProps) {
  const { pending } = useFormStatus();

  return (
    <Button
      className={className}
      disabled={pending}
      type="submit"
      variant={variant}
    >
      {pending ? pendingLabel : children}
    </Button>
  );
}
