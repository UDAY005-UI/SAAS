// components/ui/Button.tsx
import { ButtonHTMLAttributes, FC } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    size?: "sm" | "md" | "lg";
    className?: string;
}

const Button: FC<ButtonProps> = ({
    size = "md",
    className,
    children,
    ...props
}) => {
    let sizeClasses = "";
    if (size === "sm") sizeClasses = "px-3 py-1 text-sm";
    if (size === "md") sizeClasses = "px-4 py-2 text-base";
    if (size === "lg") sizeClasses = "px-6 py-3 text-lg";

    return (
        <button className={`${sizeClasses} ${className}`} {...props}>
            {children}
        </button>
    );
};

export default Button;
