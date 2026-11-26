"use client";

import { useState } from "react";
import AccessForm from "@/components/AccessForm";
import LetterView from "@/components/LetterView";

export default function Home() {
  const [letter, setLetter] = useState<string | null>(null);

  return (
    <main className="flex flex-1 flex-col items-center justify-center p-6">
      {letter === null ? (
        <AccessForm onUnlock={setLetter} />
      ) : (
        <LetterView content={letter} />
      )}
    </main>
  );
}
