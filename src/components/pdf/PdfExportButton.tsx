import { useState } from "react";
import { Button } from "@/components/ui/button";
import { FileDown, Loader2 } from "lucide-react";
import { generateStudentPdf } from "@/utils/pdfGenerator";
import type { IStudent } from "@/services/users/user.interface";

interface PdfExportButtonProps {
  students: IStudent[];
}

export default function PdfExportButton({ students }: PdfExportButtonProps) {
  const [isPending, setIsPending] = useState(false);

  const handleExport = async () => {
    if (students.length === 0) return;
    setIsPending(true);
    try {
      await generateStudentPdf(students);
    } catch (error) {
      console.error("Error generating PDF:", error);
    } finally {
      setIsPending(false);
    }
  };

  return (
    <Button
      type="button"
      variant="outline"
      onClick={handleExport}
      disabled={isPending || students.length === 0}
      className="flex items-center gap-2 border-(--blueColor)/30 text-(--blueColor) hover:bg-(--blueColor)/5 hover:border-(--blueColor)/50 cursor-pointer"
    >
      {isPending ? (
        <Loader2 className="size-4 animate-spin" />
      ) : (
        <FileDown className="size-4" />
      )}
      {isPending ? "Generando..." : "Exportar PDF"}
    </Button>
  );
}
