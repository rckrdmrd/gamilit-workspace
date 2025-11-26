import React from 'react';

interface FooterLink {
  label: string;
  href: string;
}

interface FooterProps {
  links?: FooterLink[];
  copyrightText?: string;
}

export const Footer: React.FC<FooterProps> = ({
  links = [],
  copyrightText = `© ${new Date().getFullYear()} GAMILIT. Todos los derechos reservados.`,
}) => {
  return (
    <footer className="border-t border-gray-200 bg-gray-100 py-8">
      <div className="container mx-auto px-4">
        {/* Links */}
        {links.length > 0 && (
          <div className="mb-4 flex flex-wrap justify-center gap-6">
            {links.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="text-sm text-gray-600 transition hover:text-blue-600"
              >
                {link.label}
              </a>
            ))}
          </div>
        )}

        {/* Copyright */}
        <div className="text-center text-sm text-gray-500">{copyrightText}</div>
      </div>
    </footer>
  );
};
