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
import { Loader2 } from "lucide-react";

interface LevelDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: { level: string }) => void;
  isPending: boolean;
  editData?: { id: number; level: string } | null;
}

export default function LevelDialog({
  open,
  onClose,
  onSubmit,
  isPending,
  editData,
}: LevelDialogProps) {
  const [level, setLevel] = useState("");

  const isEdit = !!editData;

  useEffect(() => {
    if (open) {
      setLevel(editData?.level ?? "");
    }
  }, [open, editData]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!level.trim()) return;
    onSubmit({ level: level.trim() });
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>
            {isEdit ? "Editar Nivel" : "Nuevo Nivel"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="level">Nombre del Nivel</Label>
            <Input
              id="level"
              value={level}
              onChange={(e) => setLevel(e.target.value)}
              placeholder="Ej: 1er Año, 2do Año..."
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
              disabled={isPending || !level.trim()}
            >
              {isPending && <Loader2 className="mr-2 size-4 animate-spin" />}
              {isEdit ? "Guardar Cambios" : "Crear Nivel"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
