import * as React from "react";
import { EmailLayout } from "./components/EmailLayout";
import { EmailHeading } from "./components/EmailHeading";
import { EmailText, EmailLink } from "./components/EmailText";
import {
    InpersonPartial,
    CheckInPartial,
    TransportationPartial,
    ParkingPartial,
    SchedulePartial,
    FoodPartial,
    WhatToBringPartial,
    AvailableSoftwarePartial,
    HackSubmissionsPartial,
    WaiverPartial,
    SocialsPartial,
} from "./components/partials";

interface InfoEmail3Props {
    firstName?: string;
}

export const InfoEmail3: React.FC<InfoEmail3Props> = ({
    firstName = "Hacker",
}) => {
    return (
        <EmailLayout preview="RevolutionUC is this weekend!">
            <EmailHeading as="h1">Hey, {firstName}!</EmailHeading>

            <EmailText>
                We're excited to see you at RevolutionUC this weekend! Here's some
                important information:
            </EmailText>

            <InpersonPartial />
            <CheckInPartial />
            <TransportationPartial />
            <ParkingPartial />
            <SchedulePartial />
            <FoodPartial />
            <WhatToBringPartial />
            <AvailableSoftwarePartial />
            <HackSubmissionsPartial />
            <WaiverPartial />
            <SocialsPartial />

            <EmailText>
                <strong>What if I can no longer go to RevolutionUC?</strong>
                <br />
                Please send us an email at{" "}
                <EmailLink href="mailto:info@revolutionuc.com">
                    info@revolutionuc.com
                </EmailLink>
            </EmailText>
        </EmailLayout>
    );
};

export default InfoEmail3;
