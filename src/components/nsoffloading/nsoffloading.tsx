import { Renderer } from "@k8slens/extensions";
import { Namespace } from "@k8slens/extensions/dist/src/common/k8s-api/endpoints";
import { type } from "os";
import path from "path";
import React, { useState } from "react";
import {
  NamespaceOffloading,
  NamespaceOffloadingStore,
  nsOffloadingStore,
} from "../../api/nsoffloading";
import {
  Card,
  CardContent,
  Grid,
  TextareaAutosize,
  TextField,
  CardHeader,
  Button,
} from "@material-ui/core";
import { NewNSO } from "./dialog/new_nso";

const { KubeObjectStore } = Renderer.K8sApi;
const { Table, TableCell, TableRow, TableHead } = Renderer.Component;

const namespaceStore: Renderer.K8sApi.NamespaceStore =
  Renderer.K8sApi.apiManager.getStore(
    Renderer.K8sApi.namespacesApi
  ) as Renderer.K8sApi.NamespaceStore;

enum offloadingSortBy {
  name = "name",
  namespace = "namespace",
  offloadingPhase = "offloadingPhase",
  podOffloadingStartegy = "podOffloadingStrategy",
}

enum nsSortBy {
  name = "name",
  status = "status",
  created = "created",
  //podOffloadingStartegy = "podOffloadingStrategy",
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
}> = (props) => {
  const [showNewNSDialog, setShowNewNSDialog] = useState(false);
  //console.log("test", namespaceStore.contextNamespaces);

  //namespaceStore.patch()

  const obj = namespaceStore.items.map((ns) => {
    const nsOff = nsOffloadingStore.getAllByNs(ns.getName());
    if (nsOff.length > 0) {
      return Object.assign(ns, {
        spec: { offloading: nsOff[0] },
      }) as customNamespace;
    } else {
      return Object.assign(ns, {
        spec: { offloading: null },
      }) as customNamespace;
    }
  });

  const cols = (cn: customNamespace) => {
    return (
      <>
        <TableCell>{cn.getName()}</TableCell>
        <TableCell>{cn.getStatus()}</TableCell>
        <TableCell>{cn.getAge(true, true, false)}</TableCell>
        <TableCell>{cn.spec.offloading?.getName() ?? "None"}</TableCell>
      </>
    );
  };

  const rows = (cn: customNamespace) => {
    return <TableRow key={cn.getName()}>{cols(cn)}</TableRow>;
  };

  {
    /* <TableHead sticky={true}>
  {this.columns.map(col => <TableCell key={col.title} className={col.className} sortBy={col.id}>{col.title}</TableCell>)}
</TableHead>); */
  }

  return (
    <>
      {/* {namespaceStore.items.map((ns) => ns.getName())[0]} */}
      {/* <Table items={obj} selectable renderRow={rows}>
        <TableHead>
          <TableCell key={1}></TableCell>Prova
        </TableHead>
      </Table> */}
      {/* <Renderer.Component.KubeObjectListLayout
        className="table-ns"
        store={namespaceStore}
        sortingCallbacks={{
          [nsSortBy.name]: (ns: customNamespace) => ns.getName(),
          [nsSortBy.status]: (ns: customNamespace) => ns.getStatus(),
          [nsSortBy.created]: (ns: customNamespace) => ns.getAge(),
        }}
        searchFilters={[(ns: customNamespace) => ns.getSearchFields()]}
        renderHeaderTitle="Namespaces"
        renderTableHeader={[
          { title: "Name", className: "name", sortBy: nsSortBy.name },
          { title: "Status", className: "status", sortBy: nsSortBy.status },
          {
            title: "Created",
            className: "created",
            sortBy: nsSortBy.created,
          },
        ]}
        renderTableContents={(ns: customNamespace) => [
          ns.getName(),
          ns.getStatus(),
          ns.getAge(true, true, false),
        ]}
      /> */}
      <Renderer.Component.KubeObjectListLayout
        className="table-nsOff"
        store={nsOffloadingStore}
        sortingCallbacks={{
          [offloadingSortBy.namespace]: (nsoffloading: NamespaceOffloading) =>
            nsoffloading.metadata.namespace,
          [offloadingSortBy.podOffloadingStartegy]: (
            nsoffloading: NamespaceOffloading
          ) => nsoffloading.spec.podOffloadingStrategy,
          [offloadingSortBy.offloadingPhase]: (
            nsoffloading: NamespaceOffloading
          ) => nsoffloading.status?.offloadingPhase ?? "Not Ready",
        }}
        searchFilters={[
          (nsoffloading: NamespaceOffloading) => nsoffloading.getSearchFields(),
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
            title: "Offloading Phase",
            className: "offloadingPhase",
            sortBy: offloadingSortBy.offloadingPhase,
          },
        ]}
        renderTableContents={(nsoffloading: NamespaceOffloading) => [
          nsoffloading.metadata.namespace,
          nsoffloading.spec.podOffloadingStrategy,
          nsoffloading.status?.offloadingPhase ?? "Not Ready",
        ]}
        addRemoveButtons={{
          addTooltip: "Add new NamespaceOffloading",
          onAdd: () => setShowNewNSDialog(true),
        }}
      />
      <NewNSO isOpen={showNewNSDialog} setIsOpen={setShowNewNSDialog} />
    </>
  );
};
