import React from 'react';

export function StaffSection() {
  const staff = [
    { name: 'Dra. María Elena Rodríguez', role: 'Directora General', image: 'https://randomuser.me/api/portraits/women/68.jpg' },
    { name: 'Prof. Luis Alberto Méndez', role: 'Coordinador Académico', image: 'https://randomuser.me/api/portraits/men/32.jpg' },
    { name: 'Lic. Ana Carolina Díaz', role: 'Psicopedagoga', image: 'https://randomuser.me/api/portraits/women/45.jpg' },
    { name: 'Prof. José Gregorio Rivas', role: 'Representante de Deportes', image: 'https://randomuser.me/api/portraits/men/75.jpg' },
  ];

  return (
    <section id="personal" className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl md:text-4xl font-bold text-center text-blue-900 mb-12">
          Personal Destacado
        </h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {staff.map((person, index) => (
            <div key={index} className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
              <img
                src={person.image}
                alt={person.name}
                className="w-full h-56 object-cover"
              />
              <div className="p-6 text-center">
                <h3 className="text-xl font-bold text-blue-900 mb-1">{person.name}</h3>
                <p className="text-green-600 font-medium">{person.role}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

