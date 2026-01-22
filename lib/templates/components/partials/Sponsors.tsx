import * as React from "react";
import { EmailHeading } from "../EmailHeading";
import { EmailText, EmailLink } from "../EmailText";

export const SponsorsPartial: React.FC = () => {
    return (
        <>
            <EmailHeading as="h3">Sponsors</EmailHeading>
            <EmailText>
                We've got some great sponsors this year including Fifth Third, Medpace,
                ICR, AWS and more! See{" "}
                <EmailLink href="https://revolutionuc.com/sponsors/">
                    revolutionuc.com/sponsors
                </EmailLink>{" "}
                for the full list of sponsors and partners!
            </EmailText>
        </>
    );
};

export default SponsorsPartial;
