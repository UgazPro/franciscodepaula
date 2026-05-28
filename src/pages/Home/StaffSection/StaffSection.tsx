import { useMemo } from "react";
import { useStaff } from "@/hooks/useUsers";
import { Users } from "lucide-react";

export function StaffSection() {
  const { data: staff = [], isLoading } = useStaff();

  const staffMembers = useMemo(() => {
    const rolesOrder = ["Director", "Subdirector", "Contador", "Control de Estudios"];
    return (staff ?? [])
      .filter((s) => rolesOrder.includes(s.role.role))
      .sort((a, b) => rolesOrder.indexOf(a.role.role) - rolesOrder.indexOf(b.role.role));
  }, [staff]);

  return (
    <section id="personal" className="py-16 bg-(--grayColor)">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <Users className="inline-block text-(--greenColor) mb-2" size={40} />
          <h2 className="text-3xl md:text-4xl font-bold text-(--darkBlueColor)">
            Personal Destacado
          </h2>
          <p className="text-gray-600 mt-2">
            Nuestro equipo de profesionales comprometidos con la educación
          </p>
        </div>

        {isLoading ? (
          <div className="text-center py-12 text-gray-400">Cargando...</div>
        ) : staffMembers.length === 0 ? (
          <div className="text-center py-12 text-gray-400">Sin personal registrado</div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {staffMembers.map((person) => {
              const p = person.person;
              const initials = `${p.firstNames?.charAt(0) ?? ""}${p.lastNames?.charAt(0) ?? ""}`;
              return (
                <div
                  key={person.id}
                  className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
                >
                  {p.profilePhoto ? (
                    <img
                      src={p.profilePhoto}
                      alt={`${p.firstNames} ${p.lastNames}`}
                      className="w-full h-56 object-cover"
                    />
                  ) : (
                    <div className="w-full h-56 bg-linear-to-br from-(--darkBlueColor) to-(--blueColor) flex items-center justify-center">
                      <span className="text-white text-5xl font-bold">{initials}</span>
                    </div>
                  )}
                  <div className="p-6 text-center">
                    <h3 className="text-xl font-bold text-(--darkBlueColor) mb-1">
                      {p.firstNames} {p.lastNames}
                    </h3>
                    <p className="text-(--greenColor) font-medium">{person.role.role}</p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
