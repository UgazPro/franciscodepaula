import { Upload, X } from "lucide-react";
import { Label } from "../ui/label";


interface ProfilePictureComponentProps {
  imagePreview: string | null;
  handleRemoveFoto: () => void;
  handleImageChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export default function ProfilePictureComponent({ imagePreview, handleRemoveFoto, handleImageChange }: ProfilePictureComponentProps) {

    return (

        <div className="space-y-2">

            <div className="flex items-center gap-4">
                <div className="relative h-24 w-24">
                    {imagePreview ? (
                        <img
                            src={imagePreview}
                            alt="Foto del estudiante"
                            className="h-24 w-24 rounded-full object-cover border"
                        />
                    ) : (
                        <div className="flex h-24 w-24 items-center justify-center rounded-full bg-gray-100 border">
                            <Upload className="h-8 w-8 text-gray-400" />
                        </div>
                    )}

                    {imagePreview && (
                        <button
                            type="button"
                            onClick={handleRemoveFoto}
                            className="absolute -top-2 -right-2 rounded-full bg-red-600 p-1 text-white hover:bg-red-700"
                        >
                            <X size={14} />
                        </button>
                    )}
                </div>

                <div>
                    <input
                        id="foto"
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleImageChange}
                    />
                    <Label
                        htmlFor="foto"
                        className="inline-flex cursor-pointer items-center rounded-md bg-primary px-4 py-2 text-sm text-white hover:bg-primary/90"
                    >
                        Subir foto
                    </Label>
                    <p className="mt-1 text-xs text-gray-500">
                        JPG o PNG · Máx. 1MB
                    </p>
                </div>
            </div>
        </div>

    );

}
