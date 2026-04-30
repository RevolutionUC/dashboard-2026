import * as React from "react";
import { EmailLink } from "./components/EmailText";
import { InfoEmailTemplate } from "./components/InfoEmailTemplate";

export const infoEmailCTFMeta = {
    id: "info-email-ctf",
    name: "CTF Challenge Info",
    subject: "RevolutionUC CTF Challenge Information",
    description: "Information about the Capture The Flag challenge",
};

interface InfoEmailCTFProps {
    firstName?: string;
}

export const InfoEmailCTF: React.FC<InfoEmailCTFProps> = ({ firstName = "Hacker" }) => {
    return (
        <InfoEmailTemplate
            preview="RevolutionUC CTF Challenge Information"
            greeting={<>Hey, {firstName}!</>}
            intro={(
                <>
                    Get ready for the RevolutionUC Capture The Flag (CTF) challenge! Whether
                    you're attending in-person or participating remotely, the CTF is open to
                    everyone.
                </>
            )}
            sections={[
                {
                    title: "What is CTF?",
                    body: (
                        <>
                            CTF (Capture The Flag) is a cybersecurity competition where participants
                            solve security-related challenges to find hidden "flags." Challenges
                            range from web exploitation, cryptography, reverse engineering, and
                            more!
                        </>
                    ),
                },
                {
                    title: "How to Participate",
                    body: (
                        <>
                            The CTF will be hosted online, so you can participate from anywhere.
                            More details about the platform and challenges will be shared closer to
                            the event.
                        </>
                    ),
                },
                {
                    title: "Prizes",
                    body: (
                        <>
                            Top performers in the CTF will be eligible for prizes! Stay tuned for
                            more details on the prize categories.
                        </>
                    ),
                },
            ]}
            contact={(
                <>
                    If you have any questions about the CTF, feel free to reach out to us at{" "}
                    <EmailLink href="mailto:info@revolutionuc.com">info@revolutionuc.com</EmailLink>.
                </>
            )}
            closing={<>Happy hacking!</>}
        />
    );
};

export default InfoEmailCTF;
