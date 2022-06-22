import { Renderer } from "@k8slens/extensions";
import path from "path";
import React from "react";

export function BrokerIcon(props: Renderer.Component.IconProps) {
  return (
    <Renderer.Component.Icon
      {...props}
      material="public"
      tooltip={path.basename(__filename)}
    />
  );
}

export const BrokerPage: React.FC<{ extension: Renderer.LensExtension }> = (
  props
) => {
  return <></>;
};
