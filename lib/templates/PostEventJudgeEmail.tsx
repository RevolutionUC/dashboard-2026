import * as React from "react";
import { EmailLayout } from "./components/EmailLayout";
import { EmailHeading } from "./components/EmailHeading";
import { EmailText, EmailLink } from "./components/EmailText";
import { EmailButton } from "./components/EmailButton";

interface PostEventJudgeEmailProps {
    firstName?: string;
}

export const PostEventJudgeEmail: React.FC<PostEventJudgeEmailProps> = ({
    firstName = "Judge",
}) => {
    return (
        <EmailLayout preview="Thank you for judging at RevolutionUC!">
            <EmailHeading as="h1">Hey, {firstName}!</EmailHeading>

            <EmailText>
                Thank you so much for taking the time to judge at RevolutionUC! Your
                expertise and feedback were invaluable to our hackers.
            </EmailText>

            <EmailHeading as="h3">Survey</EmailHeading>
            <EmailText>
                We'd love to hear your feedback on the judging experience. Please take a
                few minutes to fill out our judge feedback survey.
            </EmailText>
            <EmailButton href="https://forms.gle/pXH62rk36R6xQbkJ6">
                Judge Feedback Survey
            </EmailButton>

            <EmailHeading as="h3">Winners</EmailHeading>
            <EmailText>
                All winning hacks from this past weekend can be found on our{" "}
                <EmailLink href="https://revuc-x.devpost.com/">Devpost</EmailLink>!
            </EmailText>

            <EmailHeading as="h3">Thank You!</EmailHeading>
            <EmailText>
                We couldn't have made RevolutionUC such a success without judges like
                you. Your time and expertise helped make this event memorable for all
                our participants.
            </EmailText>

            <EmailText>
                If you're interested in judging at future events or getting more
                involved with ACM@UC, please don't hesitate to reach out!
            </EmailText>

            <EmailText>We hope to see you again next year!</EmailText>
        </EmailLayout>
    );
};

export default PostEventJudgeEmail;
