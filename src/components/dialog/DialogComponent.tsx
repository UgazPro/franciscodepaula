import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

interface DialogComponentProps {
    openDialog: boolean;
    onClose: (open: boolean) => void;
    children?: React.ReactNode;
    dialogTitle: string;
    dialogDescription?: string; 
    className?: string;
    dialogTitleStyle?: string;
}

export default function DialogComponent({openDialog, onClose, children, dialogTitle, dialogDescription, className, dialogTitleStyle} : DialogComponentProps) {

    return (

        <div>

            <Dialog open={openDialog} onOpenChange={onClose}>
                <DialogContent className={cn(className, "[overflow-anchor:auto]")} onOpenAutoFocus={(e) => e.preventDefault()}>
                    <DialogHeader>
                        <DialogTitle className={dialogTitleStyle}>{dialogTitle}</DialogTitle>
                        <DialogDescription>
                            {dialogDescription}
                        </DialogDescription>
                    </DialogHeader>
                    {children}
                </DialogContent>
            </Dialog>

        </div>

    );

}
