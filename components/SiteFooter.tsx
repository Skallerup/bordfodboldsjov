export function SiteFooter() {
  return (
    <footer className="mt-16 border-t-[3px] border-ink bg-ink text-cream">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 px-6 py-8 text-center sm:flex-row sm:text-left">
        <div>
          <p className="font-display text-lg font-extrabold">Bordfodbold SJOV ⚽</p>
          <p className="text-sm text-cream/70">Kontorets vildeste statistik-univers.</p>
        </div>
        <p className="max-w-sm text-xs text-cream/60">
          Data hentes løbende fra{" "}
          <a
            href="https://bordfodbold.bypanduro.dk"
            className="underline hover:text-mustard"
            target="_blank"
            rel="noreferrer"
          >
            Bordfodbold Gazette
          </a>
          . Et uofficielt, kærligt søster-site — alle rekorder tilhører spillerne.
        </p>
      </div>
    </footer>
  );
}
