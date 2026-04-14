import React from 'react';
import { Award, Star } from 'lucide-react';

const HonorRollSection = () => {
  const students = [
    { name: 'Sofía Valentina Rojas', grade: '5to Año', honor: 'Excelencia Académica' },
    { name: 'Mateo Alejandro Gil', grade: '4to Año', honor: 'Mejor Rendimiento' },
    { name: 'Valentina Isamar Castro', grade: '3er Año', honor: 'Constancia y Esfuerzo' },
    { name: 'Samuel David Perdomo', grade: '2do Año', honor: 'Liderazgo Estudiantil' },
  ];

  return (
    <section id="honor" className="py-16 bg-gradient-to-r from-blue-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <Award className="inline-block text-yellow-500 mb-2" size={44} />
          <h2 className="text-3xl md:text-4xl font-bold text-blue-900">Cuadro de Honor</h2>
          <p className="text-gray-600 mt-2">Estudiantes destacados del período</p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {students.map((student, idx) => (
            <div key={idx} className="bg-white rounded-xl shadow-md p-6 text-center border-t-4 border-green-500">
              <Star className="text-green-500 mx-auto mb-3" size={28} fill="currentColor" />
              <h3 className="text-xl font-bold text-blue-900 mb-1">{student.name}</h3>
              <p className="text-gray-500 text-sm">{student.grade}</p>
              <p className="mt-2 text-green-600 font-semibold">{student.honor}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HonorRollSection;