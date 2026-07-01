import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import { useLevels } from "@/hooks/useSchoolYears";

interface SectionDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: {
    schoolYearId: number;
    highSchoolLevelId: number;
    section: string;
  }) => void;
  isPending: boolean;
  schoolYearId: number;
  editData?: {
    id: number;
    highSchoolLevelId: number;
    section: string;
  } | null;
  preselectedLevelId?: number | null;
}

export default function SectionDialog({
  open,
  onClose,
  onSubmit,
  isPending,
  schoolYearId,
  editData,
  preselectedLevelId,
}: SectionDialogProps) {
  const { data: levels = [] } = useLevels();
  const [levelId, setLevelId] = useState("");
  const [sectionName, setSectionName] = useState("");

  const isEdit = !!editData;

  useEffect(() => {
    if (open) {
      if (editData) {
        setLevelId(String(editData.highSchoolLevelId));
        setSectionName(editData.section);
      } else {
        setLevelId(preselectedLevelId ? String(preselectedLevelId) : "");
        setSectionName("");
      }
    }
  }, [open, editData, preselectedLevelId]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!levelId) return;
    onSubmit({
      schoolYearId,
      highSchoolLevelId: Number(levelId),
      section: sectionName,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>
            {isEdit ? "Editar Sección" : "Agregar Sección"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="level">Nivel</Label>
            <Select value={levelId} onValueChange={setLevelId} required>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Seleccionar nivel" />
              </SelectTrigger>
              <SelectContent>
                {levels.map(
                  (l: { id: number; level: string }) => (
                    <SelectItem key={l.id} value={String(l.id)}>
                      {l.level}
                    </SelectItem>
                  ),
                )}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="section">Sección</Label>
            <Input
              id="section"
              value={sectionName}
              onChange={(e) => setSectionName(e.target.value)}
              placeholder="Ej: A, B, C..."
              required
            />
          </div>

          <DialogFooter className="pt-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button
              type="submit"
              className="bg-(--blueColor) hover:bg-(--darkBlueColor) cursor-pointer"
              disabled={isPending || !levelId}
            >
              {isPending && <Loader2 className="mr-2 size-4 animate-spin" />}
              {isEdit ? "Guardar Cambios" : "Agregar Sección"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
