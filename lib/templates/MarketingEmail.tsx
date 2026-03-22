import * as React from "react";
import { EmailLayout } from "./components/EmailLayout";
import { EmailHeading } from "./components/EmailHeading";
import { EmailText, EmailLink } from "./components/EmailText";
import { EmailButton } from "./components/EmailButton";

export const meta = {
    id: "marketing",
    name: "Marketing Email",
    subject: "Join us at RevolutionUC!",
    description: "General marketing/promotional email",
};

interface MarketingEmailProps {
    firstName?: string;
}

export const MarketingEmail: React.FC<MarketingEmailProps> = ({ firstName = "Hacker" }) => {
    return (
        <EmailLayout preview="Join us at RevolutionUC!">
            <EmailHeading as="h1">Hey, {firstName}!</EmailHeading>
            <EmailHeading as="h2">RevolutionUC is Coming!</EmailHeading>

            <EmailText>
                Are you ready to hack? RevolutionUC, the University of Cincinnati's
                annual hackathon, is back and better than ever!
            </EmailText>

            <EmailText>
                Join hundreds of hackers for 24 hours of coding, creativity, and
                collaboration. Whether you're a seasoned developer or just starting out,
                RevolutionUC is the perfect place to learn, build, and have fun!
            </EmailText>

            <EmailHeading as="h3">Why RevolutionUC?</EmailHeading>
            <EmailText>
                • Learn new technologies through workshops
                <br />
                • Win amazing prizes
                <br />
                • Network with industry professionals
                <br />
                • Free food, swag, and more!
                <br />• Make lifelong friends
            </EmailText>

            <EmailButton href="https://revolutionuc.com">Learn More</EmailButton>

            <EmailText>
                Have questions? Reach out to us at{" "}
                <EmailLink href="mailto:info@revolutionuc.com">
                    info@revolutionuc.com
                </EmailLink>
            </EmailText>
        </EmailLayout>
    );
};

export default MarketingEmail;
