import * as React from "react";
import { EmailLayout } from "./components/EmailLayout";
import { EmailHeading } from "./components/EmailHeading";
import { EmailText, EmailLink } from "./components/EmailText";

interface InfoEmailCTFProps {
    firstName?: string;
}

export const InfoEmailCTF: React.FC<InfoEmailCTFProps> = ({
    firstName = "Hacker",
}) => {
    return (
        <EmailLayout preview="RevolutionUC CTF Challenge Information">
            <EmailHeading as="h1">Hey, {firstName}!</EmailHeading>

            <EmailText>
                Get ready for the RevolutionUC Capture The Flag (CTF) challenge! Whether
                you're attending in-person or participating remotely, the CTF is open to
                everyone.
            </EmailText>

            <EmailHeading as="h3">What is CTF?</EmailHeading>
            <EmailText>
                CTF (Capture The Flag) is a cybersecurity competition where participants
                solve security-related challenges to find hidden "flags." Challenges
                range from web exploitation, cryptography, reverse engineering, and
                more!
            </EmailText>

            <EmailHeading as="h3">How to Participate</EmailHeading>
            <EmailText>
                The CTF will be hosted online, so you can participate from anywhere.
                More details about the platform and challenges will be shared closer to
                the event.
            </EmailText>

            <EmailHeading as="h3">Prizes</EmailHeading>
            <EmailText>
                Top performers in the CTF will be eligible for prizes! Stay tuned for
                more details on the prize categories.
            </EmailText>

            <EmailText>
                If you have any questions about the CTF, feel free to reach out to us at{" "}
                <EmailLink href="mailto:info@revolutionuc.com">
                    info@revolutionuc.com
                </EmailLink>
                .
            </EmailText>

            <EmailText>Happy hacking!</EmailText>
        </EmailLayout>
    );
};

export default InfoEmailCTF;
