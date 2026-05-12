import Image from "next/image";
import { cn } from "@/lib/utils/cn";

export function Avatar({ name, email, src, className }: { name?: string; email?: string; src?: string; className?: string }) {
  const initials = (name || email || "?")
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const colorClass = "bg-neutral-100 text-neutral-600";

  return (
    <div className={cn("flex h-10 w-10 shrink-0 items-center justify-center rounded-full overflow-hidden font-bold text-[13px] border border-neutral-200", colorClass, className)}>
      {src ? (
        <Image src={src} alt={name || "Avatar"} width={40} height={40} className="h-full w-full object-cover" unoptimized />
      ) : (
        initials
      )}
    </div>
  );
}
