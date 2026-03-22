import * as React from "react";
import { EmailHeading } from "../EmailHeading";
import { EmailText, EmailLink } from "../EmailText";

export const SchedulePartial: React.FC = () => {
    return (
        <>
            <EmailHeading as="h3">Schedule</EmailHeading>
            <EmailText>
                Check-in will open at 10:00 AM and the opening ceremony is set to begin
                at 11:00 AM on March 29th. Join us at the Sponsor Expo from 10:00 AM
                onwards and connect with Fifth Third, MedPace, ICR, AWS, and many others
                for opportunities to get an internship or a co-op! Our workshop sessions
                will begin at 2:00 PM March 29th, bringing you awesome speakers from our
                sponsors. Hacking will end at 12:00 PM on March 30th to begin judging,
                and the final closing ceremony will start at 3:30 PM March 30th. See{" "}
                <EmailLink href="https://revolutionuc.com/schedule/">
                    revolutionuc.com/schedule
                </EmailLink>{" "}
                for full and up-to-date schedule details.
            </EmailText>
        </>
    );
};

export default SchedulePartial;
