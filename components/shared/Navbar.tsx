"use client";
import Link from "next/link";

// import { usePathname } from "next/navigation";
import ThemeButton from "./ThemeButton";

const Navbar = () => {
  return (
    <nav className="fixed mx-auto flex w-full items-center justify-between p-4">
      <Link href="/home" className="text-lg font-bold hover:text-blue-600">
        ollama test
      </Link>

      <ul className="flex space-x-4">
        {/* <li>
          <Link
            href="/rag"
            className={`${
              pathname === "/rag" ? "text-blue-500" : ""
            } hover:text-blue-500 transition duration-300`}
          >
            RAG
          </Link>
        </li> */}

        <ThemeButton />
      </ul>
    </nav>
  );
};

export default Navbar;
