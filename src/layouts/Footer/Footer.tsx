import { Activity, Mail, Phone, MapPin } from 'lucide-react';

export function Footer() {

  return (

    <footer className="bg-blue-900 text-white pt-12 pb-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-4 gap-8 mb-8">
          <div>
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
              <span className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-sm">UEP</span>
              Francisco de Paula
            </h3>
            <p className="text-gray-300 text-sm">
              Comprometidos con la educación integral y formación en valores desde 1985.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-lg mb-4">Enlaces rápidos</h4>
            <ul className="space-y-2 text-gray-300">
              <li><a href="#inicio" className="hover:text-green-400 transition">Inicio</a></li>
              <li><a href="#mision-vision" className="hover:text-green-400 transition">Misión y Visión</a></li>
              <li><a href="#valores" className="hover:text-green-400 transition">Valores</a></li>
              <li><a href="#personal" className="hover:text-green-400 transition">Personal</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-lg mb-4">Contacto</h4>
            <ul className="space-y-2 text-gray-300 text-sm">
              <li className="flex items-center gap-2"><Phone size={16} /> +58 212 555 1234</li>
              <li className="flex items-center gap-2"><Mail size={16} /> info@uepfranciscodepaula.edu.ve</li>
              <li className="flex items-center gap-2"><MapPin size={16} /> Av. Principal, Caracas, Venezuela</li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-lg mb-4">Síguenos</h4>
            <div className="flex space-x-4">
              <a href="#" className="bg-blue-800 p-2 rounded-full hover:bg-green-500 transition"><Activity size={20} /></a>
              <a href="#" className="bg-blue-800 p-2 rounded-full hover:bg-green-500 transition"><Activity size={20} /></a>
              <a href="#" className="bg-blue-800 p-2 rounded-full hover:bg-green-500 transition"><Activity size={20} /></a>
            </div>
          </div>
        </div>

        <div className="border-t border-blue-800 pt-6 text-center text-gray-400 text-sm">
          <p>&copy; {new Date().getFullYear()} UEP Francisco de Paula Salazar Acosta. Todos los derechos reservados.</p>
        </div>
      </div>
    </footer>

  );

};

