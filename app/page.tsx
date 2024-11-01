// app/page.tsx

import Link from "next/link";

export default function HomePage() {
  return (
    <div className="flex flex-col items-center justify-center h-screen">
      Landing Page
      <Link
        href="/home"
        className=" hover:text-slate-400 text-white rounded-xl px-4 bg-blue-600 transition duration-300"
      >
        Enter
      </Link>
    </div>
  );
}
