import * as React from "react";
import { EmailText } from "../EmailText";
import { brandColors } from "../EmailLayout";

export const WristbandsPartial: React.FC = () => {
    return (
        <EmailText>
            <strong style={{ color: brandColors.darkNavy }}>Wristbands</strong>
            <br />
            Wristbands will be handed out at check-in and are required for meals and
            swag. Once we reach our capacity, we won't be able to give out extra
            wristbands. If you arrive after we've run out of wristbands, you'll still
            be able to participate in hacking, however, unfortunately,{" "}
            <em>we won't be able to offer you meals or swag.</em>
        </EmailText>
    );
};

export default WristbandsPartial;
