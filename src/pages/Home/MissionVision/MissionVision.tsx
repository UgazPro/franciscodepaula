import { Target, Eye } from 'lucide-react';

export function MissionVision() {
  return (
    <section id="mision-vision" className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl md:text-4xl font-bold text-center text-blue-900 mb-12">
          Nuestra Filosofía
        </h2>
        <div className="grid md:grid-cols-2 gap-8">
          {/* Misión */}
          <div className="bg-white rounded-xl shadow-lg p-8 hover:shadow-xl transition-shadow border-t-4 border-green-500">
            <div className="flex items-center gap-3 mb-4">
              <Target className="text-green-500" size={32} />
              <h3 className="text-2xl font-bold text-blue-900">Misión</h3>
            </div>
            <p className="text-gray-700 leading-relaxed">
              Formar integralmente a nuestros estudiantes con una educación de calidad, basada en valores éticos, morales y académicos, promoviendo el desarrollo de habilidades intelectuales, artísticas y deportivas para que sean ciudadanos comprometidos con la sociedad.
            </p>
          </div>

          {/* Visión */}
          <div className="bg-white rounded-xl shadow-lg p-8 hover:shadow-xl transition-shadow border-t-4 border-green-500">
            <div className="flex items-center gap-3 mb-4">
              <Eye className="text-green-500" size={32} />
              <h3 className="text-2xl font-bold text-blue-900">Visión</h3>
            </div>
            <p className="text-gray-700 leading-relaxed">
              Ser una institución educativa líder y referente en la región, reconocida por su excelencia académica, innovación pedagógica y formación en valores, preparando a nuestros estudiantes para los desafíos del siglo XXI.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

