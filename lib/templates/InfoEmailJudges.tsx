import * as React from "react";
import { EmailLayout } from "./components/EmailLayout";
import { EmailHeading } from "./components/EmailHeading";
import { EmailText, EmailLink } from "./components/EmailText";

interface InfoEmailJudgesProps {
    firstName?: string;
}

export const InfoEmailJudges: React.FC<InfoEmailJudgesProps> = ({
    firstName = "Judge",
}) => {
    return (
        <EmailLayout preview="RevolutionUC Judge Information">
            <EmailHeading as="h1">Hey, {firstName}!</EmailHeading>

            <EmailText>
                Thank you for volunteering to be a judge at RevolutionUC! Your expertise
                and feedback will be invaluable to our hackers. Here's what you need to
                know:
            </EmailText>

            <EmailHeading as="h3">Event Details</EmailHeading>
            <EmailText>
                RevolutionUC will be held in March 2026 at the 1819 Innovation Hub (2900
                Reading Rd, Cincinnati, OH 45206). Judging will take place on Sunday
                starting around 12:00 PM.
            </EmailText>

            <EmailHeading as="h3">Judging Process</EmailHeading>
            <EmailText>
                You'll be assigned to judge a set of projects. Each team will have a few
                minutes to present their hack, followed by a brief Q&A. You'll score
                each project based on criteria like innovation, technical complexity,
                design, and usefulness.
            </EmailText>

            <EmailHeading as="h3">What to Expect</EmailHeading>
            <EmailText>
                Teams have been working for 24 hours, so expect to see a wide range of
                projects in various states of completion. We encourage you to provide
                constructive feedback to help hackers learn and grow!
            </EmailText>

            <EmailHeading as="h3">Parking</EmailHeading>
            <EmailText>
                The 1819 Innovation Hub has a parking lot with plentiful spaces, and it
                is completely free on the weekends.
            </EmailText>

            <EmailText>
                If you have any questions, please reach out to us at{" "}
                <EmailLink href="mailto:info@revolutionuc.com">
                    info@revolutionuc.com
                </EmailLink>
                .
            </EmailText>

            <EmailText>We look forward to seeing you at RevolutionUC!</EmailText>
        </EmailLayout>
    );
};

export default InfoEmailJudges;
