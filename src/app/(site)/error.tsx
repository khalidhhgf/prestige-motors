"use client";
import Link from "next/link";

export default function Error({ reset }: { error: Error; reset: () => void }) {
  return (
    <main className="grid min-h-[70vh] place-items-center px-6 text-center">
      <div>
        <h1 className="text-4xl font-semibold">Something went wrong</h1>
        <p className="mx-auto mt-3 max-w-md text-charcoal-500">We hit an unexpected problem. Please try again, or contact us if it keeps happening.</p>
        <div className="mt-6 flex justify-center gap-3"><button onClick={reset} className="btn-primary">Try again</button><Link href="/" className="btn-outline">Home</Link></div>
      </div>
    </main>
  );
}
