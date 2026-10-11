import type { ReactNode } from "react";

export function AdminPageBanner({
  eyebrow,
  title,
  description,
  action,
}: {
  eyebrow: string;
  title: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <section className="relative mb-7 overflow-hidden rounded-[28px] bg-[#17231d] px-6 py-7 text-white sm:px-9 sm:py-9">
      <div aria-hidden="true" className="pointer-events-none absolute -right-16 -top-24 size-72 rounded-full border-[48px] border-[#c9f27a]/10" />
      <div aria-hidden="true" className="pointer-events-none absolute -bottom-24 right-36 size-56 rounded-full bg-[#c9f27a]/5 blur-3xl" />
      <div className="relative flex flex-wrap items-end justify-between gap-5">
        <div className="max-w-2xl">
          <p className="mb-3 text-[11px] font-bold uppercase tracking-[0.2em] text-[#c9f27a]">{eyebrow}</p>
          <h1 className="font-heading text-3xl font-bold tracking-tight sm:text-4xl">{title}</h1>
          <p className="mt-3 max-w-xl text-sm leading-6 text-white/65">{description}</p>
        </div>
        {action}
      </div>
    </section>
  );
}
