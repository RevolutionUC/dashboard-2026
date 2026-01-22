import * as React from "react";
import { EmailLayout } from "./components/EmailLayout";
import { EmailHeading } from "./components/EmailHeading";
import { EmailText, EmailLink } from "./components/EmailText";
import { EmailButton } from "./components/EmailButton";
import {
    SchedulePartial,
    ParkingPartial,
    FoodPartial,
    DiscordPartial,
    SocialsPartial,
    TravelReimbursementPartial,
} from "./components/partials";

interface ConfirmAttendanceFollowUpProps {
    firstName?: string;
}

export const ConfirmAttendanceFollowUp: React.FC<
    ConfirmAttendanceFollowUpProps
> = ({ firstName = "Hacker" }) => {
    return (
        <EmailLayout preview="Thanks for confirming your attendance for RevolutionUC!">
            <EmailHeading as="h2">Hi, {firstName}!</EmailHeading>

            <EmailText>
                Thanks for confirming your attendance for RevolutionUC! Here's what you
                need to know.
            </EmailText>

            <EmailHeading as="h3">Checking In</EmailHeading>
            <EmailText>
                Check-in will be open from <strong>10:00 AM to 12:00 PM in March</strong>
                . If you need to check in late, please email us in advance, and we will
                hold your spot!
            </EmailText>
            <EmailText>
                Check-in will be on the first floor of the 1819 Innovation Hub building
                (2900 Reading Rd, Cincinnati, OH 45206). If you're unsure where to go,
                we will have signs posted in the main lobby to help direct you to our
                check-in stations.
            </EmailText>

            <EmailText>
                <strong>What to Bring</strong>
                <br />
                Please bring a valid school ID for check-in, your laptop, phone, or
                anything else you want to hack on, any chargers for your device(s), and
                a positive attitude! Please bring your own water bottles as well! We
                also recommend bringing basic toiletries (toothbrush, deodorant, etc), a
                pillow/blanket (if you choose to nap). Please note that Ethernet access
                will be limited, <em>so plan to use a Wi-Fi connection.</em>
            </EmailText>

            <EmailText>
                <strong>Teams and Hacking</strong>
                <br />
                The maximum team size is four. Don't have a team? No worries! We'll have
                a team building session after the opening ceremony. Note: you can bring
                an idea to the hackathon, but all hacking on your project must be done
                at the hackathon.
            </EmailText>

            <SchedulePartial />
            <ParkingPartial />
            <FoodPartial />
            <TravelReimbursementPartial />
            <DiscordPartial />
            <SocialsPartial />

            <EmailText>
                <strong>What if I can no longer go to RevolutionUC?</strong>
                <br />
                Please send us an email at{" "}
                <EmailLink href="mailto:info@revolutionuc.com">
                    info@revolutionuc.com
                </EmailLink>{" "}
                ASAP so we can give your spot to a hacker on the waitlist.
            </EmailText>

            <EmailText>
                <strong>We can't wait to see you there!</strong>
                <br />
                Get excited!
            </EmailText>

            <EmailText>
                If you're over 18, you can review the event waiver you agreed to{" "}
                <EmailLink href="https://revolutionuc.com/waiver">here</EmailLink>.
            </EmailText>
        </EmailLayout>
    );
};

export default ConfirmAttendanceFollowUp;
