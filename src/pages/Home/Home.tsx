import { ActivitiesSection } from "./ActivitiesSection/ActivitiesSection";
import { CalendarSection } from "./CalendarSection/CalendarSection";
import { HeroSection } from "./HeroSection/HeroSection";
import { HonorRollSection } from "./HonorRollSection/HonorRollSection";
import { MissionVision } from "./MissionVision/MissionVision";
import { StaffSection } from "./StaffSection/StaffSection";
import { ValuesSection } from "./ValuesSection/ValuesSection";

export default function Home() {

    return (
        <div className="bg-white min-h-screen">
            <main>
                <HeroSection />

                <MissionVision />

                <ValuesSection />

                <StaffSection />

                <CalendarSection />

                <HonorRollSection />

                <ActivitiesSection />
            </main>
        </div>
    );

}
