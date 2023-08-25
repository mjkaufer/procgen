import React from "react";

export interface IView {
  component: () => JSX.Element;
  title: string;
  description: string;
  createdAt: Date;
}