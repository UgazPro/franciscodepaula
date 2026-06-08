import jsPDF from "jspdf";
import { applyPlugin } from "jspdf-autotable";
import type { HookData } from "jspdf-autotable";
import type { IStudent } from "@/services/users/user.interface";
import type { PaymentResponse } from "@/services/administration/payments.types";

applyPlugin(jsPDF);

function calculateAge(birthDate: Date): number {
  const today = new Date();
  const birth = new Date(birthDate);
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  return age;
}

function loadLogo(): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        reject(new Error("Failed to get canvas context"));
        return;
      }
      ctx.drawImage(img, 0, 0);
      resolve(canvas.toDataURL("image/png"));
    };
    img.onerror = reject;
    img.src = "/logoF.png";
  });
}

export async function generateStudentPdf(students: IStudent[]): Promise<void> {
  const doc = new jsPDF("landscape", "mm", "letter");
  const pageWidth = doc.internal.pageSize.getWidth();

  const logoData = await loadLogo();

  doc.addImage(logoData, "PNG", 14, 10, 28, 28);

  doc.setFontSize(18);
  doc.setFont("helvetica", "bold");
  doc.text("Control de Estudios", 48, 22);

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text(
    `Generado: ${new Date().toLocaleDateString("es-ES", {
      day: "numeric",
      month: "long",
      year: "numeric",
    })}`,
    48,
    30,
  );

  doc.setFontSize(9);
  doc.text(`Total de estudiantes: ${students.length}`, 48, 36);

  const tableRows = students.map((s) => {
    const enrollment = s.enrollments?.[0];
    const level = enrollment?.section?.highSchoolLevel?.level ?? "";
    const section = enrollment?.section?.section ?? "";
    const gradeSection = level || section ? `${level} - ${section}` : "Sin asignar";

    const rep = s.representatives?.[0]?.representative;
    const repName = rep?.user?.person
      ? `${rep.user.person.firstNames} ${rep.user.person.lastNames}`
      : "Sin representante";

    const age = calculateAge(s.person.birthDate);

    return [
      `${s.person.firstNames} ${s.person.lastNames} (${age} años)`,
      s.person.identificationNumber,
      gradeSection,
      repName,
      s.status ? "Activo" : "Inactivo",
    ];
  });

  doc.autoTable({
    head: [
      [
        "Estudiante",
        "Identificación",
        "Grado / Sección",
        "Representante",
        "Estado",
      ],
    ],
    body: tableRows,
    startY: 44,
    styles: {
      fontSize: 8.5,
      cellPadding: 3,
    },
    headStyles: {
      fillColor: [12, 18, 143],
      textColor: [255, 255, 255],
      fontStyle: "bold",
      fontSize: 9,
    },
    alternateRowStyles: {
      fillColor: [245, 247, 250],
    },
    columnStyles: {
      0: { cellWidth: 70 },
      1: { cellWidth: 35 },
      2: { cellWidth: 40 },
      3: { cellWidth: 60 },
      4: { cellWidth: 25 },
    },
    margin: { left: 14, right: 14 },
    didDrawPage: (data: HookData) => {
      doc.setFontSize(8);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(128, 128, 128);
      doc.text(
        `Página ${data.pageNumber}`,
        pageWidth - 20,
        doc.internal.pageSize.getHeight() - 10,
        { align: "center" },
      );
    },
  });

  doc.save(`estudiantes_${new Date().toISOString().slice(0, 10)}.pdf`);
}

export async function generatePaymentsPdf(payments: PaymentResponse[]): Promise<void> {
  const doc = new jsPDF("landscape", "mm", "letter");
  const pageWidth = doc.internal.pageSize.getWidth();

  const logoData = await loadLogo();

  doc.addImage(logoData, "PNG", 14, 10, 28, 28);

  doc.setFontSize(18);
  doc.setFont("helvetica", "bold");
  doc.text("Registro de Pagos", 48, 22);

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text(
    `Generado: ${new Date().toLocaleDateString("es-ES", {
      day: "numeric",
      month: "long",
      year: "numeric",
    })}`,
    48,
    30,
  );

  doc.setFontSize(9);
  doc.text(`Total de pagos: ${payments.length}`, 48, 36);

  const tableRows = payments.map((p) => {
    const studentFee = p.studentFees?.[0];
    const person = studentFee?.student?.person;
    const studentName = person
      ? `${person.firstNames} ${person.lastNames}`
      : "—";
    const ci = person?.identificationNumber ?? "—";
    const feeName = studentFee?.fee?.name ?? "—";
    const currencySymbol = p.currency === "VES" ? "Bs." : "$";
    const amount = `${currencySymbol} ${Number(p.totalAmount).toFixed(2)}`;
    const method = p.paymentMethod?.type ?? "—";
    const date = p.paymentDate
      ? new Date(p.paymentDate).toLocaleDateString("es-ES", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
        })
      : "—";
    const reference = p.reference ?? "—";
    const status = p.status ? "Pagado" : "Anulado";

    return [studentName, ci, feeName, amount, method, date, reference, status];
  });

  doc.autoTable({
    head: [
      [
        "Estudiante",
        "Identificación",
        "Tipo de Pago",
        "Monto",
        "Método de Pago",
        "Fecha",
        "Referencia",
        "Estado",
      ],
    ],
    body: tableRows,
    startY: 44,
    styles: {
      fontSize: 8,
      cellPadding: 2.5,
    },
    headStyles: {
      fillColor: [12, 18, 143],
      textColor: [255, 255, 255],
      fontStyle: "bold",
      fontSize: 8.5,
    },
    alternateRowStyles: {
      fillColor: [245, 247, 250],
    },
    columnStyles: {
      0: { cellWidth: 55 },
      1: { cellWidth: 28 },
      2: { cellWidth: 30 },
      3: { cellWidth: 28 },
      4: { cellWidth: 30 },
      5: { cellWidth: 28 },
      6: { cellWidth: 30 },
      7: { cellWidth: 20 },
    },
    margin: { left: 14, right: 14 },
    didDrawPage: (data: HookData) => {
      doc.setFontSize(8);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(128, 128, 128);
      doc.text(
        `Página ${data.pageNumber}`,
        pageWidth - 20,
        doc.internal.pageSize.getHeight() - 10,
        { align: "center" },
      );
    },
  });

  doc.save(`pagos_${new Date().toISOString().slice(0, 10)}.pdf`);
}
