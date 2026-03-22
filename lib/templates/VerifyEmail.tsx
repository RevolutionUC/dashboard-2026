import * as React from "react";
import { EmailLayout } from "./components/EmailLayout";
import { EmailHeading } from "./components/EmailHeading";
import { EmailText, EmailLink } from "./components/EmailText";
import { EmailButton } from "./components/EmailButton";

interface VerifyEmailProps {
    firstName?: string;
    verificationUrl?: string;
    waitlist?: boolean;
}

export const VerifyEmail: React.FC<VerifyEmailProps> = ({
    firstName = "Hacker",
    verificationUrl = "#",
    waitlist = false,
}) => {
    return (
        <EmailLayout
            preview={`Verify your ${waitlist ? "waitlist " : ""}registration for RevolutionUC`}
        >
            <EmailHeading as="h1">Hey, {firstName}!</EmailHeading>

            <EmailText>
                To complete your {waitlist ? "waitlist " : ""}registration for
                RevolutionUC, please{" "}
                <EmailLink href={verificationUrl}>verify your email address</EmailLink>.
            </EmailText>

            {waitlist && (
                <EmailText>
                    <strong>Note:</strong> You are currently on the waitlist! We have hit
                    our capacity, but spots may open up. Please confirm your email address
                    and monitor your inbox for further notification.
                </EmailText>
            )}

            <EmailButton href={verificationUrl}>Verify Email</EmailButton>

            <EmailText>
                Your registration will not be complete until you verify.
            </EmailText>

            <EmailText>
                If you're over 18, you can review the event waiver you agreed to{" "}
                <EmailLink href="https://revolutionuc.com/waiver">here</EmailLink>.
            </EmailText>
        </EmailLayout>
    );
};

export default VerifyEmail;
