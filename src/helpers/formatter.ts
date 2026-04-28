import { differenceInYears, format } from "date-fns";
import { es } from "date-fns/locale";

export function calculateAge(birthday: Date): number {
  const today = new Date();
  const birthDate = new Date(birthday);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();

  if (
    monthDiff < 0 ||
    (monthDiff === 0 && today.getDate() < birthDate.getDate())
  ) {
    age--;
  }

  return age;
}

export const howLongHasSomeonePracticeInMonths = (enrollmentDate: Date) => {
  const today = new Date();
  const enrollment = new Date(enrollmentDate);
  const months =
    differenceInYears(today, enrollment) * 12 +
    (today.getMonth() - enrollment.getMonth());
  return months;
};

export function dateFormatter(date: Date) {
  try {
    return format(new Date(date), "dd/MM/yyyy", { locale: es });
  } catch {
    return "Fecha inválida";
  }
}

export const dateFormatterIntoLong = (fecha: Date) => {
  try {
    return format(new Date(fecha), "dd 'de' MMMM 'de' yyyy", { locale: es });
  } catch {
    return "Fecha inválida";
  }
};

export function calculateMartialTime(enrollmentDate: string | Date) {
  const start = new Date(enrollmentDate);
  const now = new Date();

  let years = now.getFullYear() - start.getFullYear();
  let months = now.getMonth() - start.getMonth();
  let days = now.getDate() - start.getDate();

  if (days < 0) {
    months--;
    const lastMonth = new Date(now.getFullYear(), now.getMonth(), 0);
    days += lastMonth.getDate();
  }

  if (months < 0) {
    years--;
    months += 12;
  }

  return {
    years,
    months,
    days,
    totalMonths: years * 12 + months,
    totalDays: Math.floor((now.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)),
    text: formatMartialTime(years, months, days)
  };
}

function formatMartialTime(y: number, m: number, d: number) {
  const parts = [];

  if (y > 0) parts.push(`${y} año${y > 1 ? "s" : ""}`);
  if (m > 0) parts.push(`${m} mes${m > 1 ? "es" : ""}`);
  if (d > 0 && y === 0) parts.push(`${d} día${d > 1 ? "s" : ""}`);

  return parts.length ? parts.join(", ") : "Recién inscrito";
}

export const formatPhoneNumber = (phone: string): string => {
    const cleaned = ('' + (phone ?? '')).replace(/\D/g, '');
    const match = cleaned.match(/^(\d{4})(\d{3})(\d{4})$/);
    if (match) {
        return `(${match[1]})${match[2]}-${match[3]}`;
    }
    return phone || '-';
};

