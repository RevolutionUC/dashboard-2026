import * as React from "react";
import { EmailHeading } from "../EmailHeading";
import { EmailText, EmailLink } from "../EmailText";

export const SocialsPartial: React.FC = () => {
    return (
        <>
            <EmailHeading as="h3">Socials</EmailHeading>
            <EmailText>
                Follow RevolutionUC on{" "}
                <EmailLink href="https://twitter.com/revolution_uc">Twitter</EmailLink>{" "}
                and follow revolution.uc on{" "}
                <EmailLink href="https://www.tiktok.com/@revolution.uc">
                    TikTok
                </EmailLink>
                ! Don't forget to like our posts on{" "}
                <EmailLink href="https://www.instagram.com/revolution.uc/">
                    Instagram
                </EmailLink>
                !
            </EmailText>
        </>
    );
};

export default SocialsPartial;
