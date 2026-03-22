import * as React from "react";
import { EmailLayout } from "./components/EmailLayout";
import { EmailHeading } from "./components/EmailHeading";
import { EmailText } from "./components/EmailText";
import {
    InpersonPartial,
    TransportationPartial,
    SchedulePartial,
    CheckInPartial,
    WhatToBringPartial,
    DiscordPartial,
    HackSubmissionsPartial,
    TeamsPartial,
    SocialsPartial,
} from "./components/partials";

export const InfoEmail4: React.FC = () => {
    return (
        <EmailLayout preview="RevolutionUC starts TOMORROW!">
            <EmailHeading as="h1">Hey, Hacker!</EmailHeading>

            <EmailText>
                RevolutionUC is starting TOMORROW at noon! Here's some important
                information:
            </EmailText>

            <InpersonPartial />
            <TransportationPartial />
            <SchedulePartial />
            <CheckInPartial />
            <WhatToBringPartial />
            <DiscordPartial />
            <HackSubmissionsPartial />
            <TeamsPartial />
            <SocialsPartial />
        </EmailLayout>
    );
};

export default InfoEmail4;
