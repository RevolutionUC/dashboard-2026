import * as React from "react";
import { EmailHeading } from "../EmailHeading";
import { EmailText, EmailLink } from "../EmailText";

export const TravelReimbursementPartial: React.FC = () => {
    return (
        <>
            <EmailHeading as="h3">Travel Reimbursement</EmailHeading>
            <EmailText>
                We offer limited travel reimbursement for hackers traveling from outside
                the Cincinnati area. Please keep all receipts and reach out to{" "}
                <EmailLink href="mailto:info@revolutionuc.com">
                    info@revolutionuc.com
                </EmailLink>{" "}
                for more information on eligibility and the reimbursement process.
            </EmailText>
        </>
    );
};

export default TravelReimbursementPartial;
