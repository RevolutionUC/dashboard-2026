import * as React from "react";
import { EmailLayout } from "./components/EmailLayout";
import { EmailHeading } from "./components/EmailHeading";
import { EmailText, EmailLink } from "./components/EmailText";

interface DateChangeProps {
    firstName?: string;
}

export const DateChange: React.FC<DateChangeProps> = ({
    firstName = "Hacker",
}) => {
    return (
        <EmailLayout preview="Important: RevolutionUC Date Change">
            <EmailHeading as="h1">Hey, {firstName}!</EmailHeading>

            <EmailText>
                <strong>Important Update:</strong> We have an update regarding the
                RevolutionUC event date.
            </EmailText>

            <EmailText>
                Please check our website at{" "}
                <EmailLink href="https://revolutionuc.com">revolutionuc.com</EmailLink>{" "}
                for the most up-to-date information about the event schedule.
            </EmailText>

            <EmailText>
                If you have any questions or concerns about the date change, please
                reach out to us at{" "}
                <EmailLink href="mailto:info@revolutionuc.com">
                    info@revolutionuc.com
                </EmailLink>
                .
            </EmailText>

            <EmailText>We apologize for any inconvenience this may cause.</EmailText>
        </EmailLayout>
    );
};

export default DateChange;
