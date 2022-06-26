import { Renderer } from "@k8slens/extensions";
import path from "path";
import React from "react";

export function DashboardIcon(props: Renderer.Component.IconProps) {
  return (
    <Renderer.Component.Icon
      {...props}
      material="space_dashboard"
      tooltip={path.basename(__filename)}
    />
  );
}

export const DashboardPage: React.FC<{ extension: Renderer.LensExtension }> = (
  props
) => {
  return (
    <>
    </>
  );
};
