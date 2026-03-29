import type { FC } from "react";
import { Img, Section, Text } from "@react-email/components";
import { EmailLayout, brandColors } from "./components/EmailLayout";
import { EmailHeading } from "./components/EmailHeading";
import { EmailText } from "./components/EmailText";

export const meta = {
    id: "check-in-confirmed",
    name: "Check-In QR (Confirmed)",
    subject: "Your RevolutionUC Check-In QR Code",
    description: "Send to confirmed participants with their required check-in QR code",
    requiredProps: ["qrImageSrc"],
};

interface CheckInConfirmedProps {
    firstName?: string;
    qrImageSrc?: string;
}

export const CheckInConfirmed: FC<CheckInConfirmedProps> = ({
    firstName = "Hacker",
    qrImageSrc,
}) => {
    return (
        <EmailLayout preview="Your check-in QR code for RevolutionUC">
            <EmailHeading as="h1">Hi, {firstName}!</EmailHeading>

            <EmailText>
                We are so excited to have you participate in RevolutionUC this year.
            </EmailText>

            <EmailText>
                This year, we have a new check-in system. Please show this QR code to
                the organizers at check-in so you can be checked in quickly.
            </EmailText>

            <Section style={qrWrapper}>
                <Text style={qrLabel}>Your Check-In QR Code</Text>
                {qrImageSrc ? (
                    <Img src={qrImageSrc} alt="RevolutionUC check-in QR code" width="220" height="220" style={qrImage} />
                ) : (
                    <Text style={missingQrText}>
                        We could not load your QR code. Please contact info@revolutionuc.com before the event.
                    </Text>
                )}
            </Section>

            <EmailText>
                Keep this email accessible on event day so we can scan your QR at the
                entrance.
            </EmailText>
        </EmailLayout>
    );
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

export default CheckInConfirmed;
