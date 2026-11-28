"use client";

import EmberField from "@/components/EmberField";
import { FingerprintIcon } from "@/components/icons";

interface LetterViewProps {
  content: string;
}

interface LetterBlock {
  kind: "paragraph" | "quote";
  text: string;
}

const LETTER_DATE = "29 DE NOVIEMBRE";

// Un párrafo que empieza con "> " se muestra como cita destacada.
function parseBlocks(content: string): LetterBlock[] {
  return content
    .split(/\n\s*\n/)
    .map((block) => block.trim())
    .filter((block) => block.length > 0)
    .map((block): LetterBlock => {
      if (block.startsWith(">")) {
        return { kind: "quote", text: block.replace(/^>\s*/, "").trim() };
      }
      return { kind: "paragraph", text: block };
    });
}

export default function LetterView({ content }: LetterViewProps) {
  const blocks = parseBlocks(content);

  return (
    <>
      {/* Fondo atmosférico */}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 z-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(242,100,25,0.08),rgba(13,14,18,0))] opacity-80"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 z-0 bg-[radial-gradient(circle_at_50%_50%,rgba(27,154,170,0.04),rgba(13,14,18,0)_70%)]"
      />
      <EmberField />

      <div className="relative z-10 flex min-h-screen w-full flex-col items-center justify-center p-margin md:p-margin-desktop">
        <div className="relative flex w-full flex-col items-center justify-center px-2 py-6 sm:px-4 md:py-12">
          <article className="relative w-full max-w-[760px] overflow-hidden rounded-lg bg-surface-container-low/95 shadow-2xl backdrop-blur-md transition-all duration-500 ease-out animate-fade-in">
            {/* Contorno luminoso */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 -z-10 rounded-lg bg-gradient-to-b from-outline/40 via-outline-variant to-secondary-container/40 p-[1px]"
            />
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -top-24 left-1/2 h-32 w-96 -translate-x-1/2 rounded-full bg-outline/10 blur-3xl"
            />
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -bottom-24 right-10 h-32 w-80 rounded-full bg-secondary-container/15 blur-3xl"
            />

            <div className="relative z-10 flex flex-col gap-8 p-6 sm:p-10 md:p-14">
              {/* Cabecera */}
              <header className="flex flex-col justify-between gap-4 border-b border-outline-variant/30 pb-6 sm:flex-row sm:items-center">
                <div className="inline-flex w-fit items-center gap-2.5 rounded-full border border-outline-variant bg-surface-container-lowest/80 px-3 py-1.5 shadow-sm">
                  <span className="relative flex h-2 w-2">
                    <span className="absolute inline-flex h-full w-full rounded-full bg-tertiary opacity-75 motion-safe:animate-ping" />
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-outline" />
                  </span>
                </div>
                <div className="flex items-center gap-3 text-label-md tracking-wider text-on-surface-variant">
                  <FingerprintIcon className="size-4 text-outline" />
                  <span className="text-on-surface/70">{LETTER_DATE}</span>
                </div>
              </header>

              {/* Saludo */}
              <div className="flex flex-col gap-1 pt-2">
                <span className="text-label-sm tracking-widest text-outline/80 uppercase">
                  Destinatario designado
                </span>
                <h1 className="text-headline-lg tracking-tight text-on-background">
                  Para ti,
                </h1>
              </div>

              {/* Cuerpo dinámico (viene de la prop content) */}
              <div className="flex flex-col gap-6 text-left text-body-lg leading-relaxed text-[#C4CAD4] selection:bg-primary-container selection:text-on-primary-container">
                {blocks.map((block, index) =>
                  block.kind === "quote" ? (
                    <blockquote
                      key={index}
                      className="relative my-3 rounded-r border-l-2 border-primary-container bg-surface-container-high/40 py-2 pl-5 text-on-surface"
                    >
                      <p className="text-title-md tracking-wide whitespace-pre-line text-on-background/90 italic">
                        {block.text}
                      </p>
                      <div className="mt-2 flex items-center gap-2">
                        <span className="h-0.5 w-6 bg-outline" />
                        <span className="text-label-sm tracking-widest text-outline uppercase">
                          Registro de resonancia
                        </span>
                      </div>
                    </blockquote>
                  ) : (
                    <p key={index} className="whitespace-pre-line">
                      {block.text}
                    </p>
                  ),
                )}
              </div>

              {/* Cierre y barra de acciones */}
              <div className="flex flex-col justify-between gap-6 border-t border-outline-variant/30 pt-6 sm:flex-row sm:items-end">
                <div className="flex items-center gap-2 self-start sm:self-end">
                  {/* PHASE_3_AUDIO_SLOT */}
                </div>
              </div>

              <footer className="flex flex-col items-center justify-center gap-2 pt-4 text-center select-none">
                <div className="flex items-center justify-center gap-3">
                  <span className="h-[1px] w-12 bg-gradient-to-r from-transparent to-outline/30" />
                  <p className="text-label-lg font-medium tracking-[0.35em] text-on-surface-variant">
                    SIC <span className="text-tertiary">✦</span> PARVIS <span className="text-tertiary">✦</span> MAGNA
                  </p>
                  <span className="h-[1px] w-12 bg-gradient-to-l from-transparent to-outline/30" />
                </div>
              </footer>
            </div>
          </article>
        </div>
      </div>
    </>
  );
}
