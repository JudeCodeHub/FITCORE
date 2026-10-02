export const loginStyles = {
  header: "mb-8 space-y-1.5",
  title: "font-heading text-2xl sm:text-3xl font-bold tracking-tight text-slate-950",
  subtitle: "text-sm text-slate-500 leading-relaxed",
  form: "space-y-4",
  field: "space-y-1.5",
  label: "text-xs font-semibold uppercase tracking-wider text-slate-700",
  inputWrap: "relative flex items-center",
  inputIcon:
    "pointer-events-none absolute left-3.5 h-4 w-4 text-slate-400 transition-colors",
  input:
    "h-11 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-4 text-sm text-slate-900 placeholder:text-slate-400 focus:border-emerald-600 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 shadow-xs transition-all",
  inputPassword:
    "h-11 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-11 text-sm text-slate-900 placeholder:text-slate-400 focus:border-emerald-600 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 shadow-xs transition-all",
  togglePassword:
    "absolute right-3 flex h-7 w-7 items-center justify-center rounded-lg text-slate-400 hover:text-slate-700 transition-colors cursor-pointer",
  submitBtn:
    "relative group mt-2 w-full h-11 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 text-black font-heading font-bold text-sm shadow-[0_0_20px_rgba(16,185,129,0.25)] hover:brightness-110 active:scale-[0.99] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50",
  footer: "mt-6 text-center text-sm text-slate-500",
  footerLink:
    "font-semibold text-emerald-600 hover:text-emerald-700 transition-colors hover:underline",
} as const;



