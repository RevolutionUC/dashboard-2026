import type { FC } from "react";
import { Img, Section, Text } from "@react-email/components";
import { EmailLayout, brandColors } from "./components/EmailLayout";
import { EmailHeading } from "./components/EmailHeading";
import { EmailText } from "./components/EmailText";

export const meta = {
    id: "check-in-waitlisted",
    name: "Check-In QR (Waitlisted)",
    subject: "Your RevolutionUC Waitlist Check-In QR Code",
    description: "Send to waitlisted participants with event-day check-in instructions and QR",
    requiredProps: ["qrImageSrc"],
};

interface CheckInWaitlistedProps {
    firstName?: string;
    qrImageSrc?: string;
}

export const CheckInWaitlisted: FC<CheckInWaitlistedProps> = ({
    firstName = "Hacker",
    qrImageSrc,
}) => {
    return (
        <EmailLayout preview="Your waitlist check-in QR code for RevolutionUC">
            <EmailHeading as="h1">Hi, {firstName}!</EmailHeading>

            <EmailText>
                We are so excited to have you participate in RevolutionUC this year.
            </EmailText>

            <Section style={waitlistCallout}>
                <Text style={waitlistBadge}>WAITLIST</Text>
                <Text style={waitlistText}>
                    You are currently on <strong>WAITLIST</strong>.
                </Text>
            </Section>

            <EmailText>
                Since we have an extended capacity this year, there is a high chance
                you can still participate.
            </EmailText>

            <EmailText>
                Waitlisted participants will be checked in at <strong>12:00 PM</strong>,
                but the queue starts earlier.
            </EmailText>

            <EmailText>
                Please use this QR code to check in at the event.
            </EmailText>

            <Section style={qrWrapper}>
                <Text style={qrLabel}>Your Check-In QR Code</Text>
                {qrImageSrc ? (
                    <Img src={qrImageSrc} alt="RevolutionUC waitlist check-in QR code" width="220" height="220" style={qrImage} />
                ) : (
                    <Text style={missingQrText}>
                        We could not load your QR code. Please contact info@revolutionuc.com before the event.
                    </Text>
                )}
            </Section>
        </EmailLayout>
    );
};

const waitlistCallout = {
    backgroundColor: "#FFF2CC",
    border: "1px solid #F79009",
    borderRadius: "12px",
    margin: "20px 0",
    padding: "14px",
    textAlign: "center" as const,
};

const waitlistBadge = {
    backgroundColor: "#D92D20",
    borderRadius: "999px",
    color: "#ffffff",
    display: "inline-block",
    fontSize: "12px",
    fontWeight: "700" as const,
    letterSpacing: "0.08em",
    margin: "0 0 10px",
    padding: "6px 12px",
};

const waitlistText = {
    color: "#7A2E0B",
    fontSize: "16px",
    lineHeight: "24px",
    margin: "0",
};

const qrWrapper = {
    backgroundColor: brandColors.lightBlue,
    border: `1px solid ${brandColors.primaryBlue}`,
    borderRadius: "12px",
    margin: "24px 0",
    padding: "20px",
    textAlign: "center" as const,
};

const qrLabel = {
    color: brandColors.darkNavy,
    fontSize: "16px",
    fontWeight: "700" as const,
    margin: "0 0 12px",
};

const qrImage = {
    margin: "0 auto",
    borderRadius: "8px",
    backgroundColor: "#ffffff",
    padding: "8px",
};

const missingQrText = {
    color: "#B42318",
    fontSize: "14px",
    lineHeight: "22px",
    margin: "0",
};

export default CheckInWaitlisted;
