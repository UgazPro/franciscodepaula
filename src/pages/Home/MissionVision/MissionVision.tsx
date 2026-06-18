import { Target, Eye } from 'lucide-react';

export function MissionVision() {
  return (
    <section id="mision-vision" className="py-16 bg-(--grayColor)">
      <div className="px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl md:text-4xl font-bold text-center text-(--darkBlueColor) mb-12">
          Nuestra Filosofía
        </h2>
        <div className="grid md:grid-cols-2 gap-8">
          <div className="bg-white rounded-xl shadow-lg p-8 hover:shadow-xl transition-shadow border-t-4 border-(--greenColor)">
            <div className="flex items-center gap-3 mb-4">
              <Target className="text-(--greenColor)" size={32} />
              <h3 className="text-2xl font-bold text-(--darkBlueColor)">Misión</h3>
            </div>
            <p className="text-gray-700 leading-relaxed">
              Formar integralmente a nuestros estudiantes con una educación de calidad, basada en valores éticos, morales y académicos, promoviendo el desarrollo de habilidades intelectuales, artísticas y deportivas para que sean ciudadanos comprometidos con la sociedad.
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-8 hover:shadow-xl transition-shadow border-t-4 border-(--greenColor)">
            <div className="flex items-center gap-3 mb-4">
              <Eye className="text-(--greenColor)" size={32} />
              <h3 className="text-2xl font-bold text-(--darkBlueColor)">Visión</h3>
            </div>
            <p className="text-gray-700 leading-relaxed">
              “Queremos ser la primera elección de las familias que confíen en que nuestra Comunidad Educativa, puede garantizar la formación académica, la madurez emocional y la educación en valores necesarios para el futuro de sus hijos en un mundo de conocimiento, tecnológico y global”
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
