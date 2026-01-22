import * as React from "react";
import { EmailHeading } from "../EmailHeading";
import { EmailText } from "../EmailText";

export const CheckInPartial: React.FC = () => {
    return (
        <>
            <EmailHeading as="h3">Checking In</EmailHeading>
            <EmailText>
                Check-in will be on the first floor of the 1819 Innovation Hub building
                (2900 Reading Rd, Cincinnati, OH 45206). If you're unsure where to go,
                we will have signs posted in the main lobby to help direct you to our
                check-in stations.
            </EmailText>
        </>
    );
};

export default CheckInPartial;
