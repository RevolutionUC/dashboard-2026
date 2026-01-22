import * as React from "react";
import { EmailLayout } from "./components/EmailLayout";
import { EmailHeading } from "./components/EmailHeading";
import { EmailText, EmailLink } from "./components/EmailText";
import { EmailButton } from "./components/EmailButton";

export const RegistrationOpen: React.FC = () => {
    return (
        <EmailLayout preview="Registration is now open for RevolutionUC!">
            <EmailHeading as="h1">Registration is Now Open!</EmailHeading>

            <EmailText>
                We're excited to announce that registration for RevolutionUC Spring 2026
                is now open!
            </EmailText>

            <EmailText>
                RevolutionUC is the University of Cincinnati's premier hackathon, where
                students from around the world come together to build, learn, and
                innovate over 24 hours.
            </EmailText>

            <EmailHeading as="h3">Event Details</EmailHeading>
            <EmailText>
                <strong>When:</strong> March 2026
                <br />
                <strong>Where:</strong> 1819 Innovation Hub, 2900 Reading Rd,
                Cincinnati, OH 45206
                <br />
                <strong>Duration:</strong> 24 hours of hacking!
            </EmailText>

            <EmailHeading as="h3">What to Expect</EmailHeading>
            <EmailText>
                • Free food and swag
                <br />
                • Amazing sponsors and workshops
                <br />
                • Prizes for winning hacks
                <br />
                • Networking opportunities
                <br />• A weekend of fun and learning!
            </EmailText>

            <EmailButton href="https://revolutionuc.com/register">
                Register Now
            </EmailButton>

            <EmailText>
                Follow us on social media for updates:{" "}
                <EmailLink href="https://twitter.com/revolution_uc">Twitter</EmailLink>,{" "}
                <EmailLink href="https://instagram.com/revolution.uc">
                    Instagram
                </EmailLink>
                ,{" "}
                <EmailLink href="https://www.tiktok.com/@revolution.uc">
                    TikTok
                </EmailLink>
            </EmailText>

            <EmailText>We can't wait to see you there!</EmailText>
        </EmailLayout>
    );
};

export default RegistrationOpen;
