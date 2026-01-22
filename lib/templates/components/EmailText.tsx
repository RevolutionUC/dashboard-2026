import { Text, Link } from "@react-email/components";
import * as React from "react";
import { brandColors } from "./EmailLayout";

interface EmailTextProps {
    children: React.ReactNode;
    style?: React.CSSProperties;
}

export const EmailText: React.FC<EmailTextProps> = ({ children, style }) => {
    return <Text style={{ ...paragraph, ...style }}>{children}</Text>;
};

interface EmailLinkProps {
    href: string;
    children: React.ReactNode;
}

export const EmailLink: React.FC<EmailLinkProps> = ({ href, children }) => {
    return (
        <Link href={href} target="_blank" style={link}>
            {children}
        </Link>
    );
};

interface EmailStrongProps {
    children: React.ReactNode;
}

export const EmailStrong: React.FC<EmailStrongProps> = ({ children }) => {
    return <strong style={strong}>{children}</strong>;
};

// Styles
const paragraph = {
    color: brandColors.darkText,
    fontSize: "16px",
    lineHeight: "26px",
    margin: "0 0 16px",
    fontFamily: '"Lato", "Helvetica Neue", Arial, sans-serif',
};

const link = {
    color: brandColors.primaryBlue,
    textDecoration: "none",
};

const strong = {
    fontWeight: "700" as const,
    color: brandColors.darkNavy,
};

export default EmailText;
