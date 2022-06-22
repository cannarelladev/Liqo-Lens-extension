import { Renderer } from "@k8slens/extensions";
import { ExampleIcon, ExamplePage } from "./src/example-page";
import {
  DashboardPage,
  DashboardIcon,
  ManagerPage,
  ManagerIcon,
  BrokerPage,
  BrokerIcon,
  NSOffloadingPage,
  NSOffloadingIcon,
  PeeringPage,
  PeeringIcon,
} from "./src/components";
import { ExamplePodDetails } from "./src/example-pod-details";
import React from "react";

export default class LiqoExtension extends Renderer.LensExtension {
  clusterPages = [
    {
      id: "manager",
      components: {
        Page: () => <ManagerPage extension={this} />,
      },
    },
    {
      id: "nsoffloading",
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
    {
      id: "broker",
      components: {
        Page: () => <BrokerPage extension={this} />,
      },
    },
  ];

  clusterPageMenus = [
    {
      id: "dashboard",
      title: "Liqo Dashboard",
      components: {
        Icon: DashboardIcon,
      },
    },
    /* {
      parentId: "dashboard",
      target: { pageId: "manager" },
      title: "Manager",
      components: {
        Icon: ManagerIcon,
      },
    }, */
    {
      parentId: "dashboard",
      target: { pageId: "nsoffloading" },
      title: "NSOffloading",
      components: {
        Icon: NSOffloadingIcon,
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
    /* {
      parentId: "dashboard",
      target: { pageId: "broker" },
      title: "Broker",
      components: {
        Icon: BrokerIcon,
      },
    }, */
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
