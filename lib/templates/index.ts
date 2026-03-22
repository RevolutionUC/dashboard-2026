import * as React from "react";
import { render } from "@react-email/render";
import * as ConfirmAttendance from "./ConfirmAttendance";
import * as ConfirmAttendanceFollowUp from "./ConfirmAttendanceFollowUp";
import * as CustomEmail from "./CustomEmail";
import * as DateChange from "./DateChange";
import * as GeneralEmail from "./GeneralEmail";
import * as InfoEmail1 from "./InfoEmail1";
import * as InfoEmail2 from "./InfoEmail2";
import * as InfoEmail3 from "./InfoEmail3";
import * as InfoEmail4 from "./InfoEmail4";
import * as InfoEmailCTF from "./InfoEmailCTF";
import * as InfoEmailJudges from "./InfoEmailJudges";
import * as InfoEmailWaitlist from "./InfoEmailWaitlist";
import * as InfoEmailWaitlist2 from "./InfoEmailWaitlist2";
import * as InfoEmailWaitlistPass1 from "./InfoEmailWaitlistPass1";
import * as LatticeResetPassword from "./LatticeResetPassword";
import * as MarketingEmail from "./MarketingEmail";
import * as PostEventEmail from "./PostEventEmail";
import * as PostEventJudgeEmail from "./PostEventJudgeEmail";
import * as PostEventSurveyReminder from "./PostEventSurveyReminder";
import * as RegistrationOpen from "./RegistrationOpen";
import * as SubmissionReminder from "./SubmissionReminder";
import * as VerifyEmail from "./VerifyEmail";
import * as WaiverUpdate from "./WaiverUpdate";
import * as WelcomeEmail from "./WelcomeEmail";

export interface SharedEmailProps {
    firstName?: string;
}

export interface GeneralEmailProps extends SharedEmailProps {
    body?: string;
}

export interface CustomEmailProps {
    subject?: string;
    body?: string;
}

export type EmailTemplateProps =
    | SharedEmailProps
    | GeneralEmailProps
    | CustomEmailProps
    | Record<string, never>;

export interface EmailTemplateMeta {
    id: string;
    name: string;
    subject: string;
    description: string;
    component: React.ComponentType<any>;
    requiredProps?: string[];
}

export interface TemplateMeta {
    id: string;
    name: string;
    subject: string;
    description: string;
    requiredProps?: string[];
}

interface TemplateModule {
    meta?: TemplateMeta;
    default?: React.ComponentType<any>;
}

const modules: TemplateModule[] = [
    ConfirmAttendance, ConfirmAttendanceFollowUp, CustomEmail, DateChange,
    GeneralEmail, InfoEmail1, InfoEmail2, InfoEmail3, InfoEmail4,
    InfoEmailCTF, InfoEmailJudges, InfoEmailWaitlist, InfoEmailWaitlist2,
    InfoEmailWaitlistPass1, LatticeResetPassword, MarketingEmail,
    PostEventEmail, PostEventJudgeEmail, PostEventSurveyReminder,
    RegistrationOpen, SubmissionReminder, VerifyEmail, WaiverUpdate, WelcomeEmail,
];

export const emailTemplates: EmailTemplateMeta[] = modules
    .filter((m): m is Required<TemplateModule> => !!m.meta && !!m.default)
    .map((m) => ({ ...m.meta!, component: m.default! }));

export function getTemplateById(id: string): EmailTemplateMeta | undefined {
    return emailTemplates.find((template) => template.id === id);
}

export function getAllTemplates(): EmailTemplateMeta[] {
    return emailTemplates;
}

export interface RenderEmailProps {
    [key: string]: any;
}

export async function renderTemplateToHtml(
    templateId: string,
    props: RenderEmailProps,
): Promise<string | null> {
    const template = getTemplateById(templateId);
    if (!template) return null;
    const element = React.createElement(template.component, props);
    return await render(element);
}

export async function renderTemplateToText(
    templateId: string,
    props: RenderEmailProps,
): Promise<string | null> {
    const template = getTemplateById(templateId);
    if (!template) return null;
    const element = React.createElement(template.component, props);
    return await render(element, { plainText: true });
}
