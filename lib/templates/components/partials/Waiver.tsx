import * as React from "react";
import { EmailHeading } from "../EmailHeading";
import { EmailText, EmailLink } from "../EmailText";

export const WaiverPartial: React.FC = () => {
    return (
        <>
            <EmailHeading as="h3">Waiver</EmailHeading>
            <EmailText>
                If you're over 18, you can review the event waiver you agreed to{" "}
                <EmailLink href="https://revolutionuc.com/waiver">here</EmailLink>. If
                you're under 18, you should have received an email with additional
                instructions. If you haven't, please reach out to{" "}
                <EmailLink href="mailto:info@revolutionuc.com">
                    info@revolutionuc.com
                </EmailLink>{" "}
                immediately!
            </EmailText>
        </>
    );
};

export default WaiverPartial;
