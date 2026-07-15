import type { ReactNode } from 'react';

type LabCardProps = {
  eyebrow: string;
  title: string;
  description: string;
  children: ReactNode;
};

export function LabCard({ eyebrow, title, description, children }: LabCardProps) {
  return (
    <section className="rounded-3xl border border-cyan-400/20 bg-slate-950/80 p-6 shadow-2xl shadow-cyan-950/20" aria-labelledby={`${title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-title`}>
      <p className="text-sm font-semibold uppercase tracking-[0.3em] text-cyan-300">{eyebrow}</p>
      <h2 id={`${title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-title`} className="mt-2 text-2xl font-bold text-white">{title}</h2>
      <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-300">{description}</p>
      <div className="mt-6">{children}</div>
    </section>
  );
}
