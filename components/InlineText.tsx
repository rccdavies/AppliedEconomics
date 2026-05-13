export function InlineText({ text }: { text: string }) {
  const parts = text.split(/\*\*/);
  return (
    <>
      {parts.map((part, index) =>
        index % 2 === 1 ? (
          <strong key={index} className="font-semibold text-zinc-900">
            {part}
          </strong>
        ) : (
          <span key={index}>{part}</span>
        ),
      )}
    </>
  );
}

export function BlockText({ text }: { text: string }) {
  const paragraphs = text.split(/\n\n+/);
  return (
    <div className="space-y-2 text-sm leading-relaxed text-zinc-800">
      {paragraphs.map((para, i) => (
        <p key={i} className="whitespace-pre-line">
          <InlineText text={para.trim()} />
        </p>
      ))}
    </div>
  );
}
