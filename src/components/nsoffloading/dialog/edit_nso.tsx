import { Renderer } from "@k8slens/extensions";
import { Namespace } from "@k8slens/extensions/dist/src/common/k8s-api/endpoints";
import { JsonApiErrorParsed } from "@k8slens/extensions/dist/src/common/k8s-api/json-api";
import {
  Checkbox,
  FilledInput,
  FormControl,
  FormControlLabel,
  FormGroup,
  FormLabel,
  Radio,
  RadioGroup,
  Select,
} from "@material-ui/core";
import React, {
  Dispatch,
  FC,
  SetStateAction,
  useEffect,
  useState,
} from "react";
import { offloadNamespace } from "../../../api/api";
import { namespaceStore, nodesStore } from "../../../api/core";
import {
  NamespaceOffloading,
  nsOffloadingStore,
} from "../../../api/nsoffloading";

const { Component, K8sApi } = Renderer;
const { MenuItem, Input, Dialog, Wizard, WizardStep, Icon } = Component;
const { apiManager } = K8sApi;

/* const nodeStore: Renderer.K8sApi.NodesApi = Renderer.K8sApi.apiManager.getStore(
  Renderer.K8sApi.nodesApi
) as unknown as Renderer.K8sApi.NodesApi; */

type NewNSOProps = {
  isOpen: boolean;
  setIsOpen: Dispatch<SetStateAction<boolean>>;
  onSuccess?(ns: NamespaceOffloading): void;
  onError?(error: unknown): void;
};

const enum PO_STRATEGY {
  LOCALANDREMOTE = "LocalAndRemote",
  LOCAL = "Local",
  REMOTE = "Remote",
}

