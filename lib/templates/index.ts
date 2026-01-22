import * as React from "react";
import { render } from "@react-email/render";

// Import email templates
import { CustomEmail } from "./CustomEmail";
import { WelcomeEmail } from "./WelcomeEmail";
import { VerifyEmail } from "./VerifyEmail";
import { ConfirmAttendance } from "./ConfirmAttendance";
import { ConfirmAttendanceFollowUp } from "./ConfirmAttendanceFollowUp";
import { InfoEmail1 } from "./InfoEmail1";
import { InfoEmail2 } from "./InfoEmail2";
import { InfoEmail3 } from "./InfoEmail3";
import { InfoEmail4 } from "./InfoEmail4";
import { InfoEmailWaitlist } from "./InfoEmailWaitlist";
import { InfoEmailWaitlist2 } from "./InfoEmailWaitlist2";
import { InfoEmailMinors } from "./InfoEmailMinors";
import { InfoEmailCTF } from "./InfoEmailCTF";
import { InfoEmailJudges } from "./InfoEmailJudges";
import { LatticeResetPassword } from "./LatticeResetPassword";
import { PostEventEmail } from "./PostEventEmail";
import { PostEventJudgeEmail } from "./PostEventJudgeEmail";
import { PostEventSurveyReminder } from "./PostEventSurveyReminder";
import { SubmissionReminder } from "./SubmissionReminder";
import { DateChange } from "./DateChange";
import { WaiverUpdate } from "./WaiverUpdate";
import { RegistrationOpen } from "./RegistrationOpen";
import { MarketingEmail } from "./MarketingEmail";
import { GeneralEmail } from "./GeneralEmail";

// Common props interface for templates with firstName
export interface FirstNameProps {
    firstName?: string;
}

// Extended props for specific templates
export interface VerifyEmailProps extends FirstNameProps {
    verificationUrl?: string;
    waitlist?: boolean;
}

export interface ConfirmAttendanceProps extends FirstNameProps {
    yesConfirmationUrl?: string;
    noConfirmationUrl?: string;
    offWaitlist?: boolean;
}

export interface InfoEmail2Props extends FirstNameProps {
    registrantId?: string;
}

export interface LatticeResetPasswordProps extends FirstNameProps {
    resetToken?: string;
}

export interface GeneralEmailProps {
    body?: string;
}

export interface CustomEmailProps {
    name: string;
    subject?: string;
    body?: string;
}

// Union type for all template props
export type EmailTemplateProps =
    | FirstNameProps
    | VerifyEmailProps
    | ConfirmAttendanceProps
    | InfoEmail2Props
    | LatticeResetPasswordProps
    | GeneralEmailProps
    | CustomEmailProps
    | Record<string, never>;

// Template metadata interface
export interface EmailTemplateMeta {
    id: string;
    name: string;
    subject: string;
    description: string;
    component: React.ComponentType<any>;
    requiredProps?: string[];
}

