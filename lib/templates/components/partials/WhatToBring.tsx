import * as React from "react";
import { EmailHeading } from "../EmailHeading";
import { EmailText } from "../EmailText";

export const WhatToBringPartial: React.FC = () => {
    return (
        <>
            <EmailHeading as="h3">What to bring</EmailHeading>
            <EmailText>
                Charge your laptop, grab your water bottle and bring your student ID (or
                other form of identification) for checking in and a positive attitude!
                Please bring your own water bottles! If you have any hardware, feel free
                to use them as part of your hack.
            </EmailText>
        </>
    );
};

export default WhatToBringPartial;
