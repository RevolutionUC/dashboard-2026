import * as React from "react";
import { EmailHeading } from "../EmailHeading";
import { EmailText } from "../EmailText";

export const FoodPartial: React.FC = () => {
    return (
        <>
            <EmailHeading as="h3">Food</EmailHeading>
            <EmailText>
                We will be serving lunch, dinner, and a midnight snack on Saturday,
                along with breakfast and lunch on Sunday. Vegetarian and vegan options
                are included in every meal. Various snacks and drinks will be available
                throughout the event.
            </EmailText>
        </>
    );
};

export default FoodPartial;
