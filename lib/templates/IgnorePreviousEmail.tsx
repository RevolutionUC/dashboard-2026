import * as React from "react";
import { EmailLayout } from "./components/EmailLayout";
import { EmailText } from "./components/EmailText";

export const meta = {
    id: "ignore-previous-email",
    name: "Ignore Previous Email",
    subject: "Ignore Previous Email",
    description: "Correction email asking participants to ignore earlier details",
};

export const IgnorePreviousEmail: React.FC = () => {
    return (
        <EmailLayout preview="Please ignore the previous email.">
            <EmailText>Dear Participant,</EmailText>

            <EmailText>
                Please ignore the previous email. We're just as excited as you are for the
                hackathon, and we will be sharing the official confirmation emails soon with
                the correct details.
            </EmailText>

            <EmailText>
                Thank you for your patience, and we look forward to having you participate.
            </EmailText>
        </EmailLayout>
    );
};

export default IgnorePreviousEmail;
