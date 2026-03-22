import * as React from "react";
import { render } from "@react-email/render";

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

// Auto-discover all template files in this directory.
// Any .tsx file that exports `meta` and a default component is registered automatically.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const ctx = (require as any).context("./", false, /\.tsx$/);

export const emailTemplates: EmailTemplateMeta[] = (ctx.keys() as string[])
    .map((key: string) => {
        const mod = ctx(key) as TemplateModule;
        if (!mod.meta || !mod.default) return null;
        return { ...mod.meta, component: mod.default };
    })
    .filter((t): t is EmailTemplateMeta => t !== null);

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
