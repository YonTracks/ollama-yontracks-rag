// components/shared/Footer.tsx

import React from "react";

type SocialLink = {
   name: string;
   url: string;
   icon: React.ReactNode;
};

type FooterProps = {
   title: string;
   message: string;
   socialLinks?: SocialLink[];
};

const Footer = ({ title, message, socialLinks = [] }: FooterProps) => {
   return (
      <footer className="fixed bottom-0 mx-auto w-full bg-gray-800 text-white">
         <div className="mx-auto max-w-full px-4 py-10">
            <div className="text-center">
               <h2 className="text-xl font-bold">{title}</h2>
               <p className="mt-2">{message}</p>
            </div>
            <div className="mt-4 flex justify-center space-x-6">
               {socialLinks.map((link, index) => (
                  <a
                     key={index}
                     href={link.url}
                     target="_blank"
                     rel="noopener noreferrer"
                     className="hover:text-gray-400"
                     aria-label={link.name}
                  >
                     {link.icon}
                  </a>
               ))}
            </div>
            <div className="mt-8 text-center text-sm">
               <p>
                  &copy; {new Date().getFullYear()} {title}. All rights
                  reserved.
               </p>
            </div>
         </div>
      </footer>
   );
};

export default Footer;
