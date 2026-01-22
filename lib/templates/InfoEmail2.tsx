import * as React from "react";
import { EmailLayout } from "./components/EmailLayout";
import { EmailHeading } from "./components/EmailHeading";
import { EmailText } from "./components/EmailText";
import {
    InpersonPartial,
    SchedulePartial,
    SponsorsPartial,
    DiscordPartial,
    SocialsPartial,
    WaiverPartial,
} from "./components/partials";

interface InfoEmail2Props {
    firstName?: string;
    registrantId?: string;
}

export const InfoEmail2: React.FC<InfoEmail2Props> = ({
    firstName = "Hacker",
    registrantId,
}) => {
    return (
        <EmailLayout preview="RevolutionUC is less than 2 weeks away!">
            <EmailHeading as="h1">Hey, {firstName}!</EmailHeading>

            <EmailText>
                We're less than 2 weeks away from RevolutionUC Spring 2026! Here are
                some updates on the event:
            </EmailText>

            <InpersonPartial />
            <SchedulePartial />
            <SponsorsPartial />
            <DiscordPartial />
            <SocialsPartial />
            <WaiverPartial />

            <EmailText>
                <strong>Can't wait to see you there!</strong>
            </EmailText>

            <EmailText>
                Get excited! There's less than two weeks until hacking begins at
                RevolutionUC!
            </EmailText>
        </EmailLayout>
    );
};

export default InfoEmail2;
