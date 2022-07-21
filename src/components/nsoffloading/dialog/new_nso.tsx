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
import {
  Select,
  FormControl,
  FormControlLabel,
  FormLabel,
  FormGroup,
  Checkbox,
  Paper,
  IconButton,
  InputBase,
  TextField,
  RadioGroup,
  Radio,
  FilledInput,
  Button,
} from "@material-ui/core";
import SearchIcon from "@material-ui/core/Icon/Icon";
import AddCircleOutlineIcon from "@material-ui/core/Icon/Icon";
import { offloadNamespace } from "../../../api/api";

const { Component, K8sApi } = Renderer;
const { MenuItem, Input, Dialog, Wizard, WizardStep, Icon } = Component;
const { apiManager } = K8sApi;

/* const nodeStore: Renderer.K8sApi.NodesApi = Renderer.K8sApi.apiManager.getStore(
  Renderer.K8sApi.nodesApi
) as unknown as Renderer.K8sApi.NodesApi; */

const nodesStore: Renderer.K8sApi.NodesStore =
  Renderer.K8sApi.apiManager.getStore(
    Renderer.K8sApi.nodesApi
  ) as Renderer.K8sApi.NodesStore;

const namespaceStore: Renderer.K8sApi.NamespaceStore =
  Renderer.K8sApi.apiManager.getStore(
    Renderer.K8sApi.namespacesApi
  ) as Renderer.K8sApi.NamespaceStore;

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

type nsStrategy = "DefaultName" | "Name";
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
  const [clusterSelector, setClusterSelector] = useState<clusterSelector>({
    nodeSelectorTerms: [],
  });
  const [checkLocal, setCheckLocal] = useState<boolean>(true);
  const [checkRemote, setCheckRemote] = useState<boolean>(true);
  const [radioNamespace, setRadioNamespace] = useState<nsSelection>("select");
  const [newNamespace, setNewNamespace] = useState<string>("");
  const [nodeSelector, setNodeSelector] = useState<string[]>([]);
  const name = "offloading";

  const handleSelector = (selector: string) => {
    nodeSelector.includes(selector)
      ? setNodeSelector((old) => old.filter((id) => id !== selector))
      : setNodeSelector((old) => [...old, selector]);
  };

  const addNSO = async () => {
    try {
      /* const matchExpressions = nodeSelector.map((node) =>
        Object.assign(
          {},
          {
            key: "kubernetes.io/hostname",
            operator: "In",
            values: [node],
          }
        )
      );
      const spec = {
        namespaceMappingStrategy,
        podOffloadingStrategy,
        clusterSelector: {
          nodeSelectorTerms: [{ matchExpressions }],
        },
      } as NamespaceOffloadingSpec; */
      const created = await offloadNamespace(
        nsOffloadingStore,
        namespace,
        nodeSelector,
        podOffloadingStrategy,
        namespaceMappingStrategy
      );
      console.log({ created });

      onSuccess?.(created);
      Component.Notifications.ok(`Namespace ${namespace} offloaded`);
      handleClose();
    } catch (err) {
      console.log(err);
      Component.Notifications.error(err as JsonApiErrorParsed);
      onError?.(err);
    }
  };

  const createNs = async () => {
    try {
      if (newNamespace) {
        const created = await namespaceStore.create({ name: newNamespace });
        console.log({ created });
        setNamespace(newNamespace);
      }
    } catch (err) {
      console.error(err);
      Component.Notifications.error(err as JsonApiErrorParsed);
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

  const nsStrategyOptions = ["DefaultName", "EnforceSameName"];
  const namespaces =
    namespaceStore
      .getItems()
      .map((n) => n.getName())
      .filter((n) => !nsRegex.test(n)) || [];

  const header = <h5>Create Namespace Offloading</h5>;
  const nodes = nodesStore.getItems().map((n) => n.getName());

  useEffect(() => {
    if (checkLocal && checkRemote) {
      setPodOffloadingStrategy("LocalAndRemote");
    } else if (checkLocal && !checkRemote) {
      setPodOffloadingStrategy("Local");
    } else if (!checkLocal && checkRemote) {
      setPodOffloadingStrategy("Remote");
    }
  }, [checkLocal, checkRemote]);

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
          disabledNext={!namespace || (!checkLocal && !checkRemote)}
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
                  //isCreatable
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
                  {namespaces?.map((n) => (
                    <MenuItem value={n}>{n}</MenuItem>
                  ))}
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
                <Button
                  disabled={!newNamespace}
                  size="large"
                  color="primary"
                  variant="contained"
                  endIcon={<Icon material="add_circle" />}
                  style={{ fontSize: "11pt", marginLeft: "0.5rem" }}
                  onClick={createNs}
                >
                  Create
                </Button>
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
              <b>
                Pod Offloading Strategy
                <span className="liqo-required">
                  {"\t*At least one required"}
                </span>
              </b>
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
              <b>Namespace Mapping Strategy</b>
            </FormLabel>
            <div className="liqo-select-group">
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
                  <MenuItem value={n}>{n}</MenuItem>
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
              <b>Node selector</b>
            </FormLabel>
            <FormGroup
              aria-label="position"
              row
              classes={{ root: "liqo-nodes-group" }}
            >
              {nodes.map((n) => (
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
              ))}
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
