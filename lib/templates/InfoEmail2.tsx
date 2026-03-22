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

export const InfoEmail2: React.FC = () => {
    return (
        <EmailLayout preview="RevolutionUC is less than 2 weeks away!">
            <EmailHeading as="h1">Hey, Hacker!</EmailHeading>

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
