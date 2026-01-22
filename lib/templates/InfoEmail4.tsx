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

interface InfoEmail4Props {
    firstName?: string;
}

export const InfoEmail4: React.FC<InfoEmail4Props> = ({
    firstName = "Hacker",
}) => {
    return (
        <EmailLayout preview="RevolutionUC starts TOMORROW!">
            <EmailHeading as="h1">Hey, {firstName}!</EmailHeading>

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
