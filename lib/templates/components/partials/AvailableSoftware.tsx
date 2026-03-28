import * as React from "react";
import { EmailHeading } from "../EmailHeading";
import { EmailText, EmailLink } from "../EmailText";

export const AvailableSoftwarePartial: React.FC = () => {
    return (
        <>
            <EmailHeading as="h3">Available Software</EmailHeading>
            <EmailText>
                Software includes $25 in Google Cloud credit, access to the Github
                Student Developer Pack, a three-month complimentary license to Matlab,
                and more as part of the MLH software lab! More details will be available
                at the event. Take a look at all of the available MLH software here:{" "}
                <EmailLink href="https://hack.mlh.io/software/">
                    https://hack.mlh.io/software/
                </EmailLink>
            </EmailText>
            <EmailText>
                You can also find additional resources such as free courses, project
                ideas, starter kits, and MOOC platforms on our website's Resources page:{" "}
                <EmailLink href="https://revolutionuc.com/resources/">
                    https://revolutionuc.com/resources/
                </EmailLink>
            </EmailText>
        </>
    );
};

export default AvailableSoftwarePartial;
