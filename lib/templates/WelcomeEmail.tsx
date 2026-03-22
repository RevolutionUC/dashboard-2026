import * as React from "react";
import { EmailLayout } from "./components/EmailLayout";
import { EmailHeading } from "./components/EmailHeading";
import { EmailText } from "./components/EmailText";

interface WelcomeEmailProps {
    firstName?: string;
}

export const WelcomeEmail: React.FC<WelcomeEmailProps> = ({ firstName = "Hacker" }) => {
    return (
        <EmailLayout preview="Welcome to RevolutionUC Spring 2026!">
            <EmailHeading as="h1">Hey, {firstName}!</EmailHeading>
            <EmailText>Welcome to RevolutionUC Spring 2026!</EmailText>
            <EmailText>Thank you for registering for RevolutionUC!</EmailText>
        </EmailLayout>
    );
};

export default WelcomeEmail;
