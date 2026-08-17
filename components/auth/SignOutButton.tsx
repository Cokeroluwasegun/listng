"use client";

import { useRouter } from "next/navigation";
import { signOut } from "@/lib/auth-client";
import { LogOut } from "lucide-react";
import { cn } from "@/lib/utils";

export function SignOutButton({
  className,
  label = "Sign Out",
  showIcon = true,
}: {
  className?: string;
  label?: string;
  showIcon?: boolean;
}) {
  const router = useRouter();

  async function handleSignOut() {
    await signOut();
    router.push("/");
    router.refresh();
  }

  return (
    <button
      type="button"
      onClick={handleSignOut}
      className={cn("flex items-center transition-colors", className)}
    >
      {showIcon && <LogOut className={cn("h-4 w-4", label && "mr-2")} />}
      {label}
    </button>
  );
}