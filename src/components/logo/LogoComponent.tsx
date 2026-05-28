import logoSrc from "/logoF.png";

interface LogoTipoProps {
  className?: string;
}

export default function LogoComponent({ className }: LogoTipoProps) {
  return (
    <div className={`flex items-center justify-center shrink-0 ${className ?? ""}`}>
      <img src={logoSrc} alt="Logo" />
    </div>
  );
}
