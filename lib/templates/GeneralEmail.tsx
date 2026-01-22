import * as React from "react";
import { Section } from "@react-email/components";
import { EmailLayout } from "./components/EmailLayout";
import { EmailText } from "./components/EmailText";

interface GeneralEmailProps {
    body?: string;
}

export const GeneralEmail: React.FC<GeneralEmailProps> = ({
    body = "This is a message from RevolutionUC.",
}) => {
    // Split body by double newlines to preserve paragraph formatting
    const paragraphs = body.split("\n\n").filter((p) => p.trim());

    return (
        <EmailLayout preview={body.substring(0, 100)}>
            {paragraphs.map((p, index) => (
                <EmailText key={index}>{p}</EmailText>
            ))}
        </EmailLayout>
    );
};

export default GeneralEmail;
