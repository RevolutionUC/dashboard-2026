import * as React from "react";
import { EmailLayout } from "./components/EmailLayout";
import { EmailHeading } from "./components/EmailHeading";
import { EmailText } from "./components/EmailText";
import {
    SchedulePartial,
    InpersonPartial,
    SponsorsPartial,
    SocialsPartial,
} from "./components/partials";

interface InfoEmail1Props {
    firstName?: string;
}

export const InfoEmail1: React.FC<InfoEmail1Props> = ({
    firstName = "Hacker",
}) => {
    return (
        <EmailLayout preview="RevolutionUC is less than 3 weeks away!">
            <EmailHeading as="h1">Hey, {firstName}!</EmailHeading>

            <EmailText>
                We're less than 3 weeks away from RevolutionUC Spring 2026! Here are
                some updates on the event:
            </EmailText>

            <EmailHeading as="h3">Attendance Confirmation</EmailHeading>
            <EmailText>
                You will receive an attendance confirmation email in about a week. If
                you are planning to participate in RevolutionUC, please make sure you
                confirm your attendance.
            </EmailText>

            <SchedulePartial />
            <InpersonPartial />
            <SponsorsPartial />
            <SocialsPartial />

            <EmailText>
                <strong>Can't wait to see you there!</strong>
            </EmailText>

            <EmailText>
                Get excited! There's less than 3 weeks until hacking begins at
                RevolutionUC!
            </EmailText>
        </EmailLayout>
    );
};

export default InfoEmail1;
