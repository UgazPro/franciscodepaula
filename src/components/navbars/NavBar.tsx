import { useEffect, useState } from "react";
import { Menu } from "lucide-react";
import { Button } from "../ui/button";

export default function NavBar() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const handleWindowScroll = () => {
      setOpen(false);
    };

    window.addEventListener("scroll", handleWindowScroll, { passive: true });
    return () =>
      window.removeEventListener("scroll", handleWindowScroll);
  }, []);

  const handleScroll = (id: string) => {
    if(id === 'inicio') {
      window.scrollTo({ top: 0, behavior: "smooth" });
      setOpen(false);
      return; 
    }
    const section = document.getElementById(id);
    if (section) {
      section.scrollIntoView({ behavior: "smooth", block: "start" });
    }
    setOpen(false);
  };

  const menuItems = [
    { id: "inicio", label: "Inicio" },
    { id: "mision-vision", label: "Misión y Visión" },
    { id: "valores", label: "Valores" },
    { id: "personal", label: "Personal" },
    { id: "calendario", label: "Calendario" },
    { id: "honor", label: "Cuadro de Honor" },
    { id: "actividades", label: "Actividades" },
  ];

  return (

    <div className="relative w-full transition-all duration-300 py-2">

      {/* ================= DESKTOP MENU ================= */}
      <nav className="hidden md:flex justify-center items-center space-x-10">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => handleScroll(item.id)}
            style={{ fontFamily: "Kavoon" }}
            className="text-lg lg:text-xl cursor-pointer font-medium transition-colors hover:text-primary bg-transparent"
          >
            {item.label}
          </button>
        ))}
      </nav>

      {/* ================= MOBILE MENU ================= */}
      <nav className="flex flex-col items-center w-full md:hidden">
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={() => setOpen(!open)}
          aria-label="Toggle menu"
          className="transition-all duration-300 z-50"
        >
          <Menu className="text-black" />
        </Button>

        {open && (
          <div className="absolute top-full left-0 right-0 bg-(--greenColor) shadow-lg z-40">
            <div className="flex flex-col items-center space-y-4 py-4">
              {menuItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => handleScroll(item.id)}
                  style={{ fontFamily: "Kavoon" }}
                  className="text-lg cursor-pointer font-medium transition-colors hover:text-primary bg-transparent p-2 w-full text-center"
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>
        )}
      </nav>
    </div>
  );
}