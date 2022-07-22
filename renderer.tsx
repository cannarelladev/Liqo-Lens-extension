import { Renderer } from "@k8slens/extensions";
import {
  DashboardIcon,
  NSOffloadingPage,
  NSOffloadingIcon,
  PeeringPage,
  PeeringIcon,
} from "./src/components";
import React from "react";
import { AppPreferenceRegistration } from "@k8slens/extensions/dist/src/extensions/common-api/registrations";

export default class LiqoExtension extends Renderer.LensExtension {

  clusterPages = [
    {
      id: "offloading",
      components: {
        Page: () => <NSOffloadingPage extension={this} />,
      },
    },
    {
      id: "peering",
      components: {
        Page: () => <PeeringPage extension={this} />,
      },
    },
  ];

  clusterPageMenus = [
    {
      id: "dashboard",
      title: "Liqo",
      components: {
        Icon: DashboardIcon,
      },
    },
    {
      parentId: "dashboard",
      target: { pageId: "peering" },
      title: "Peering",
      components: {
        Icon: PeeringIcon,
      },
    },
    {
      parentId: "dashboard",
      target: { pageId: "offloading" },
      title: "Offloading",
      components: {
        Icon: NSOffloadingIcon,
      },
    },
  ];

  /* kubeObjectDetailItems = [
    {
      kind: "Pod",
      apiVersions: ["v1"],
      priority: 10,
      components: {
        Details: (props: Renderer.Component.KubeObjectDetailsProps<Renderer.K8sApi.Pod>) => <ExamplePodDetails {...props} />
      }
    }
  ] */

  async onActivate() {
    console.log("Liqo Dashboard started");
  }
}
