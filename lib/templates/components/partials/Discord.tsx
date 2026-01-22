import * as React from "react";
import { EmailHeading } from "../EmailHeading";
import { EmailText, EmailLink } from "../EmailText";

export const DiscordPartial: React.FC = () => {
    return (
        <>
            <EmailHeading as="h3">Discord</EmailHeading>
            <EmailText>
                We will be using Discord for all the communication and announcements.
                Join our Discord server at{" "}
                <EmailLink href="https://discord.revolutionuc.com">
                    discord.revolutionuc.com
                </EmailLink>
            </EmailText>
        </>
    );
};

export default DiscordPartial;
