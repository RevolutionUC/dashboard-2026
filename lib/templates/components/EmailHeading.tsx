import { Heading } from "@react-email/components";
import * as React from "react";
import { brandColors } from "./EmailLayout";

interface EmailHeadingProps {
    children: React.ReactNode;
    as?: "h1" | "h2" | "h3";
}

export const EmailHeading: React.FC<EmailHeadingProps> = ({
    children,
    as = "h1",
}) => {
    const getHeadingStyle = () => {
        const baseStyle = {
            fontFamily: '"Lato", "Helvetica Neue", Arial, sans-serif',
            fontWeight: "700" as const,
            margin: "0 0 16px",
        };

        switch (as) {
            case "h1":
                return {
                    ...baseStyle,
                    color: brandColors.darkNavy,
                    fontSize: "28px",
                    lineHeight: "36px",
                };
            case "h2":
                return {
                    ...baseStyle,
                    color: brandColors.darkNavy,
                    fontSize: "24px",
                    lineHeight: "32px",
                };
            case "h3":
                return {
                    ...baseStyle,
                    color: brandColors.darkNavy,
                    fontSize: "18px",
                    lineHeight: "26px",
                };
            default:
                return baseStyle;
        }
    };

    return (
        <Heading as={as} style={getHeadingStyle()}>
            {children}
        </Heading>
    );
};

export default EmailHeading;
