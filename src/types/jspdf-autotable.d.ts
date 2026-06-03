import "jspdf";
import type { UserOptions, HookData } from "jspdf-autotable";

declare module "jspdf" {
  interface jsPDF {
    autoTable: (options: UserOptions) => void;
    lastAutoTable: {
      finalY: number;
    } | null;
  }
}

export type AutoTableHookData = HookData;
