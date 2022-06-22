import { Renderer } from "@k8slens/extensions";
import { CoffeeDoodle } from "react-open-doodles";
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
  const doodleStyle = {
    width: "200px",
  };
  return (
    <>
      <Renderer.Component.TabLayout>
        <Renderer.Component.Menu
          open={() => console.log("OpenPage")}
          close={() => console.log("closepage")}
        >
          <Renderer.Component.MenuItem title="Manager" />
        </Renderer.Component.Menu>
      </Renderer.Component.TabLayout>
      <div className="flex column gaps align-flex-start">
        <div style={doodleStyle}>
          <CoffeeDoodle accent="#3d90ce" />
        </div>
        <p>Hello world!!!</p>
        <p>
          File: <i>{__filename}</i>
        </p>
      </div>
    </>
  );
};