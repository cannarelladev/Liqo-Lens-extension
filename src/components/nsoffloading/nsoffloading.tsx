import { Renderer } from "@k8slens/extensions";
import { Namespace } from "@k8slens/extensions/dist/src/common/k8s-api/endpoints";
import { Grid, Typography } from "@material-ui/core";
import path from "path";
import React, { useState } from "react";
import { NamespaceOffloading, nsOffloadingStore } from "../../api/nsoffloading";
import { NewNSO } from "./dialog/new_nso";

const { KubeObjectStore } = Renderer.K8sApi;
const { Table, TableCell, TableRow, TableHead } = Renderer.Component;

const namespaceStore: Renderer.K8sApi.NamespaceStore =
  Renderer.K8sApi.apiManager.getStore(
    Renderer.K8sApi.namespacesApi
  ) as Renderer.K8sApi.NamespaceStore;

enum offloadingSortBy {
  namespace = "namespace",
  offloadingPhase = "offloadingPhase",
  namespaceMappingStrategy = "namespaceMappingStrategy",
  podOffloadingStartegy = "podOffloadingStrategy",
}

export function NSOffloadingIcon(props: Renderer.Component.IconProps) {
  return (
    <Renderer.Component.Icon
      {...props}
      material="sync_alt"
      tooltip={path.basename(__filename)}
    />
  );
}

interface customNamespace extends Namespace {
  spec: { offloading: NamespaceOffloading };
}

export const NSOffloadingPage: React.FC<{
  extension: Renderer.LensExtension;
}> = () => {
  const [showNewNSDialog, setShowNewNSDialog] = useState(false);

  return (
    <>
      <div
        className="flex gaps align-flex-start"
        style={{ paddingBottom: "2rem" }}
      >
        <div className="liqo-toolbar" style={{ width: "100%" }}>
          <div className="title">
            <Typography
              variant="h2"
              noWrap
              component="a"
              href="/"
              style={{
                fontWeight: 700,
                color: "inherit",
                textDecoration: "none",
              }}
            >
              Namespace Offloadings
            </Typography>
          </div>
          <div className="subtitle">
            <Typography
              variant="h5"
              noWrap
              component="a"
              href="/"
              style={{
                color: "inherit",
                textDecoration: "none",
              }}
            >
              Lorem ipsum dolor sit amet, consectetur adipiscing elit.
            </Typography>
          </div>
        </div>
      </div>
      <div className="flex gaps align-flex-start">
        <Grid item xs={12}>
          <Renderer.Component.KubeObjectListLayout
            className="table-nsOff"
            store={nsOffloadingStore}
            sortingCallbacks={{
              [offloadingSortBy.namespace]: (
                nsoffloading: NamespaceOffloading
              ) => nsoffloading.metadata.namespace,
              [offloadingSortBy.podOffloadingStartegy]: (
                nsoffloading: NamespaceOffloading
              ) => nsoffloading.spec.podOffloadingStrategy,
              [offloadingSortBy.namespaceMappingStrategy]: (
                nsoffloading: NamespaceOffloading
              ) => nsoffloading.spec.namespaceMappingStrategy,
              [offloadingSortBy.offloadingPhase]: (
                nsoffloading: NamespaceOffloading
              ) => nsoffloading.status?.offloadingPhase ?? "Not Ready",
            }}
            searchFilters={[
              (nsoffloading: NamespaceOffloading) =>
                nsoffloading.getSearchFields(),
            ]}
            renderHeaderTitle="Namespace Offloadings"
            renderTableHeader={[
              {
                title: "Namespace",
                className: "namespace",
                sortBy: offloadingSortBy.namespace,
              },
              {
                title: "Pod Offloading Strategy",
                className: "podOffloadingStrategy",
                sortBy: offloadingSortBy.podOffloadingStartegy,
              },
              {
                title: "Namespace Mapping Strategy",
                className: "namespaceMappingStrategy",
                sortBy: offloadingSortBy.namespaceMappingStrategy,
              },
              {
                title: "Offloading Phase",
                className: "offloadingPhase",
                sortBy: offloadingSortBy.offloadingPhase,
              },
            ]}
            renderTableContents={(nsoffloading: NamespaceOffloading) => [
              nsoffloading.metadata.namespace,
              nsoffloading.spec.podOffloadingStrategy,
              nsoffloading.spec.namespaceMappingStrategy,
              nsoffloading.status?.offloadingPhase ?? "Not Ready",
            ]}
            addRemoveButtons={{
              addTooltip: "Add new NamespaceOffloading",
              onAdd: () => setShowNewNSDialog(true),
            }}
          />
        </Grid>
      </div>
      <NewNSO isOpen={showNewNSDialog} setIsOpen={setShowNewNSDialog} />
    </>
  );
};
