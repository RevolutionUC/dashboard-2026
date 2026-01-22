import * as React from "react";
import { EmailLayout } from "./components/EmailLayout";
import { EmailHeading } from "./components/EmailHeading";
import { EmailText, EmailLink } from "./components/EmailText";
import { EmailButton } from "./components/EmailButton";

interface SubmissionReminderProps {
    firstName?: string;
}

export const SubmissionReminder: React.FC<SubmissionReminderProps> = ({
    firstName = "Hacker",
}) => {
    return (
        <EmailLayout preview="Don't forget to submit your hack!">
            <EmailHeading as="h1">Hey, {firstName}!</EmailHeading>

            <EmailText>
                Hacking ends soon! Don't forget to submit your project to Devpost before
                the deadline.
            </EmailText>

            <EmailText>
                All projects must be submitted to be considered for judging and prizes.
                Make sure your submission includes:
            </EmailText>

            <EmailText>
                • A project description
                <br />
                • What technologies you used
                <br />
                • A demo video or screenshots
                <br />• Link to your code repository (if applicable)
            </EmailText>

            <EmailButton href="https://revuc-x.devpost.com/">
                Submit on Devpost
            </EmailButton>

            <EmailText>
                If you're having trouble with your submission, reach out to a mentor or
                organizer for help. You can also ask in the #help channel on Discord.
            </EmailText>

            <EmailText>Good luck with your final push!</EmailText>
        </EmailLayout>
    );
};

export default SubmissionReminder;
