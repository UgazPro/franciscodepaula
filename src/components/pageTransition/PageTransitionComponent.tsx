interface PageTransitionComponentProps {
    primaryChildren: React.ReactNode;
    secondaryChildren: React.ReactNode;
    toggle: boolean;
}

export default function PageTransitionComponent({ primaryChildren, secondaryChildren, toggle } : PageTransitionComponentProps) {
    return (
        <div className="relative w-screen h-full overflow-hidden">

            <div 
                className={`flex w-[180%] h-full transition-transform duration-500 ease-in-out ${toggle ? '-translate-x-1/2' : 'translate-x-0'}`}
            >
                <div className="w-1/2 shrink-0 h-full overflow-auto">{primaryChildren}</div>

                <div className="w-1/2 shrink-0 h-full overflow-auto">{secondaryChildren}</div>
            </div>

        </div>
    );
}
