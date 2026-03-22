import * as React from "react";
import { EmailLayout } from "./components/EmailLayout";
import { EmailHeading } from "./components/EmailHeading";
import { EmailText } from "./components/EmailText";

export const InfoEmailWaitlist2: React.FC = () => {
    return (
        <EmailLayout preview="RevolutionUC Waitlist Update">
            <EmailHeading as="h1">Hey, Hacker!</EmailHeading>

            <EmailText>
                We wanted to follow up about your waitlist status for RevolutionUC.
            </EmailText>

            <EmailText>
                While we're still at capacity, we want to remind you that you can still
                show up on the day of the event. After check-in ends at 12 PM, we'll
                start admitting people from the waitlist on a first-come, first-serve
                basis based on order of arrival.
            </EmailText>

            <EmailText>
                Even if you can't get a spot for the main hackathon, you're still
                welcome to participate in our online CTF challenge!
            </EmailText>

            <EmailText>
                We appreciate your patience and enthusiasm for RevolutionUC. We hope to
                see you there!
            </EmailText>
        </EmailLayout>
    );
};

export default InfoEmailWaitlist2;
