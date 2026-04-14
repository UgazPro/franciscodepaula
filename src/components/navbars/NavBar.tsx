import { useState } from 'react';
import { Menu, X, LogIn } from 'lucide-react';

export default function NavBar() {
  const [isOpen, setIsOpen] = useState(false);

  const navLinks = [
    { name: 'Inicio', href: '#inicio' },
    { name: 'Misión y Visión', href: '#mision-vision' },
    { name: 'Valores', href: '#valores' },
    { name: 'Personal', href: '#personal' },
    { name: 'Calendario', href: '#calendario' },
    { name: 'Cuadro de Honor', href: '#honor' },
    { name: 'Actividades', href: '#actividades' },
  ];

  return (
    <nav className="bg-blue-900 shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo y título */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-xl">UEP</span>
            </div>
            <span className="text-white font-bold text-lg hidden sm:block">
              Francisco de Paula Salazar Acosta
            </span>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex space-x-6">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                className="text-white hover:text-green-400 transition-colors duration-200 font-medium"
              >
                {link.name}
              </a>
            ))}
          </div>

          {/* Botón de inicio de sesión */}
          <div className="hidden md:block">
            <button className="flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg transition-all duration-200 font-semibold shadow-md">
              <LogIn size={18} />
              Iniciar Sesión
            </button>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-white focus:outline-none"
            >
              {isOpen ? <X size={28} /> : <Menu size={28} />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="md:hidden pb-4 space-y-2">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                onClick={() => setIsOpen(false)}
                className="block text-white hover:text-green-400 py-2 transition-colors"
              >
                {link.name}
              </a>
            ))}
            <button className="w-full flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg transition-all font-semibold mt-3">
              <LogIn size={18} />
              Iniciar Sesión
            </button>
          </div>
        )}
      </div>
    </nav>
  );
};
