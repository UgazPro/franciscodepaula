import { Star, Users, Heart, HandHeart, Handshake, Smile, Shield, GitMerge, Crown, Lightbulb, Scale, CheckCircle } from 'lucide-react';

export function ValuesSection() {
  const values = [
    { icon: Star, title: 'Fe', description: 'Confiamos en un propósito superior que guía nuestra labor' },
    { icon: Users, title: 'Pertenencia', description: 'Fomentamos el sentido de comunidad y orgullo institucional' },
    { icon: Heart, title: 'Respeto', description: 'Valoramos la dignidad de cada persona' },
    { icon: HandHeart, title: 'Amor', description: 'Actuamos con cariño y dedicación hacia los demás' },
    { icon: Handshake, title: 'Solidaridad', description: 'Trabajamos juntos por el bien común' },
    { icon: Smile, title: 'Alegría', description: 'Cultivamos un ambiente positivo y entusiasta' },
    { icon: Shield, title: 'Honestidad', description: 'Actuamos con transparencia y rectitud' },
    { icon: GitMerge, title: 'Integración', description: 'Promovemos la inclusión y el trabajo en equipo' },
    { icon: Crown, title: 'Liderazgo', description: 'Inspiramos con el ejemplo y la visión' },
    { icon: Lightbulb, title: 'Creatividad', description: 'Fomentamos la innovación y el pensamiento original' },
    { icon: Scale, title: 'Equidad', description: 'Garantizamos igualdad de oportunidades para todos' },
    { icon: CheckCircle, title: 'Responsabilidad', description: 'Cumplimos nuestros deberes con compromiso' },
  ];

  return (
    <section id="valores" className="py-16 bg-white">
      <div className="px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl md:text-4xl font-bold text-center text-(--darkBlueColor) mb-4">
          Nuestros Valores
        </h2>
        <p className="text-center text-gray-600 mb-12 max-w-2xl mx-auto">
          Principios que guían nuestra labor educativa y convivencia diaria
        </p>
        <div className="grid sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
          {values.map((value, index) => (
            <div
              key={index}
              className="group bg-(--grayColor) rounded-xl p-6 text-center hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
            >
              <div className="inline-flex p-3 bg-(--lightBlueColor)/30 rounded-full mb-4 group-hover:bg-(--greenColor) transition-colors">
                <value.icon className="text-(--darkBlueColor) group-hover:text-white" size={28} />
              </div>
              <h3 className="text-xl font-bold text-(--darkBlueColor) mb-2">{value.title}</h3>
              <p className="text-gray-600">{value.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
