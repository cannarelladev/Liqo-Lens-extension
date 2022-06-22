import { Renderer } from "@k8slens/extensions";
import { CoffeeDoodle } from "react-open-doodles";
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

/* export class DashboardPage extends React.Component<{ extension: Renderer.LensExtension }> {
  render() {
    const doodleStyle = {
      width: "200px"
    }
    return (
      <div className="flex column gaps align-flex-start">
        <div style={doodleStyle}><CoffeeDoodle accent="#3d90ce" /></div>
        <p>Hello world!!!</p>
        <p>File: <i>{__filename}</i></p>
      </div>
    )
  }
} */

export const DashboardPage: React.FC<{ extension: Renderer.LensExtension }> = (
  props
) => {
  const doodleStyle = {
    width: "200px",
  };
  return (
    <>
      <Renderer.Component.Menu
        open={() => null}
        close={() => null}
      ></Renderer.Component.Menu>
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
