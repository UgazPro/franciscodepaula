import { Mail, Phone, MapPin } from 'lucide-react';
import { useEffect, useState } from 'react';

export function Footer() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisible(true); },
      { threshold: 0.1 }
    );
    const el = document.getElementById("footer-content");
    if (el) observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <footer className="relative bg-linear-to-br from-blue-900 via-blue-950 to-blue-900 pt-8 pb-4 overflow-hidden">
      <div className="absolute top-0 left-0 right-0 h-0.5 bg-linear-to-r from-transparent via-green-400 to-transparent" />

      <div
        id="footer-content"
        className={`px-4 sm:px-6 lg:px-8 transition-all duration-700 ${
          visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
        }`}
      >
        <div className="flex md:justify-between md:items-center gap-6 mb-6">
          <div>
            <h3 className="text-lg font-bold mb-2 flex items-center gap-2">
              <span className="w-7 h-7 bg-linear-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center text-[10px] text-white font-bold shadow-md">UEP</span>
              <span className="text-white">Francisco de Paula</span>
            </h3>
            <p className="text-gray-400 text-xs leading-relaxed">
              Comprometidos con la educación integral y formación en valores desde 1985.
            </p>
          </div>

          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-3">Contacto</h4>
            <ul className="space-y-1.5 text-gray-400 text-xs">
              <li className="flex items-center gap-1.5">
                <Phone size={12} className="text-green-400 shrink-0" />
                +58 412 123 4567
              </li>
              <li className="flex items-center gap-1.5">
                <Mail size={12} className="text-green-400 shrink-0" />
                info@uepfranciscodepaula.edu.ve
              </li>
              <li className="flex items-center gap-1.5">
                <MapPin size={12} className="text-green-400 shrink-0" />
                Calle 79L, Zulia - Maracaibo, Venezuela
              </li>
            </ul>
            {/* <div className="flex items-center gap-2 mt-3">
              {[Facebook, Instagram, Twitter].map((Icon, i) => (
                <a
                  key={i}
                  href="#"
                  className="p-1.5 rounded-lg bg-white/5 text-gray-400 hover:bg-green-500 hover:text-white hover:scale-110 transition-all duration-300"
                >
                  <Icon size={14} />
                </a>
              ))}
            </div> */}
          </div>
        </div>

        <div className="border-t border-white/10 pt-4 text-center text-gray-500 text-[11px]">
          <p>&copy; {new Date().getFullYear()} UEP Francisco de Paula Salazar Acosta. Todos los derechos reservados.</p>
        </div>
      </div>
    </footer>
  );
}
