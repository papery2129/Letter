"use client";

interface LetterViewProps {
  content: string;
}

export default function LetterView({ content }: LetterViewProps) {
  const paragraphs = content
    .split(/\n\s*\n/)
    .map((paragraph) => paragraph.trim())
    .filter((paragraph) => paragraph.length > 0);

  return (
    <article className="flex w-full max-w-2xl flex-col gap-4">
      {/* PHASE_3_AUDIO_SLOT */}
      <div />
      {paragraphs.map((paragraph, index) => (
        <p key={index} className="whitespace-pre-line">
          {paragraph}
        </p>
      ))}
    </article>
  );
}
