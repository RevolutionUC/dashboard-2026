import * as React from "react";
import { EmailHeading } from "../EmailHeading";
import { EmailText, EmailLink } from "../EmailText";

export const InpersonPartial: React.FC = () => {
    return (
        <>
            <EmailHeading as="h3">In-person at the 1819 Innovation Hub</EmailHeading>
            <EmailText>
                This year, we will be hosting the entire hackathon in-person at the{" "}
                <EmailLink href="https://innovation.uc.edu">
                    1819 Innovation Hub
                </EmailLink>
                ! The 1819 Innovation Hub is located at 2900 Reading Rd, Cincinnati, OH
                45206. It is a fantastic facility with many beautiful classrooms and
                collaborative work spaces. Visit their website at{" "}
                <EmailLink href="https://innovation.uc.edu">innovation.uc.edu</EmailLink>{" "}
                to learn more about our amazing venue this year!
            </EmailText>
        </>
    );
};

export default InpersonPartial;
