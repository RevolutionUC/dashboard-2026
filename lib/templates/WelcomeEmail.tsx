import * as React from "react";
import { EmailLayout } from "./components/EmailLayout";
import { EmailText } from "./components/EmailText";

export const WelcomeEmail: React.FC = () => {
    return (
        <EmailLayout preview="Welcome to RevolutionUC Spring 2026!">
            <EmailText>Welcome to RevolutionUC Spring 2026!</EmailText>
            <EmailText>Thank you for registering for RevolutionUC!</EmailText>
        </EmailLayout>
    );
};

export default WelcomeEmail;
