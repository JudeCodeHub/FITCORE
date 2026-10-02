export const loginStyles = {
  header: "mb-8 space-y-1.5",
  title: "font-heading text-2xl sm:text-3xl font-bold tracking-tight text-white",
  subtitle: "text-sm text-zinc-400 leading-relaxed",
  form: "space-y-4",
  field: "space-y-1.5",
  label: "text-xs font-semibold uppercase tracking-wider text-zinc-300",
  inputWrap: "relative flex items-center",
  inputIcon:
    "pointer-events-none absolute left-3.5 h-4 w-4 text-zinc-500 transition-colors",
  input:
    "h-11 w-full rounded-xl border border-white/10 bg-zinc-900/60 pl-10 pr-4 text-sm text-white placeholder:text-zinc-600 focus:border-emerald-500/60 focus:bg-zinc-900/90 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all",
  inputPassword:
    "h-11 w-full rounded-xl border border-white/10 bg-zinc-900/60 pl-10 pr-11 text-sm text-white placeholder:text-zinc-600 focus:border-emerald-500/60 focus:bg-zinc-900/90 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all",
  togglePassword:
    "absolute right-3 flex h-7 w-7 items-center justify-center rounded-lg text-zinc-500 hover:text-zinc-200 transition-colors cursor-pointer",
  submitBtn:
    "relative group mt-2 w-full h-11 rounded-xl bg-gradient-to-r from-emerald-400 to-teal-400 text-black font-heading font-bold text-sm shadow-md shadow-emerald-500/20 hover:brightness-105 active:scale-[0.99] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50",
  footer: "mt-6 text-center text-sm text-zinc-400",
  footerLink:
    "font-semibold text-emerald-400 hover:text-emerald-300 transition-colors hover:underline",
} as const;


