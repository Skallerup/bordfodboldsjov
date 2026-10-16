export function FormDots({ form }: { form: ("W" | "L")[] }) {
  if (form.length === 0) return <span className="text-xs text-ink-soft">ingen kampe</span>;
  return (
    <div className="flex items-center gap-1" title="Seneste kampe (ældst → nyest)">
      {form.map((r, i) => (
        <span
          key={i}
          className={`grid h-5 w-5 place-items-center rounded-md border-2 border-ink text-[10px] font-extrabold ${
            r === "W" ? "bg-lime text-ink" : "bg-tomato text-white"
          }`}
        >
          {r === "W" ? "S" : "T"}
        </span>
      ))}
    </div>
  );
}
