import React, {CSSProperties} from "react";

export interface IView {
  component: () => JSX.Element;
  title: string;
  description: string;
  createdAt: Date;
  // If your component has different coloring, can alter sidebar with this
  sidebarProperties?: CSSProperties;
}