import React from "react";
import { HelloWidget } from "./HelloWidget";

const nameToWidget = {
  // Hello will be the name we use to reference our widget
  Hello: HelloWidget,
};

export async function widgetTaskHandler(props) {
  const widgetInfo = props.widgetInfo;
  const Widget = nameToWidget[widgetInfo.widgetName];

  switch (props.widgetAction) {
    case "WIDGET_ADDED":
      props.renderWidget(<Widget />);
      break;

    case "WIDGET_UPDATE":
      // Not needed for now
      break;

    case "WIDGET_RESIZED":
      // Not needed for now
      break;

    case "WIDGET_DELETED":
      // Not needed for now
      break;

    case "WIDGET_CLICK":
      // Not needed for now
      break;

    default:
      break;
  }
}
