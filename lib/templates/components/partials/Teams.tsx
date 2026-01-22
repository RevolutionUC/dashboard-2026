import * as React from "react";
import { EmailText } from "../EmailText";
import { brandColors } from "../EmailLayout";

export const TeamsPartial: React.FC = () => {
    return (
        <EmailText>
            <strong style={{ color: brandColors.darkNavy }}>Teams</strong>
            <br />
            The maximum team size is four. Don't have a team? No worries! Feel free to
            ask in #general for teams or ideas before the event. We'll also have a
            team building session after the opening ceremony.
        </EmailText>
    );
};

export default TeamsPartial;
