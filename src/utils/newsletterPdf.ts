import jsPDF from "jspdf";
import { applyPlugin } from "jspdf-autotable";
import type { HookData } from "jspdf-autotable";
import type { SabanaSection, SabanaStudent } from "@/hooks/useGradeAdjustments";
import type { MomentType } from "@/hooks/useNewsletters";

applyPlugin(jsPDF);

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

export async function generateNewsletterPdf(
  student: SabanaStudent,
  section: SabanaSection,
  moment: MomentType,
): Promise<void> {
  const doc = new jsPDF("portrait", "mm", "letter");
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  const logoData = await loadLogo();

  doc.addImage(logoData, "PNG", 14, 10, 22, 22);

  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text("U.E.P. FRANCISCO DE PAULA SALAZAR ACOSTA", 40, 16);

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text("Boletín de Calificaciones", 40, 22);

  const momentLabel = moment === "definitivas" ? "Definitivas" : `Momento ${moment}`;
  doc.text(`Año Escolar 2025-2026 — ${momentLabel}`, 40, 28);

  doc.setDrawColor(12, 18, 143);
  doc.setLineWidth(0.5);
  doc.line(14, 32, pageWidth - 14, 32);

  let y = 38;

  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.text("Datos del Estudiante", 14, y);
  y += 7;

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text(`Nombre: ${student.studentName}`, 14, y);
  doc.text(`Cédula: ${student.identification}`, 14, y + 6);
  doc.text(`Sección: ${section.label}`, 14, y + 12);
  y += 22;

  const nonSpecialSubjects = section.subjects.filter((s) => !s.isSpecialGroup);
  const nonSpecialIds = new Set(nonSpecialSubjects.map((s) => s.levelSubjectId));

  const subjectGrades = student.subjects
    .map((s) => {
      const subj = section.subjects.find((ss) => ss.levelSubjectId === s.levelSubjectId);
      if (!subj || subj.isSpecialGroup) return null;
      return {
        code: subj.subjectCode,
        name: subj.subjectName,
        grade: s.periodGrade,
      };
    })
    .filter((s): s is { code: string; name: string; grade: number | null } => s !== null);

  const grades = subjectGrades.filter((s) => s.grade !== null);
  const studentAverage = grades.length > 0
    ? Math.min(20, Math.round(grades.reduce((sum, s) => sum + (s.grade ?? 0), 0) / grades.length))
    : null;

  const sectionNonSpecial = section.students
    .map((st) => {
      const stGrades = st.subjects.filter(
        (s) => nonSpecialIds.has(s.levelSubjectId) && s.periodGrade !== null
      );
      if (stGrades.length === 0) return null;
      return Math.round(stGrades.reduce((sum, s) => sum + (s.periodGrade ?? 0), 0) / stGrades.length);
    })
    .filter((a): a is number => a !== null);

  const sectionAverage = sectionNonSpecial.length > 0
    ? Math.min(20, Math.round(sectionNonSpecial.reduce((s, a) => s + a, 0) / sectionNonSpecial.length))
    : null;

  const studentRank = sectionNonSpecial.filter((a) => a > (studentAverage ?? 0)).length + 1;

  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.text("Calificaciones", 14, y);
  y += 4;

  const tableBody = subjectGrades.map((s) => [
    s.code,
    s.name,
    s.grade !== null ? String(s.grade) : "—",
    s.grade !== null ? (s.grade >= 10 ? "Aprobado" : "Reprobado") : "Sin nota",
  ]);

  doc.autoTable({
    head: [["Código", "Materia", "Calificación", "Estado"]],
    body: tableBody,
    startY: y,
    styles: { fontSize: 9, cellPadding: 3 },
    headStyles: {
      fillColor: [12, 18, 143],
      textColor: [255, 255, 255],
      fontStyle: "bold",
      fontSize: 9,
    },
    alternateRowStyles: { fillColor: [245, 247, 250] },
    columnStyles: {
      0: { cellWidth: 25 },
      1: { cellWidth: 80 },
      2: { cellWidth: 30, halign: "center" },
      3: { cellWidth: 30, halign: "center" },
    },
    margin: { left: 14, right: 14 },
    didDrawPage: (data: HookData) => {
      doc.setFontSize(8);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(128, 128, 128);
      doc.text(
        `Página ${data.pageNumber}`,
        pageWidth - 20,
        pageHeight - 10,
        { align: "center" },
      );
    },
  });

  const finalY = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 10;

  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");

  const summaryData = [
    [`Promedio General: ${studentAverage ?? "—"}`, `Prom. de Sección: ${sectionAverage ?? "—"}`],
    [`Posición: ${studentRank}° / ${section.studentCount}`, `Estado: ${studentAverage !== null ? (studentAverage >= 10 ? "Aprobado" : "Reprobado") : "—"}`],
  ];

  let sy = finalY;
  for (const row of summaryData) {
    doc.text(row[0], 14, sy);
    doc.text(row[1], 110, sy);
    sy += 7;
  }

  sy += 10;
  doc.setDrawColor(12, 18, 143);
  doc.line(14, sy, 80, sy);
  doc.line(110, sy, 176, sy);
  sy += 5;
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.text("Firma del Representante", 14, sy);
  doc.text("Firma del Docente", 110, sy);

  const fileName = `boletin_${student.studentName.replace(/\s+/g, "_")}_${momentLabel.toLowerCase()}_${new Date().toISOString().slice(0, 10)}.pdf`;
  doc.save(fileName);
}

