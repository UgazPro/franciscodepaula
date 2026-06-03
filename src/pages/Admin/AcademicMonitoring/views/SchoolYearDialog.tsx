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
import { CalendarFieldComponent } from "@/components/form/renderFormComponents/CalendarFieldComponent";
import { Loader2 } from "lucide-react";

interface SchoolYearDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: { name: string; startDate: Date; endDate: Date }) => void;
  isPending: boolean;
  editData?: { id: number; name: string; startDate: string; endDate: string } | null;
}

export default function SchoolYearDialog({
  open,
  onClose,
  onSubmit,
  isPending,
  editData,
}: SchoolYearDialogProps) {
  const [name, setName] = useState("");
  const [startDate, setStartDate] = useState<Date | undefined>();
  const [endDate, setEndDate] = useState<Date | undefined>();

  const isEdit = !!editData;

  useEffect(() => {
    if (open) {
      if (editData) {
        setName(editData.name);
        setStartDate(new Date(editData.startDate));
        setEndDate(new Date(editData.endDate));
      } else {
        setName("");
        setStartDate(undefined);
        setEndDate(undefined);
      }
    }
  }, [open, editData]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!startDate || !endDate) return;
    onSubmit({ name, startDate, endDate });
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {isEdit ? "Editar Año Escolar" : "Nuevo Año Escolar"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nombre</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ej: 2024-2025"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Fecha de Inicio</Label>
              <CalendarFieldComponent
                value={startDate}
                onChange={setStartDate}
                placeholder="Selecciona fecha de inicio"
              />
            </div>

            <div className="space-y-2">
              <Label>Fecha de Fin</Label>
              <CalendarFieldComponent
                value={endDate}
                onChange={setEndDate}
                placeholder="Selecciona fecha de fin"
              />
            </div>
          </div>

          <DialogFooter className="pt-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button
              type="submit"
              className="bg-(--blueColor) hover:bg-(--darkBlueColor) cursor-pointer"
              disabled={isPending || !startDate || !endDate}
            >
              {isPending && <Loader2 className="mr-2 size-4 animate-spin" />}
              {isEdit ? "Guardar Cambios" : "Crear Año Escolar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
