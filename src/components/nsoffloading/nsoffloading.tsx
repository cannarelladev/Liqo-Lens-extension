import { Renderer } from "@k8slens/extensions";
import path from "path";
import React from "react";
import {
  NamespaceOffloading,
  NamespaceOffloadingStore,
  nsOffloadingStore
} from "../../api/nsoffloading";

enum sortBy {
  name = "name",
  namespace = "namespace",
  offloadingPhase = "offloadingPhase",
  podOffloadingStartegy = "podOffloadingStrategy",
}

export function NSOffloadingIcon(props: Renderer.Component.IconProps) {
  return (
    <Renderer.Component.Icon
      {...props}
      material="leak_add"
      tooltip={path.basename(__filename)}
    />
  );
}

export const NSOffloadingPage: React.FC<{
  extension: Renderer.LensExtension;
}> = (props) => {
  return (
    <Renderer.Component.TabLayout>
      <Renderer.Component.KubeObjectListLayout
        className="Certicates"
        store={nsOffloadingStore}
        sortingCallbacks={{
          [sortBy.name]: (nsoffloading: NamespaceOffloading) => nsoffloading.getName(),
          [sortBy.namespace]: (nsoffloading: NamespaceOffloading) =>
            nsoffloading.metadata.namespace,
          [sortBy.offloadingPhase]: (nsoffloading: NamespaceOffloading) => nsoffloading.status.offloadingPhase,
          [sortBy.podOffloadingStartegy]: (nsoffloading: NamespaceOffloading) =>
            nsoffloading.spec.podOffloadingStrategy,
        }}
        searchFilters={[
          (nsoffloading: NamespaceOffloading) => nsoffloading.getSearchFields(),
        ]}
        renderHeaderTitle="NamespaceOffloadings"
        renderTableHeader={[
          { title: "Name", className: "name", sortBy: sortBy.name },
          {
            title: "Namespace",
            className: "namespace",
            sortBy: sortBy.namespace,
          },
          { title: "Offloading Phase", className: "offloadingPhase", sortBy: sortBy.offloadingPhase },
          { title: "Pod Offloading Strategy", className: "podOffloadingStrategy", sortBy: sortBy.podOffloadingStartegy },
        ]}
        renderTableContents={(nsoffloading: NamespaceOffloading) => [
          nsoffloading.getName(),
          nsoffloading.metadata.namespace,
          nsoffloading.status.offloadingPhase,
          nsoffloading.spec.podOffloadingStrategy,
        ]}
      />
    </Renderer.Component.TabLayout>
  );
};


