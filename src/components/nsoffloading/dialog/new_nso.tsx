import { Renderer } from "@k8slens/extensions";
import { Namespace } from "@k8slens/extensions/dist/src/common/k8s-api/endpoints";
import { JsonApiErrorParsed } from "@k8slens/extensions/dist/src/common/k8s-api/json-api";
import React, { Dispatch, SetStateAction, useEffect } from "react";
import { SelectOption } from "@k8slens/extensions/dist/src/renderer/components/select";
import { useState, FC } from "react";
import {
  NamespaceOffloading,
  nsOffloadingStore,
  NamespaceOffloadingSpec,
} from "../../../api/nsoffloading";
import { Select } from "@material-ui/core";

const { Component, K8sApi } = Renderer;
const { MenuItem, Input, Dialog, Wizard, WizardStep } = Component;
const { apiManager } = K8sApi;

const nodeStore: Renderer.K8sApi.NodesApi = Renderer.K8sApi.apiManager.getStore(
  Renderer.K8sApi.nodesApi
) as unknown as Renderer.K8sApi.NodesApi;

type NewNSOProps = {
  isOpen: boolean;
  setIsOpen: Dispatch<SetStateAction<boolean>>;
  ns: Namespace[];
  onSuccess?(ns: NamespaceOffloading): void;
  onError?(error: unknown): void;
};

const enum PO_STRATEGY {
  LOCALANDREMOTE = "LocalAndRemote",
  LOCAL = "Local",
  REMOTE = "Remote",
}

type nsStrategy = "DefaultName" | "Name";
type podStrategy = "LocalAndRemote" | "Local" | "Remote";
type clusterSelector = {
  nodeSelectorTerms: {
    matchExpressions: {
      key: string;
      operator: string;
      values: string[];
    }[];
  }[];
};

export const NewNSO: FC<NewNSOProps> = (props) => {
  const { isOpen, ns, setIsOpen, onSuccess, onError } = props;
  const [namespace, setNamespace] = useState<string>("");
  //const [name, setName] = useState<string>("");
  //const [ownerName, setOwnerName] = useState<string>("offloading");
  const [namespaceMappingStrategy, setNamespaceMappingStrategy] =
    useState<nsStrategy>("DefaultName");
  const [podOffloadingStrategy, setPodOffloadingStrategy] =
    useState<podStrategy>("LocalAndRemote");
  const [clusterSelector, setClusterSelector] = useState<clusterSelector>({
    nodeSelectorTerms: [],
  });
  const name = "offloading";

  /* const reset = () => {
    return null;
  }; */

  const addNSO = async () => {
    try {
      const spec = {
        namespaceMappingStrategy,
        podOffloadingStrategy,
        clusterSelector,
      } as NamespaceOffloadingSpec;
      console.log({ namespace });
      console.log({ spec });
      const created = await nsOffloadingStore.create(
        { name, namespace },
        { spec }
      );
      console.log({ created });

      onSuccess?.(created);
      handleClose();
    } catch (err) {
      console.log(err);
      Component.Notifications.error(err as JsonApiErrorParsed);
      onError?.(err);
    }
  };

  const handleClose = () => {
    setIsOpen(false);
  };

  const nsRegex = new RegExp("^liqo-tenant-.*$|^local-path-storage$|^liqo$|^liqo-storage$|^kube-system$|^kube-public$|^kube-node-lease$");

  const podStrategyOptions = [
    PO_STRATEGY.LOCAL,
    PO_STRATEGY.LOCALANDREMOTE,
    PO_STRATEGY.REMOTE,
  ];
  const nsStrategyOptions = ["DefaultName", "EnforceSameName"];
  const namespaces = ns?.map((n) => n.getName()).filter(n => !nsRegex.test(n)) || [];

  const header = <h5>Create Namespace Offloading</h5>;

  return (
    <Dialog
      className="AddTenantDialog"
      isOpen={isOpen}
      onOpen={() => null}
      close={handleClose}
    >
      <Wizard header={header} done={handleClose}>
        <WizardStep
          contentClass="flex gaps column"
          nextLabel="Create"
          next={addNSO}
        >
          <b>Namespace</b>
          <Select
            //isCreatable
            id="namespace"
            value={namespace}
            onChange={({ target }) => setNamespace(target.value as string)}
          >
            {namespaces?.map((n) => (
              <MenuItem value={n}>{n}</MenuItem>
            ))}
          </Select>
          <b>Pod Offloading Strategy</b>
          <Select
            //isCreatable

            id="pod-offloading-strategy"
            value={podOffloadingStrategy}
            onChange={({ target }) =>
              setPodOffloadingStrategy(target.value as podStrategy)
            }
          >
            {podStrategyOptions.map((n) => (
              <MenuItem value={n}>{n}</MenuItem>
            ))}
          </Select>
          <b>Namespace Mapping Strategy</b>
          <Select
            id="namespace-mapping-strategy"
            value={namespaceMappingStrategy}
            onChange={({ target }) =>
              setNamespaceMappingStrategy(target.value as nsStrategy)
            }
          >
            {nsStrategyOptions.map((n) => (
              <MenuItem value={n}>{n}</MenuItem>
            ))}
          </Select>
          {/* <b>Cluster Selectors</b>
          <Select
            //isCreatable
            value={namespaceMappingStrategy}
            onChange={(value) => setClusterSelector()}
          >
            {nsStrategyOptions.map((n) => (
              <MenuItem key={n} value={n}>
                {n}
              </MenuItem>
            ))}
          </Select> */}
          {/* <b>Owner Kind</b>
          <Select
            required
            options={["User", "Group"]}
            value={this.ownerKind}
            onChange={({ value }) => (this.ownerKind = value)}
          /> */}
        </WizardStep>
      </Wizard>
    </Dialog>
  );
};
