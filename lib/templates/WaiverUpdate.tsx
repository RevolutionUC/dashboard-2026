import * as React from "react";
import { EmailLayout } from "./components/EmailLayout";
import { EmailHeading } from "./components/EmailHeading";
import { EmailText, EmailLink } from "./components/EmailText";

interface WaiverUpdateProps {
    firstName?: string;
}

export const WaiverUpdate: React.FC<WaiverUpdateProps> = ({
    firstName = "Hacker",
}) => {
    return (
        <EmailLayout preview="RevolutionUC Waiver Update">
            <EmailHeading as="h1">Hey, {firstName}!</EmailHeading>

            <EmailText>
                We've made some updates to the RevolutionUC event waiver. Please review
                the updated waiver at your earliest convenience.
            </EmailText>

            <EmailText>
                If you're over 18, you can view the updated waiver at{" "}
                <EmailLink href="https://revolutionuc.com/waiver">
                    revolutionuc.com/waiver
                </EmailLink>
                .
            </EmailText>

            <EmailText>
                If you're under 18, please check your email for additional information
                about the required forms and waivers.
            </EmailText>

            <EmailText>
                If you have any questions about the waiver, please reach out to us at{" "}
                <EmailLink href="mailto:info@revolutionuc.com">
                    info@revolutionuc.com
                </EmailLink>
                .
            </EmailText>
        </EmailLayout>
    );
};

export default WaiverUpdate;
