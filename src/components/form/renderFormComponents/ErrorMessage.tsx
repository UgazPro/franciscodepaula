interface ErrorMessageProps {
    children: React.ReactNode;
    className?: string;
}

export default function ErrorMessage({children, className}: ErrorMessageProps) {

    return (

        <div className={`bg-transparent text-red-600 text-sm ${className ?? ""}`}>
            {children}
        </div>

    );

}
