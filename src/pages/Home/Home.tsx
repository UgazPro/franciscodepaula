import Navbar from "../../components/navbars/NavBar";
import Footer from "../../layouts/Footer/Footer";
import ActivitiesSection from "./ActivitiesSection/ActivitiesSection";
import CalendarSection from "./CalendarSection/CalendarSection";
import HeroSection from "./HeroSection/HeroSection";
import HonorRollSection from "./HonorRollSection/HonorRollSection";
import MissionVision from "./MissionVision/MissionVision";
import StaffSection from "./StaffSection/StaffSection";
import ValuesSection from "./ValuesSection/ValuesSection";


export default function Home() {
    return (
        <div className="bg-white min-h-screen">
            {/* Barra de navegación */}
            {/* <Navbar /> */}

            {/* Contenido principal */}
            <main>
                {/* Header / Hero Section */}
                <HeroSection />

                {/* Misión y Visión */}
                <MissionVision />

                {/* Valores Institucionales */}
                <ValuesSection />

                {/* Personal Encargado */}
                <StaffSection />

                {/* Calendario Escolar */}
                <CalendarSection />

                {/* Cuadro de Honor */}
                <HonorRollSection />

                {/* Actividades Extracurriculares */}
                <ActivitiesSection />
            </main>

            {/* Footer */}
            <Footer />
        </div>
    );
}