export async function generateSectionPdf(
  section: SabanaSection,
  moment: MomentType,
): Promise<void> {
  const doc = new jsPDF("portrait", "mm", "letter");
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  const logoData = await loadLogo();
  const momentLabel = moment === "definitivas" ? "Definitivas" : `Momento ${moment}`;

  const sortedStudents = [...section.students].sort((a, b) =>
    a.studentName.localeCompare(b.studentName, "es", { sensitivity: "base" }),
  );

  for (let i = 0; i < sortedStudents.length; i++) {
    const student = sortedStudents[i];

    if (i > 0) doc.addPage();

    doc.addImage(logoData, "PNG", 14, 10, 22, 22);

    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("U.E.P. FRANCISCO DE PAULA SALAZAR ACOSTA", 40, 16);

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text("Boletín de Calificaciones", 40, 22);
    doc.text(`Año Escolar 2025-2026 — ${momentLabel}`, 40, 28);

    doc.setDrawColor(12, 18, 143);
    doc.setLineWidth(0.5);
    doc.line(14, 32, pageWidth - 14, 32);

    let y = 38;

    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.text("Datos del Estudiante", 14, y);
    y += 7;

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text(`Nombre: ${student.studentName}`, 14, y);
    doc.text(`Cédula: ${student.identification}`, 14, y + 6);
    doc.text(`Sección: ${section.label}`, 14, y + 12);
    y += 22;

    const subjectGrades = student.subjects
      .map((s) => {
        const subj = section.subjects.find((ss) => ss.levelSubjectId === s.levelSubjectId);
        if (!subj || subj.isSpecialGroup) return null;
        return {
          code: subj.subjectCode,
          name: subj.subjectName,
          grade: s.periodGrade,
        };
      })
      .filter((s): s is { code: string; name: string; grade: number | null } => s !== null);

    const validGrades = subjectGrades.filter((s) => s.grade !== null);
    const studentAverage = validGrades.length > 0
      ? Math.min(20, Math.round(validGrades.reduce((sum, s) => sum + (s.grade ?? 0), 0) / validGrades.length))
      : null;

    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.text("Calificaciones", 14, y);
    y += 4;

    const tableBody = subjectGrades.map((s) => [
      s.code,
      s.name,
      s.grade !== null ? String(Math.min(20, s.grade)) : "—",
      s.grade !== null ? (s.grade >= 10 ? "Aprobado" : "Reprobado") : "Sin nota",
    ]);

    doc.autoTable({
      head: [["Código", "Materia", "Calificación", "Estado"]],
      body: tableBody,
      startY: y,
      styles: { fontSize: 9, cellPadding: 3 },
      headStyles: {
        fillColor: [12, 18, 143],
        textColor: [255, 255, 255],
        fontStyle: "bold",
        fontSize: 9,
      },
      alternateRowStyles: { fillColor: [245, 247, 250] },
      columnStyles: {
        0: { cellWidth: 25 },
        1: { cellWidth: 80 },
        2: { cellWidth: 30, halign: "center" },
        3: { cellWidth: 30, halign: "center" },
      },
      margin: { left: 14, right: 14 },
      didDrawPage: (data: HookData) => {
        doc.setFontSize(8);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(128, 128, 128);
        doc.text(
          `${student.studentName} — Página ${data.pageNumber} de ${sortedStudents.length}`,
          pageWidth / 2,
          pageHeight - 10,
          { align: "center" },
        );
      },
    });

    const finalY = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 10;

    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");

    const nonSpecialIds = new Set(
      section.subjects.filter((s) => !s.isSpecialGroup).map((s) => s.levelSubjectId),
    );
    const sectionNonSpecial = section.students
      .map((st) => {
        const stGrades = st.subjects.filter(
          (s) => nonSpecialIds.has(s.levelSubjectId) && s.periodGrade !== null,
        );
        if (stGrades.length === 0) return null;
        return Math.min(20, Math.round(stGrades.reduce((sum, s) => sum + (s.periodGrade ?? 0), 0) / stGrades.length));
      })
      .filter((a): a is number => a !== null);
    const sectionAverage = sectionNonSpecial.length > 0
      ? Math.min(20, Math.round(sectionNonSpecial.reduce((s, a) => s + a, 0) / sectionNonSpecial.length))
      : null;
    const studentRank = sectionNonSpecial.filter((a) => a > (studentAverage ?? 0)).length + 1;

    const summaryData = [
      [`Promedio General: ${studentAverage ?? "—"}`, `Prom. de Sección: ${sectionAverage ?? "—"}`],
      [`Posición: ${studentRank}° / ${section.studentCount}`, `Estado: ${studentAverage !== null ? (studentAverage >= 10 ? "Aprobado" : "Reprobado") : "—"}`],
    ];

    let sy = finalY;
    for (const row of summaryData) {
      doc.setFontSize(10);
      doc.setFont("helvetica", "bold");
      doc.text(row[0], 14, sy);
      doc.text(row[1], 110, sy);
      sy += 7;
    }

    sy += 10;
    doc.setDrawColor(12, 18, 143);
    doc.line(14, sy, 80, sy);
    doc.line(110, sy, 176, sy);
    sy += 5;
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.text("Firma del Representante", 14, sy);
    doc.text("Firma del Docente", 110, sy);
  }

  const fileName = `boletines_${section.label.replace(/\s+/g, "_")}_${momentLabel.toLowerCase()}_${new Date().toISOString().slice(0, 10)}.pdf`;
  doc.save(fileName);
}
