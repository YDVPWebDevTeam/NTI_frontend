export function Footer() {
  return (
    <footer className="border-t border-black/[0.07] px-4 py-5 sm:px-6 lg:px-16">
      <div className="mx-auto flex w-full max-w-[1200px] flex-col items-center gap-3 sm:gap-4 md:flex-row md:items-center md:justify-between">
        <span className="text-center text-[10px] tracking-[0.06em] text-neutral-400 md:text-left">
          © 2024 INSTITUTIONAL INCUBATOR. PRECISION ENGINE FRAMEWORK.
        </span>
        <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 md:justify-end md:gap-6">
          {['PRIVACY POLICY', 'TERMS OF SERVICE', 'SECURITY ARCHITECTURE'].map((link) => (
            <button
              type="button"
              key={link}
              className="text-[10px] font-normal tracking-[0.08em] text-neutral-400 transition-colors hover:text-neutral-700"
            >
              {link}
            </button>
          ))}
        </div>
      </div>
    </footer>
  );
}
