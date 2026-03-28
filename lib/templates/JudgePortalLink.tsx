import * as React from "react";
import { Section } from "@react-email/components";
import { EmailLayout } from "./components/EmailLayout";
import { EmailHeading } from "./components/EmailHeading";
import { EmailText, EmailLink } from "./components/EmailText";
import { EmailButton } from "./components/EmailButton";

export const meta = {
    id: "judge-portal-link",
    name: "Judge Portal Link",
    subject: "Your RevolutionUC Judging Portal",
    description: "Portal link for judges to access scoring",
};

interface JudgePortalLinkProps {
    firstName?: string;
    portalUrl?: string;
}

export const JudgePortalLink: React.FC<JudgePortalLinkProps> = ({
    firstName = "Judge",
    portalUrl = "#",
}) => {
    return (
        <EmailLayout preview="Your RevolutionUC Judge Portal">
            <EmailHeading as="h1">Hi, {firstName}!</EmailHeading>

            <EmailText>
                Thank you for volunteering as a judge at RevolutionUC. Here's your portal
                link to access the judging platform:
            </EmailText>

            <Section style={{ textAlign: "center", margin: "24px 0" }}>
                <EmailButton href={portalUrl} variant="primary">
                    Go to Judge Portal
                </EmailButton>
            </Section>
        </EmailLayout>
    );
};

export default JudgePortalLink;
