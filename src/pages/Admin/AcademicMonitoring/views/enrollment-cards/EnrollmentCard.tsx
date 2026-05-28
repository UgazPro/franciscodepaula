interface EnrollmentCardProps {
  student: any;
  onClick: () => void;
}

export function EnrollmentCard({ student, onClick }: EnrollmentCardProps) {
  const p = student.person;
  const initials = `${p.firstNames?.charAt(0) ?? ""}${p.lastNames?.charAt(0) ?? ""}`;

  return (
    <button
      onClick={onClick}
      className="w-full text-left bg-white rounded-xl border-l-4 border-(--blueColor) shadow-sm hover:shadow-md transition-all p-4 flex items-center gap-4 cursor-pointer"
    >
      <div className="w-12 h-12 bg-linear-to-br from-(--darkBlueColor) to-(--blueColor) rounded-full flex items-center justify-center text-white font-bold text-sm shrink-0">
        {initials}
      </div>
      <div className="min-w-0">
        <p className="font-semibold text-(--darkBlueColor) truncate">
          {p.firstNames} {p.lastNames}
        </p>
        <p className="text-sm text-gray-400">
          {p.identificationNumber}
        </p>
      </div>
    </button>
  );
}