type nsStrategy = "DefaultName" | "EnforceSameName";
type podStrategy = "LocalAndRemote" | "Local" | "Remote";
type nsSelection = "select" | "create";
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
  const { isOpen, setIsOpen, onSuccess, onError } = props;
  const [namespace, setNamespace] = useState<string>("");
  const [namespaceMappingStrategy, setNamespaceMappingStrategy] =
    useState<nsStrategy>("DefaultName");
  const [podOffloadingStrategy, setPodOffloadingStrategy] =
    useState<podStrategy>("LocalAndRemote");
  /* const [clusterSelector, setClusterSelector] = useState<clusterSelector>({
    nodeSelectorTerms: [],
  }); */
  const [checkLocal, setCheckLocal] = useState<boolean>(true);
  const [checkRemote, setCheckRemote] = useState<boolean>(true);
  const [radioNamespace, setRadioNamespace] = useState<nsSelection>("select");
  const [newNamespace, setNewNamespace] = useState<string>("");
  const [nodeSelector, setNodeSelector] = useState<string[]>([]);
  const [allNodes, setAllNodes] = useState<string[]>([]);
  const [allNamespaces, setAllNamespaces] = useState<string[]>([]);

  const handleSelector = (selector: string) => {
    nodeSelector.includes(selector)
      ? setNodeSelector((old) => old.filter((id) => id !== selector))
      : setNodeSelector((old) => [...old, selector]);
  };

  const addNSO = async () => {
    // NS successfully created function
    const success = async (ns: Namespace) => {
      console.log(`Namespace ${ns.metadata.name} created`);
      Component.Notifications.ok(`Namespace ${ns.metadata.name} created`);
      offload(ns.metadata.name).then((nso: NamespaceOffloading) => {
        console.log(`Namespace ${nso.metadata.namespace} offloaded`);
        Component.Notifications.ok(
          `Namespace ${nso.metadata.namespace} offloaded`
        );
        handleClose();
      }, failed);
    };

    // Failing function
    const failed = async (err: JsonApiErrorParsed) => {
      console.error(err);
      Component.Notifications.error(err);
    };

    // NS offload wrapper function
    const offload = async (ns: string) => {
      return offloadNamespace(
        nsOffloadingStore,
        ns,
        nodeSelector,
        podOffloadingStrategy,
        namespaceMappingStrategy
      );
    };

    if (radioNamespace === "create") {
      namespaceStore.create({ name: newNamespace }).then(success, failed);
    } else {
      offload(namespace).then((nso: NamespaceOffloading) => {
        console.log(`Namespace ${nso.metadata.namespace} offloaded`);
        Component.Notifications.ok(
          `Namespace ${nso.metadata.namespace} offloaded`
        );
        handleClose();
      }, failed);
    }
  };

  const handleClose = () => {
    setNamespace("");
    setNamespaceMappingStrategy("DefaultName");
    setCheckRemote(true);
    setCheckLocal(true);
    setPodOffloadingStrategy("LocalAndRemote");
    setNodeSelector([]);
    setIsOpen(false);
  };

  const nsRegex = new RegExp(
    "^liqo-tenant-.*$|^local-path-storage$|^liqo$|^liqo-storage$|^kube-system$|^kube-public$|^kube-node-lease$"
  );

  const nsStrategyOptions = [
    { value: "DefaultName", desc: "text (DefaultName)" },
    { value: "EnforceSameName", desc: "text (EnforceSameName)" },
  ];
  const header = <h5>Create Namespace Offloading</h5>;
  const namespaces = (
    namespaceStore
      .getItems()
      .map((n) => n.getName())
      .filter((n) => !nsRegex.test(n)) || []
  ).map((n) => <MenuItem value={n}>{n}</MenuItem>);
  const nodes = allNodes.map((n) => (
    <FormControlLabel
      value="local"
      control={
        <Checkbox
          checked={nodeSelector.includes(n)}
          onChange={() => handleSelector(n)}
          color="primary"
          size="medium"
          classes={{ root: "liqo-nodes-checkbox" }}
        />
      }
      label={n}
      labelPlacement="end"
      classes={{ label: "liqo-checkbox-label" }}
    />
  ));

  useEffect(() => {
    if (checkLocal && checkRemote) {
      setPodOffloadingStrategy("LocalAndRemote");
    } else if (checkLocal && !checkRemote) {
      setPodOffloadingStrategy("Local");
    } else if (!checkLocal && checkRemote) {
      setPodOffloadingStrategy("Remote");
    }
  }, [checkLocal, checkRemote]);

  const refreshStore = async () => {
    await namespaceStore.reloadAll();
    await nodesStore.reloadAll();
  };

  useEffect(() => {
    refreshStore();
    console.log("Refreshed store");
    setAllNodes(
      nodesStore
        .getItems()
        .filter((n) => n.getLabels().includes("liqo.io/type=virtual-node"))
        .map((n) => n.getName())
    );
  }, [isOpen]);

  return (
    <Dialog
      className="AddTenantDialog"
      isOpen={isOpen}
      onOpen={() => refreshStore()}
      close={handleClose}
    >
      <Wizard header={header} done={handleClose}>
        <WizardStep
          contentClass="flex gaps column"
          nextLabel="Create"
          next={addNSO}
          disabledNext={
            (!namespace && radioNamespace === "select") ||
            (!newNamespace && radioNamespace === "create") ||
            (!checkLocal && !checkRemote)
          }
        >
          <FormControl>
            <FormLabel
              color="primary"
              classes={{ root: "liqo-form-label" }}
              focused
            >
              <b>Namespace</b>
            </FormLabel>
            <RadioGroup
              row
              aria-label="position"
              name="position"
              defaultValue="existing"
              value={radioNamespace}
              onChange={({ target }) =>
                setRadioNamespace(target.value as nsSelection)
              }
              classes={{ root: "liqo-radio-formgroup" }}
            >
              <FormControlLabel
                value="select"
                control={<Radio />}
                classes={{ root: "liqo-radio" }}
                label="Select Existing"
              />
              <FormControlLabel
                value="create"
                control={<Radio />}
                classes={{ root: "liqo-radio" }}
                label="Create New"
              />
            </RadioGroup>
            {radioNamespace === "select" && (
              <div className="liqo-select-group">
                <Select
                  style={{ width: "100%" }}
                  margin="dense"
                  variant="filled"
                  classes={{ root: "liqo-select", icon: "liqo-select-icon" }}
                  id="namespace"
                  value={namespace}
                  onChange={({ target }) =>
                    setNamespace(target.value as string)
                  }
                >
                  {namespaces}
                </Select>
              </div>
            )}
            {radioNamespace === "create" && (
              <div className="liqo-create-group">
                <FilledInput
                  autoFocus
                  value={newNamespace}
                  onChange={({ target }) => setNewNamespace(target.value)}
                  style={{ paddingLeft: "0.5rem", width: "100%" }}
                  classes={{ root: "liqo-create", input: "liqo-create-input" }}
                  placeholder="Type a namespace name..."
                  inputProps={{ "aria-label": "Type a namespace name..." }}
                />
                {/* <Button
                  disabled={!newNamespace}
                  size="large"
                  color="primary"
                  variant="contained"
                  endIcon={<Icon material="add_circle" />}
                  style={{ fontSize: "11pt", marginLeft: "0.5rem" }}
                  onClick={createNs}
                >
                  Create
                </Button> */}
                {/* <IconButton>
                  <Icon material="add_circle" />
                </IconButton> */}
              </div>
            )}
          </FormControl>
          <FormControl>
            <FormLabel
              color="primary"
              classes={{ root: "liqo-form-label" }}
              focused
            >
              <b>Namespace Mapping Strategy</b>
              <p className="liqo-description">Description</p>
            </FormLabel>
            <div className="liqo-nsmapping-group">
              <Select
                //isCreatable
                style={{ width: "100%" }}
                margin="dense"
                variant="filled"
                classes={{ root: "liqo-select", icon: "liqo-select-icon" }}
                id="namespace-mapping-strategy"
                value={namespaceMappingStrategy}
                onChange={({ target }) =>
                  setNamespaceMappingStrategy(target.value as nsStrategy)
                }
              >
                {nsStrategyOptions.map((n) => (
                  <MenuItem value={n.value}>{n.desc}</MenuItem>
                ))}
              </Select>
            </div>
          </FormControl>
          <FormControl>
            <FormLabel
              color="primary"
              classes={{ root: "liqo-form-label" }}
              focused
            >
              <b>
                Pod Offloading Strategy
                <span className="liqo-required">
                  {"\t*At least one required"}
                </span>
              </b>
              <p className="liqo-description">Description</p>
            </FormLabel>
            <FormGroup
              aria-label="position"
              row
              classes={{ root: "liqo-formgroup" }}
            >
              <FormControlLabel
                value="local"
                control={
                  <Checkbox
                    checked={checkLocal}
                    onChange={() => setCheckLocal((old) => !old)}
                    color="primary"
                    size="medium"
                    classes={{ root: "liqo-checkbox" }}
                  />
                }
                label="Local"
                labelPlacement="end"
                classes={{ label: "liqo-checkbox-label" }}
              />
              <FormControlLabel
                value="remote"
                control={
                  <Checkbox
                    checked={checkRemote}
                    onChange={() => setCheckRemote((old) => !old)}
                    color="primary"
                    size="medium"
                    classes={{ root: "liqo-checkbox" }}
                  />
                }
                style={{ fontSize: "28pt" }}
                label="Remote"
                labelPlacement="end"
                classes={{ label: "liqo-checkbox-label" }}
              />
            </FormGroup>
          </FormControl>
          {/* <Select
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
          </Select> */}
          <FormControl>
            <FormLabel
              color="primary"
              classes={{ root: "liqo-form-label" }}
              focused
            >
              <b>Cluster selector</b>
              {/* <IconButton onClick={() => refreshNodes()}>
                <Renderer.Component.Icon material="sync" />
              </IconButton> */}
              <p className="liqo-description">Description</p>
            </FormLabel>
            <FormGroup
              aria-label="position"
              row
              classes={{ root: "liqo-nodes-group" }}
            >
              {isOpen && nodes}
            </FormGroup>
          </FormControl>
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
