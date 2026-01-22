import * as React from "react";
import { EmailHeading } from "../EmailHeading";
import { EmailText, EmailLink } from "../EmailText";

export const TransportationPartial: React.FC = () => {
    return (
        <>
            <EmailHeading as="h3">Transportation Information</EmailHeading>
            <EmailText>
                We have arranged for a bus to transport participants to and from the
                venue.
            </EmailText>
            <EmailText>
                The bus will depart from{" "}
                <strong>Lindner College of Business at 9:00 AM on Saturday</strong> and
                will do multiple rounds (back and forth) between{" "}
                <strong>9:00 AM and 1:00 PM</strong>.
            </EmailText>
            <EmailText>
                <strong>
                    On Saturday night, the bus will depart from the 1819 Innovation Hub at
                    9:00 PM
                </strong>{" "}
                back to Lindner College of Business and will do multiple rounds (back
                and forth) until 12:00 AM for any hackers who wish to return to campus.
            </EmailText>
            <EmailText>
                <strong>
                    On Sunday morning, the bus will depart from the Lindner College of
                    Business at 7:00 AM
                </strong>{" "}
                back to the 1819 Innovation Hub and will do multiple rounds until 11:00
                AM.
            </EmailText>
            <EmailText>
                <strong>
                    Once the closing ceremony is finished, the bus will depart from the
                    1819 Innovation Hub
                </strong>{" "}
                back to the Lindner College of Business and will do multiple rounds
                until 5:00 PM.
            </EmailText>
            <EmailText>
                Please be at the pickup location at least 15 minutes before the
                departure time to ensure a prompt departure. The pickup location at
                Lindner College of Business will be at the back entrance, and there will
                be people from our organizing team to indicate the transportation point
                for the hackathon bus.
            </EmailText>
            <EmailText>
                If you miss the bus, or if you prefer to drive to the venue, please note
                that parking is available on-site at the 1819 Innovation Hub.
                Information on shuttle schedules can also be found at{" "}
                <EmailLink href="https://revolutionuc.com/schedule/">
                    revolutionuc.com/schedule
                </EmailLink>
            </EmailText>
        </>
    );
};

export default TransportationPartial;
