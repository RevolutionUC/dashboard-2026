import * as React from "react";
import { EmailHeading } from "./EmailHeading";
import { EmailLayout } from "./EmailLayout";
import { EmailText } from "./EmailText";

interface InfoSection {
  title: string;
  body: React.ReactNode;
}

interface InfoEmailTemplateProps {
  preview: string;
  greeting: React.ReactNode;
  intro: React.ReactNode;
  sections: InfoSection[];
  contact: React.ReactNode;
  closing: React.ReactNode;
}

export function InfoEmailTemplate({
  preview,
  greeting,
  intro,
  sections,
  contact,
  closing,
}: InfoEmailTemplateProps) {
  return (
    <EmailLayout preview={preview}>
      <EmailHeading as="h1">{greeting}</EmailHeading>

      <EmailText>{intro}</EmailText>

      {sections.map((section) => (
        <React.Fragment key={section.title}>
          <EmailHeading as="h3">{section.title}</EmailHeading>
          <EmailText>{section.body}</EmailText>
        </React.Fragment>
      ))}

      <EmailText>{contact}</EmailText>
      <EmailText>{closing}</EmailText>
    </EmailLayout>
  );
}
