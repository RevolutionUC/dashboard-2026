import * as React from "react";
import { EmailLayout } from "./components/EmailLayout";
import { EmailHeading } from "./components/EmailHeading";
import { EmailText } from "./components/EmailText";

interface InfoEmailWaitlistProps {
    firstName?: string;
}

export const InfoEmailWaitlist: React.FC<InfoEmailWaitlistProps> = ({
    firstName = "Hacker",
}) => {
    return (
        <EmailLayout preview="RevolutionUC Waitlist Information">
            <EmailHeading as="h1">Hey, {firstName}!</EmailHeading>

            <EmailText>
                Thank you for registering for RevolutionUC. We've received an
                overwhelming response, and while we'd love to accommodate everyone, we
                are currently at full capacity. As a result, we have put you on our{" "}
                <strong>waitlist</strong>.
            </EmailText>

            <EmailText>
                At the event day, after check-in ends at 12 PM and if space allows, we
                will start admitting participants off the waitlist on a first-come,
                first-serve basis based on order of arrival at the venue, until we have
                reached our maximum capacity. After this, if you're still on our
                waitlist, we unfortunately won't be able to provide you a spot in the
                hackathon in-person. However, you are welcome to participate in the CTF
                challenge online!
            </EmailText>

            <EmailText>
                We appreciate your enthusiasm and hope to see you at RevolutionUC!
            </EmailText>
        </EmailLayout>
    );
};

export default InfoEmailWaitlist;
