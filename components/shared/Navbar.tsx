"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import ThemeButton from "./ThemeButton";

const Navbar = () => {
  const pathname = usePathname();

  return (
    <nav className="w-full fixed mx-auto flex justify-between items-center p-4">
      <Link href="/home" className="font-bold text-lg hover:text-blue-600">
        ollama test
      </Link>

      <ul className="flex space-x-4">


       <li>
          <Link
            href="/rag"
            className={`${
              pathname === "/rag" ? "text-blue-500" : ""
            } hover:text-blue-500 transition duration-300`}
          >
            RAG
          </Link>
        </li> 

        <ThemeButton />
      </ul>
    </nav>
  );
};

export default Navbar;
