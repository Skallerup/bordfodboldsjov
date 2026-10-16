export function SpeechBubble({
  children,
  tone = "paper",
}: {
  children: React.ReactNode;
  tone?: "paper" | "mustard" | "grape";
}) {
  const bg =
    tone === "mustard" ? "bg-mustard" : tone === "grape" ? "bg-grape text-white" : "bg-paper";
  return (
    <div className="relative">
      <div className={`${bg} rounded-2xl border-[3px] border-ink px-3 py-2 text-sm font-bold shadow-pop-sm`}>
        {children}
      </div>
      <div className="absolute -bottom-2 left-6 h-4 w-4 rotate-45 border-b-[3px] border-r-[3px] border-ink bg-inherit" />
    </div>
  );
}