// Template registry
export const emailTemplates: EmailTemplateMeta[] = [
    {
        id: "welcome",
        name: "Welcome Email",
        subject: "Welcome to RevolutionUC!",
        description: "Sent to new registrants after they sign up",
        component: WelcomeEmail,
    },
    {
        id: "verify-email",
        name: "Verify Email",
        subject: "Verify your email for RevolutionUC",
        description: "Sent to verify a registrant's email address",
        component: VerifyEmail,
        requiredProps: ["firstName", "verificationUrl"],
    },
    {
        id: "confirm-attendance",
        name: "Confirm Attendance",
        subject: "Confirm your attendance for RevolutionUC",
        description: "Sent to ask registrants to confirm their attendance",
        component: ConfirmAttendance,
        requiredProps: ["firstName", "yesConfirmationUrl", "noConfirmationUrl"],
    },
    {
        id: "confirm-attendance-follow-up",
        name: "Confirm Attendance Follow Up",
        subject: "Thanks for confirming your attendance!",
        description: "Sent after a registrant confirms their attendance",
        component: ConfirmAttendanceFollowUp,
        requiredProps: ["firstName"],
    },
    {
        id: "info-email-1",
        name: "Info Email 1 (3 weeks out)",
        subject: "RevolutionUC is less than 3 weeks away!",
        description: "First informational email sent 3 weeks before the event",
        component: InfoEmail1,
        requiredProps: ["firstName"],
    },
    {
        id: "info-email-2",
        name: "Info Email 2 (2 weeks out)",
        subject: "RevolutionUC is less than 2 weeks away!",
        description: "Second informational email sent 2 weeks before the event",
        component: InfoEmail2,
        requiredProps: ["firstName"],
    },
    {
        id: "info-email-3",
        name: "Info Email 3 (weekend of)",
        subject: "RevolutionUC is this weekend!",
        description: "Third informational email sent the week of the event",
        component: InfoEmail3,
        requiredProps: ["firstName"],
    },
    {
        id: "info-email-4",
        name: "Info Email 4 (day before)",
        subject: "RevolutionUC starts TOMORROW!",
        description: "Final informational email sent the day before the event",
        component: InfoEmail4,
        requiredProps: ["firstName"],
    },
    {
        id: "info-email-waitlist",
        name: "Waitlist Notification",
        subject: "RevolutionUC Waitlist Information",
        description: "Sent to registrants placed on the waitlist",
        component: InfoEmailWaitlist,
        requiredProps: ["firstName"],
    },
    {
        id: "info-email-waitlist-2",
        name: "Waitlist Follow Up",
        subject: "RevolutionUC Waitlist Update",
        description: "Follow up email for waitlisted registrants",
        component: InfoEmailWaitlist2,
        requiredProps: ["firstName"],
    },
    {
        id: "info-email-minors",
        name: "Minors Information",
        subject: "Important Information for Minors at RevolutionUC",
        description: "Special information for registrants under 18",
        component: InfoEmailMinors,
        requiredProps: ["firstName"],
    },
    {
        id: "info-email-ctf",
        name: "CTF Challenge Info",
        subject: "RevolutionUC CTF Challenge Information",
        description: "Information about the Capture The Flag challenge",
        component: InfoEmailCTF,
        requiredProps: ["firstName"],
    },
    {
        id: "info-email-judges",
        name: "Judge Information",
        subject: "RevolutionUC Judge Information",
        description: "Information for event judges",
        component: InfoEmailJudges,
        requiredProps: ["firstName"],
    },
    {
        id: "lattice-reset-password",
        name: "Lattice Password Reset",
        subject: "Reset your Lattice password",
        description: "Password reset email for Lattice app",
        component: LatticeResetPassword,
        requiredProps: ["firstName", "resetToken"],
    },
    {
        id: "post-event",
        name: "Post Event Email",
        subject: "Thank you for attending RevolutionUC!",
        description: "Thank you email sent after the event",
        component: PostEventEmail,
        requiredProps: ["firstName"],
    },
    {
        id: "post-event-judge",
        name: "Post Event Judge Email",
        subject: "Thank you for judging at RevolutionUC!",
        description: "Thank you email sent to judges after the event",
        component: PostEventJudgeEmail,
        requiredProps: ["firstName"],
    },
    {
        id: "post-event-survey-reminder",
        name: "Survey Reminder",
        subject: "Don't forget to fill out the RevolutionUC survey!",
        description: "Reminder to fill out post-event survey",
        component: PostEventSurveyReminder,
        requiredProps: ["firstName"],
    },
    {
        id: "submission-reminder",
        name: "Submission Reminder",
        subject: "Don't forget to submit your hack!",
        description: "Reminder to submit projects before deadline",
        component: SubmissionReminder,
        requiredProps: ["firstName"],
    },
    {
        id: "date-change",
        name: "Date Change Notice",
        subject: "Important: RevolutionUC Date Change",
        description: "Notification about event date changes",
        component: DateChange,
        requiredProps: ["firstName"],
    },
    {
        id: "waiver-update",
        name: "Waiver Update",
        subject: "RevolutionUC Waiver Update",
        description: "Notification about waiver updates",
        component: WaiverUpdate,
        requiredProps: ["firstName"],
    },
    {
        id: "registration-open",
        name: "Registration Open",
        subject: "Registration is now open for RevolutionUC!",
        description: "Announcement that registration is open",
        component: RegistrationOpen,
    },
    {
        id: "marketing",
        name: "Marketing Email",
        subject: "Join us at RevolutionUC!",
        description: "General marketing/promotional email",
        component: MarketingEmail,
    },
    {
        id: "general",
        name: "General Email",
        subject: "A message from RevolutionUC",
        description: "Generic template for custom content",
        component: GeneralEmail,
    },
    {
        id: "custom",
        name: "Custom Email",
        subject: "",
        description: "A blank template for custom messages",
        component: CustomEmail,
    },
];

// Get template by ID
export function getTemplateById(id: string): EmailTemplateMeta | undefined {
    return emailTemplates.find((template) => template.id === id);
}

// Get all templates
export function getAllTemplates(): EmailTemplateMeta[] {
    return emailTemplates;
}

// Render props - generic type for flexibility
export interface RenderEmailProps {
    [key: string]: any;
}

// Render template to HTML
export async function renderTemplateToHtml(
    templateId: string,
    props: RenderEmailProps,
): Promise<string | null> {
    const template = getTemplateById(templateId);
    if (!template) return null;

    const element = React.createElement(template.component, props);
    return await render(element);
}

// Render template to plain text
export async function renderTemplateToText(
    templateId: string,
    props: RenderEmailProps,
): Promise<string | null> {
    const template = getTemplateById(templateId);
    if (!template) return null;

    const element = React.createElement(template.component, props);
    return await render(element, { plainText: true });
}

// Export all templates individually for direct imports
export {
    CustomEmail,
    WelcomeEmail,
    VerifyEmail,
    ConfirmAttendance,
    ConfirmAttendanceFollowUp,
    InfoEmail1,
    InfoEmail2,
    InfoEmail3,
    InfoEmail4,
    InfoEmailWaitlist,
    InfoEmailWaitlist2,
    InfoEmailMinors,
    InfoEmailCTF,
    InfoEmailJudges,
    LatticeResetPassword,
    PostEventEmail,
    PostEventJudgeEmail,
    PostEventSurveyReminder,
    SubmissionReminder,
    DateChange,
    WaiverUpdate,
    RegistrationOpen,
    MarketingEmail,
    GeneralEmail,
};
