import * as React from "react";
import { EmailLayout } from "./components/EmailLayout";
import { EmailHeading } from "./components/EmailHeading";
import { EmailText } from "./components/EmailText";

export const meta = {
    id: "info-email-waitlist-pass-1",
    name: "Waitlist Pass 1 Notification",
    subject: "RevolutionUC Waitlist Information",
    description: "Initial waitlist email explaining the two-pass system",
};

interface InfoEmailWaitlistPass1Props {
    firstName?: string;
}

export const InfoEmailWaitlistPass1: React.FC<InfoEmailWaitlistPass1Props> = ({ firstName = "Hacker" }) => {
    return (
        <EmailLayout preview="RevolutionUC Waitlist Information">
            <EmailHeading as="h1">Hey, {firstName}!</EmailHeading>

            <EmailText>
                Thank you for registering for RevolutionUC. We've received an
                overwhelming response, and we are currently at full capacity. Because of
                this, you have been placed on our waitlist.
            </EmailText>

            <EmailText>This year, we will send two confirmation emails to move participants from the waitlist to the confirmed list. The first email will be sent today, and you must confirm your spot to be added. If you miss this email, don’t worry, you will have another opportunity to confirm your spot when the second email is sent. Look out for our emails!
            </EmailText>

            <EmailText>
                We appreciate your enthusiasm and hope to see you at RevolutionUC!
            </EmailText>
        </EmailLayout>
    );
};

export default InfoEmailWaitlistPass1;
