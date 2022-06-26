import { Renderer } from "@k8slens/extensions";
import React from "react";
import { NamespaceOffloading } from "../../api/nsoffloading/nsoffloading";

const {
  Component: { Badge, DrawerItem },
} = Renderer;

export interface NamespaceOffloadingDetailsProps
  extends Renderer.Component.KubeObjectDetailsProps<NamespaceOffloading> {}

export const NamespaceOffloadingDetails: React.FC<
  NamespaceOffloadingDetailsProps
> = (props) => {
  const { object: nsoffloading } = props;
  return (
    <div className="NamespaceOffloading">
      <DrawerItem name="Created">
        {nsoffloading.getAge(true, false)} ago (
        {nsoffloading.metadata.creationTimestamp})
      </DrawerItem>
      <DrawerItem name="Pod Strategy">
        {nsoffloading.spec.podOffloadingStrategy}
      </DrawerItem>
      <DrawerItem name="NS Strategy">
        {nsoffloading.spec.namespaceMappingStrategy}
      </DrawerItem>
      <DrawerItem name="Offloading Phase">{nsoffloading.status.offloadingPhase}</DrawerItem>
      <DrawerItem name="Status" className="status" labelsOnly>
        {nsoffloading.status.conditions.map((condition, index) => {
          const { type, reason, message, status } = condition;
          const kind = type || reason;
          if (!kind) return null;
          return (
            <Badge
              key={kind + index}
              label={kind}
              className={"success " + kind.toLowerCase()}
              tooltip={message}
            />
          );
        })}
      </DrawerItem>
    </div>
  );
};
