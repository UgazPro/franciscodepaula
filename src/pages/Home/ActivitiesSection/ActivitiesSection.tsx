import { Music, BookOpen, Paintbrush, Trophy, Users, Globe } from 'lucide-react';

export function ActivitiesSection() {
  const activities = [
    { icon: Music, title: 'Coral Infantil', description: 'Desarrollo musical y expresión artística' },
    { icon: Trophy, title: 'Deportes', description: 'Fútbol, baloncesto, voleibol y atletismo' },
    { icon: Paintbrush, title: 'Artes Plásticas', description: 'Pintura, dibujo y manualidades' },
    { icon: BookOpen, title: 'Club de Lectura', description: 'Fomento de la literatura y comprensión' },
    { icon: Globe, title: 'Robótica', description: 'Tecnología e innovación' },
    { icon: Users, title: 'Voluntariado', description: 'Proyectos comunitarios' },
  ];

  return (
    <section id="actividades" className="py-16 bg-(--grayColor)">
      <div className="px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl md:text-4xl font-bold text-center text-(--darkBlueColor) mb-4">
          Actividades Extracurriculares
        </h2>
        <p className="text-center text-gray-600 mb-12 max-w-2xl mx-auto">
          Potenciamos los talentos de nuestros estudiantes más allá del aula
        </p>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {activities.map((activity, idx) => (
            <div
              key={idx}
              className="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition flex items-start gap-4"
            >
              <div className="bg-(--greenColor)/20 p-3 rounded-full">
                <activity.icon className="text-(--greenColor)" size={24} />
              </div>
              <div>
                <h3 className="text-xl font-bold text-(--darkBlueColor) mb-2">{activity.title}</h3>
                <p className="text-gray-600">{activity.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
