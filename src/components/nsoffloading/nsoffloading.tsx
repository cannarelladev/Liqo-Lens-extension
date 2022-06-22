import { Renderer } from "@k8slens/extensions";
import path from "path";
import React from "react";

export function NSOffloadingIcon(props: Renderer.Component.IconProps) {
  return (
    <Renderer.Component.Icon
      {...props}
      material="leak_add"
      tooltip={path.basename(__filename)}
    />
  );
}

export const NSOffloadingPage: React.FC<{ extension: Renderer.LensExtension }> = (
  props
) => {
  return <></>;
};
