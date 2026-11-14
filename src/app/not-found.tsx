import Link from "next/link";

export default function NotFound() {
  return (
    <main className="grid min-h-screen place-items-center bg-ink px-6 text-center text-white">
      <div>
        <p className="font-display text-8xl font-semibold text-accent">404</p>
        <h1 className="mt-2 text-3xl font-semibold sm:text-5xl">This page took a wrong turn</h1>
        <p className="mx-auto mt-4 max-w-md text-white/70">The page you are looking for has moved, sold out or never existed.</p>
        <div className="mt-8 flex flex-wrap justify-center gap-4"><Link href="/inventory" className="btn-accent">Browse inventory</Link><Link href="/" className="btn-outline-light">Back to home</Link></div>
      </div>
    </main>
  );
}
