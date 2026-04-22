import React from 'react';
import { Heart, Users, BookOpen, Shield, Lightbulb, Handshake } from 'lucide-react';

export function ValuesSection() {
  const values = [
    { icon: Heart, title: 'Respeto', description: 'Valoramos la dignidad de cada persona' },
    { icon: Users, title: 'Solidaridad', description: 'Trabajamos juntos por el bien común' },
    { icon: BookOpen, title: 'Excelencia', description: 'Buscamos la mejora continua' },
    { icon: Shield, title: 'Honestidad', description: 'Actuamos con transparencia' },
    { icon: Lightbulb, title: 'Innovación', description: 'Fomentamos la creatividad' },
    { icon: Handshake, title: 'Compromiso', description: 'Dedicación a nuestra comunidad' },
  ];

  return (
    <section id="valores" className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl md:text-4xl font-bold text-center text-blue-900 mb-4">
          Nuestros Valores
        </h2>
        <p className="text-center text-gray-600 mb-12 max-w-2xl mx-auto">
          Principios que guían nuestra labor educativa y convivencia diaria
        </p>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {values.map((value, index) => (
            <div
              key={index}
              className="group bg-gray-50 rounded-xl p-6 text-center hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
            >
              <div className="inline-flex p-3 bg-blue-100 rounded-full mb-4 group-hover:bg-green-500 transition-colors">
                <value.icon className="text-blue-900 group-hover:text-white" size={28} />
              </div>
              <h3 className="text-xl font-bold text-blue-900 mb-2">{value.title}</h3>
              <p className="text-gray-600">{value.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

