import React, { useEffect } from "react";
import { FeedbackButton } from "pushfeedback-react";
import { JSX, defineCustomElements } from "pushfeedback/loader";
import { StyleReactProps } from "pushfeedback-react/dist/types/react-component-lib/interfaces";
import "pushfeedback/dist/pushfeedback/pushfeedback.css";

const DynamicFeedbackButtonComponent = (
  props: React.JSX.IntrinsicAttributes &
    JSX.FeedbackButton &
    Omit<React.HTMLAttributes<HTMLFeedbackButtonElement>, "style"> &
    StyleReactProps &
    React.RefAttributes<HTMLFeedbackButtonElement>
) => {
  useEffect(() => {
    defineCustomElements(window);
  }, []);

  return <FeedbackButton {...props} />;
};

export default DynamicFeedbackButtonComponent;
