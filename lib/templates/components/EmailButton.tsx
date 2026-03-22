import { Button } from "@react-email/components";
import * as React from "react";
import { brandColors } from "./EmailLayout";

interface EmailButtonProps {
    href: string;
    children: React.ReactNode;
    variant?: "primary" | "secondary" | "success";
}

export const EmailButton: React.FC<EmailButtonProps> = ({
    href,
    children,
    variant = "primary",
}) => {
    const getButtonStyle = () => {
        const baseStyle = {
            fontFamily: '"Lato", "Helvetica Neue", Arial, sans-serif',
            fontSize: "16px",
            fontWeight: "600" as const,
            padding: "14px 24px",
            borderRadius: "6px",
            textDecoration: "none",
            textAlign: "center" as const,
            display: "inline-block",
            margin: "8px 0 16px",
        };

        switch (variant) {
            case "secondary":
                return {
                    ...baseStyle,
                    backgroundColor: brandColors.darkNavy,
                    color: brandColors.white,
                };
            case "success":
                return {
                    ...baseStyle,
                    backgroundColor: brandColors.greenAccent,
                    color: brandColors.darkNavy,
                };
            case "primary":
            default:
                return {
                    ...baseStyle,
                    backgroundColor: brandColors.primaryBlue,
                    color: brandColors.white,
                };
        }
    };

    return (
        <Button href={href} target="_blank" style={getButtonStyle()}>
            {children}
        </Button>
    );
};

export default EmailButton;
