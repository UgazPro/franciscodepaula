import { Calendar, Clock } from 'lucide-react';

export function CalendarSection() {
  const events = [
    { date: '15 de Abril', event: 'Inicio de inscripciones 2026', type: 'Académico' },
    { date: '28 de Abril', event: 'Consejo de padres y representantes', type: 'Reunión' },
    { date: '5 de Mayo', event: 'Jornada deportiva intercolegial', type: 'Deporte' },
    { date: '20 de Mayo', event: 'Entrega de boletines', type: 'Académico' },
  ];

  return (
    <section id="calendario" className="py-16 bg-white">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <Calendar className="inline-block text-(--greenColor) mb-2" size={40} />
          <h2 className="text-3xl md:text-4xl font-bold text-(--darkBlueColor)">Calendario Escolar</h2>
          <p className="text-gray-600 mt-2">Próximos eventos y actividades importantes</p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          {events.map((event, idx) => (
            <div key={idx} className="flex items-start gap-4 p-4 bg-(--grayColor) rounded-lg hover:shadow-md transition">
              <div className="bg-(--darkBlueColor) text-white rounded-lg text-center min-w-[80px] p-2">
                <div className="text-lg font-bold">{event.date.split(' ')[0]}</div>
                <div className="text-xs">{event.date.split(' ')[1]}</div>
              </div>
              <div>
                <h3 className="font-bold text-(--darkBlueColor)">{event.event}</h3>
                <p className="text-sm text-(--greenColor)">{event.type}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center mt-8">
          <button className="inline-flex items-center gap-2 text-(--darkBlueColor) font-semibold border-b-2 border-(--greenColor) hover:text-(--greenColor) transition">
            Ver calendario completo <Clock size={16} />
          </button>
        </div>
      </div>
    </section>
  );
}
