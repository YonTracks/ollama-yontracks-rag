// app/page.tsx

import Link from "next/link";

export default function HomePage() {
  return (
    <div className="flex h-screen flex-col items-center justify-center">
      Landing Page
      <Link
        href="/home"
        className=" rounded-xl bg-blue-600 px-4 text-white transition duration-300 hover:text-slate-400"
      >
        Enter
      </Link>
    </div>
  );
}
