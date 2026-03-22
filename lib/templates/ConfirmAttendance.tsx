import * as React from "react";
import { Section } from "@react-email/components";
import { EmailLayout } from "./components/EmailLayout";
import { EmailHeading } from "./components/EmailHeading";
import { EmailText, EmailLink } from "./components/EmailText";
import { EmailButton } from "./components/EmailButton";

interface ConfirmAttendanceProps {
    firstName?: string;
    yesConfirmationUrl?: string;
    noConfirmationUrl?: string;
    offWaitlist?: boolean;
}

export const ConfirmAttendance: React.FC<ConfirmAttendanceProps> = ({
    firstName = "Hacker",
    yesConfirmationUrl = "#",
    noConfirmationUrl = "#",
    offWaitlist = false,
}) => {
    return (
        <EmailLayout preview="Confirm your attendance for RevolutionUC">
            <EmailHeading as="h1">Hi, {firstName}!</EmailHeading>

            {offWaitlist ? (
                <EmailText>
                    <strong>You have been moved off the waitlist for RevolutionUC!</strong>{" "}
                    We need you to confirm your attendance for the event (March 2026).
                </EmailText>
            ) : (
                <EmailText>
                    We're excited for RevolutionUC in March 2026 at the 1819 Innovation
                    Hub (2900 Reading Rd, Cincinnati, OH 45206)! Please confirm your
                    in-person attendance:
                </EmailText>
            )}

            <Section style={{ textAlign: "center", margin: "24px 0" }}>
                <EmailButton href={yesConfirmationUrl} variant="primary">
                    Yes - I'm attending RevolutionUC
                </EmailButton>
            </Section>

            <Section style={{ textAlign: "center", margin: "24px 0" }}>
                <EmailButton href={noConfirmationUrl} variant="success">
                    No - I'm not attending RevolutionUC
                </EmailButton>
            </Section>

            <EmailText>
                If you select <strong>Yes</strong>, you'll receive a welcome email with
                event details. Spots are limited, so confirm early to secure your spot
                before we reach capacity. If the event fills up, you'll be placed on the
                waitlist and notified if a spot becomes available. We hope to see you
                there!
            </EmailText>

            <EmailText>
                <strong>Important Check-In Information:</strong> Check-in will be open
                from <strong>10:00 AM to 12:00 PM in March</strong>. After check-in
                ends, we will start admitting attendees from the waitlist in order of
                who arrived first until we reach maximum capacity. If we reached our
                capacity and you're still on the waitlist, you are still welcomed to
                participate in the hackathon, but we won't be able to guarantee food and
                swags.
            </EmailText>

            <EmailText>
                If you have successfully confirmed your attendance but need to check in
                late, please email us in advance, and we will hold your spot!
            </EmailText>

            <EmailText>
                <strong>Is there a confirmation deadline?</strong>
                <br />
                Yes. The confirmation deadline is March 2026.
            </EmailText>

            <EmailText>
                <strong>What if I confirm my attendance now and later can't attend?</strong>
                <br />
                Please send us an email at{" "}
                <EmailLink href="mailto:info@revolutionuc.com">
                    info@revolutionuc.com
                </EmailLink>{" "}
                to release your spot.
            </EmailText>

            <EmailText>
                <strong>What if I later find out I can attend?</strong>
                <br />
                Please email us as soon as you find out you can attend at{" "}
                <EmailLink href="mailto:info@revolutionuc.com">
                    info@revolutionuc.com
                </EmailLink>
                . We'll do our best to find space for you, but please understand that we
                may have to place you on a waitlist.
            </EmailText>

            <EmailText>
                <strong>
                    What if I show up to the event without confirming my attendance?
                </strong>
                <br />
                We will place you on a waitlist. Once the opening ceremony is over, we
                will verify our capacity and move people from the waitlist in order of
                who arrived first. If we reach our capacity and you're still on the
                waitlist, you can still participate, just note that we won't be able to
                provide you with meals or swag.
            </EmailText>

            <EmailText>
                <strong>I accidentally selected No!</strong>
                <br />
                Please email us at{" "}
                <EmailLink href="mailto:info@revolutionuc.com">
                    info@revolutionuc.com
                </EmailLink>{" "}
                and we'll update your registration.
            </EmailText>

            <EmailText>
                If you're over 18, you can review the event waiver you agreed to{" "}
                <EmailLink href="https://revolutionuc.com/waiver">here</EmailLink>.
            </EmailText>
        </EmailLayout>
    );
};

export default ConfirmAttendance;
