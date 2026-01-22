import * as React from "react";
import { EmailLayout } from "./components/EmailLayout";
import { EmailHeading } from "./components/EmailHeading";
import { EmailText } from "./components/EmailText";
import { EmailButton } from "./components/EmailButton";

interface PostEventSurveyReminderProps {
    firstName?: string;
}

export const PostEventSurveyReminder: React.FC<
    PostEventSurveyReminderProps
> = ({ firstName = "Hacker" }) => {
    return (
        <EmailLayout preview="Don't forget to fill out the RevolutionUC survey!">
            <EmailHeading as="h1">Hey, {firstName}!</EmailHeading>

            <EmailText>
                We hope you had an amazing time at RevolutionUC! We noticed you haven't
                filled out our post-event survey yet.
            </EmailText>

            <EmailText>
                Your feedback is incredibly valuable to us and helps us improve the
                hackathon experience for future participants. It only takes a few
                minutes!
            </EmailText>

            <EmailButton href="https://forms.gle/pXH62rk36R6xQbkJ6">
                Take the Survey
            </EmailButton>

            <EmailText>
                Thank you for being part of RevolutionUC, and we hope to see you again
                next year!
            </EmailText>
        </EmailLayout>
    );
};

export default PostEventSurveyReminder;
