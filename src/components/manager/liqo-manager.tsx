import { Renderer } from "@k8slens/extensions";
import path from "path";
import React from "react";

export function ManagerIcon(props: Renderer.Component.IconProps) {
  return (
    <Renderer.Component.Icon
      {...props}
      material="pie_chart"
      tooltip={path.basename(__filename)}
    />
  );
}

export const ManagerPage: React.FC<{ extension: Renderer.LensExtension }> = (
  props
) => {
  return (
    <>
    </>
  );
};