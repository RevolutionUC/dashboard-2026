import * as React from "react";
import { EmailHeading } from "../EmailHeading";
import { EmailText } from "../EmailText";

export const ParkingPartial: React.FC = () => {
    return (
        <>
            <EmailHeading as="h3">Parking</EmailHeading>
            <EmailText>
                The 1819 Innovation Hub has a parking lot with plentiful spaces, and it
                is completely free on the weekends. And parking on the street is also
                free.
            </EmailText>
        </>
    );
};

export default ParkingPartial;
