import { Renderer } from "@k8slens/extensions";
import { Button, Grid, TextField, Typography } from "@material-ui/core";
import path from "path";
import React, { useState } from "react";
import {
  getPeeringParameters,
  peerWithCluster,
  toggleIncomingPeering,
  toggleOutgoingPeering,
} from "../../api/api";
import { ForeignCluster, foreignClusterStore } from "../../api/foreigncluster";
import "../../css/main.css";

const { Dialog, Icon } = Renderer.Component;

enum fcSortBy {
  clusterName = "clusterName",
  incomingPeering = "incomingPeering",
  outcomingPeering = "outcomingPeering",
  networking = "networking",
  authentication = "authentication",
}

export function PeeringIcon(props: Renderer.Component.IconProps) {
  return (
    <Icon {...props} material="cable" tooltip={path.basename(__filename)} />
  );
}

export const PeeringPage: React.FC<{ extension: Renderer.LensExtension }> = (
  props
) => {
  const [insertCommand, setInsertCommand] = useState("");
  const [showGenerateCommandDialog, setShowGenerateCommandDialog] =
    useState(false);
  const [showInsertCommandDialog, setShowInsertCommandDialog] = useState(false);
  const [generateCommand, setGenerateCommand] = useState("");
  const [generateCommandLIQOCTL, setGenerateCommandLIQOCTL] = useState("");

  const clearInsert = () => {
    setInsertCommand("");
  };

  const copy = async () => {
    return await navigator.clipboard.writeText(generateCommand);
  };

  const generate = async () => {
    try {
      const generatedCommand = await getPeeringParameters();
      const liqoctlCommand = `liqoctl peer out-of-band ${generatedCommand.clusterName} --auth-url ${generatedCommand.authURL} --cluster-id ${generatedCommand.clusterID} --auth-token ${generatedCommand.token}`;
      setGenerateCommand(JSON.stringify(generatedCommand, null, 2));
      setGenerateCommandLIQOCTL(liqoctlCommand);
    } catch (e) {
      console.log(e);
    }
  };

  const peer = async () => {
    try {
      const peerCommand = JSON.parse(insertCommand);
      await peerWithCluster(
        foreignClusterStore,
        peerCommand.clusterName,
        peerCommand.clusterID,
        peerCommand.authURL,
        peerCommand.token
      );
    } catch (e) {
      console.log(e);
    }
  };

  const closeGenerate = () => {
    setShowGenerateCommandDialog(false);
  };

  const closeInsert = () => {
    clearInsert();
    setShowInsertCommandDialog(false);
  };

  const preview =
    "liqoctl peer out-of-band <CLUSTER NAME>\
    \n\t--auth-url <URL:PORT>\
    \n\t--cluster-id <CLUSTER UID>\
    \n\t--auth-token <TOKEN>";

  const getIncomingValue = (fc: ForeignCluster) => {
    return (
      fc.status?.peeringConditions?.find((pc) => pc.type === "IncomingPeering")
        ?.status ?? "None"
    );
  };

  const getOutcomingValue = (fc: ForeignCluster) => {
    return (
      fc.status?.peeringConditions?.find((pc) => pc.type === "OutgoingPeering")
        ?.status ?? "None"
    );
  };

  const getNetworkingValue = (fc: ForeignCluster) => {
    return (
      fc.status?.peeringConditions?.find((pc) => pc.type === "NetworkStatus")
        ?.status ?? "None"
    );
  };

  const getAuthenticationValue = (fc: ForeignCluster) => {
    return (
      fc.status?.peeringConditions?.find(
        (pc) => pc.type === "AuthenticationStatus"
      )?.status ?? "None"
    );
  };

  /* useEffect(() => {
    generate();
  }, []); */

  const enabledOutgoing = (fc: ForeignCluster) => {
    return getOutcomingValue(fc) === "Established";
  };

  const enabledIncoming = (fc: ForeignCluster) => {
    return getIncomingValue(fc) === "Established";
  };

  const enabledButtonOut = (fc: ForeignCluster) => {
    return (
      getOutcomingValue(fc) === "None" ||
      getOutcomingValue(fc) === "Established"
    );
  };

  const enabledButtonIn = (fc: ForeignCluster) => {
    return (
      getIncomingValue(fc) === "None" || getIncomingValue(fc) === "Established"
    );
  };

  return (
    <>
      <Dialog
        isOpen={showGenerateCommandDialog}
        onOpen={generate}
        close={closeGenerate}
      >
        <Grid container spacing={2} className="liqo-generate-dialog">
          <Grid item xs={12}>
            <TextField
              style={{ paddingBottom: "2rem" }}
              fullWidth
              //focused
              multiline
              minRows={8}
              disabled
              label="JSON Command"
              //defaultValue={preview}
              InputProps={{
                className: "liqo-input-code",
              }}
              InputLabelProps={{
                className: "liqo-output-labels",
              }}
              onCopy={copy}
              variant="outlined"
              color="secondary"
              className="liqo-primary"
              value={generateCommand}
              //onChange={(e) => setCommand(e.target.value)}
            />
            <TextField
              fullWidth
              //focused
              multiline
              minRows={6}
              disabled
              label="LIQOCTL Command"
              //defaultValue={preview}
              InputProps={{
                className: "liqo-input-code",
              }}
              InputLabelProps={{
                className: "liqo-output-labels2",
              }}
              variant="outlined"
              color="secondary"
              className="liqo-primary"
              value={generateCommandLIQOCTL}
              //onChange={(e) => setCommand(e.target.value)}
            />
          </Grid>
        </Grid>
      </Dialog>
      <Dialog isOpen={showInsertCommandDialog} close={closeInsert}>
        <Grid container spacing={2} className="liqo-generate-dialog">
          <Grid item xs={12}>
            <TextField
              fullWidth
              focused
              multiline
              minRows={10}
              placeholder="Paste here the generated JSON Command by another cluster"
              label="Command"
              InputProps={{
                className: "liqo-input-code",
              }}
              InputLabelProps={{
                className: "liqo-input-labels",
              }}
              variant="outlined"
              className="liqo-primary"
              value={insertCommand}
              onChange={(e) => setInsertCommand(e.target.value)}
            />
          </Grid>
          <Grid item xs={6}>
            <Button
              disabled={insertCommand === ""}
              variant="contained"
              color="primary"
              size="large"
              fullWidth
              endIcon={<Renderer.Component.Icon material="cable" />}
              style={{ fontSize: "12pt" }}
              onClick={peer}
            >
              PEER
            </Button>
          </Grid>
          <Grid item xs={6}>
            <Button
              disabled={insertCommand === ""}
              variant="contained"
              color="default"
              size="large"
              fullWidth
              style={{ fontSize: "12pt" }}
              onClick={clearInsert}
            >
              CLEAR
            </Button>
          </Grid>
        </Grid>
      </Dialog>
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
              Peering tools
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
          <div className="content">
            <div className="col-6" style={{ paddingRight: "1rem" }}>
              <Button
                variant="contained"
                color="secondary"
                size="large"
                fullWidth
                endIcon={<Renderer.Component.Icon material="add_link" />}
                style={{ fontSize: "12pt", width: "300px" }}
                onClick={() => setShowGenerateCommandDialog(true)}
              >
                Show peering commands
              </Button>
            </div>
            <div className="col-6" style={{ paddingRight: "1rem" }}>
              <Button
                variant="contained"
                color="primary"
                size="large"
                fullWidth
                endIcon={<Renderer.Component.Icon material="cable" />}
                style={{ fontSize: "12pt", width: "300px" }}
                onClick={() => setShowInsertCommandDialog(true)}
              >
                Peer with cluster
              </Button>
            </div>
          </div>
        </div>
      </div>
      <div className="flex gaps align-flex-start">
        <Grid item xs={12}>
          <Renderer.Component.KubeObjectListLayout
            className="Certicates"
            store={foreignClusterStore}
            sortingCallbacks={{
              [fcSortBy.clusterName]: (fc: ForeignCluster) =>
                fc.spec.clusterIdentity.clusterName,
              [fcSortBy.outcomingPeering]: (fc: ForeignCluster) =>
                getOutcomingValue(fc),
              [fcSortBy.incomingPeering]: (fc: ForeignCluster) =>
                getIncomingValue(fc),
              [fcSortBy.networking]: (fc: ForeignCluster) =>
                getNetworkingValue(fc),
              [fcSortBy.authentication]: (fc: ForeignCluster) =>
                getAuthenticationValue(fc),
            }}
            searchFilters={[(fc: ForeignCluster) => fc.getSearchFields()]}
            renderHeaderTitle="Foreign Clusters"
            renderTableHeader={[
              {
                title: "Cluster Name",
                className: "clusterName",
                sortBy: fcSortBy.clusterName,
              },
              {
                title: "Outgoing Peering",
                className: "outgoingPeeringEnabled",
                sortBy: fcSortBy.outcomingPeering,
              },
              {
                title: "Incoming Peering",
                className: "incomingPeeringEnabled",
                sortBy: fcSortBy.incomingPeering,
              },
              {
                title: "Networking",
                className: "networkingEnabled",
                sortBy: fcSortBy.networking,
              },
              {
                title: "Authentication",
                className: "insecureSkipTLSVerify",
                sortBy: fcSortBy.authentication,
              },
              {
                title: "Outgoing",
              },
              {
                title: "Incoming",
              },
            ]}
            renderTableContents={(fc: ForeignCluster) => [
              fc.spec.clusterIdentity.clusterName,
              getOutcomingValue(fc),
              getIncomingValue(fc),
              getNetworkingValue(fc),
              getAuthenticationValue(fc),
              <div
                className={`peering-button ${
                  !enabledButtonOut(fc)
                    ? "disabled-button"
                    : enabledOutgoing(fc)
                    ? "error"
                    : "success"
                }`}
                style={{
                  fontWeight: "bold",
                  width: "100px",
                  textAlign: "center",
                  paddingTop: "0.1rem",
                  paddingBottom: "0.1rem",
                  borderRadius: "0.5rem",
                }}
                onClick={(event) => {
                  event.stopPropagation();
                  toggleOutgoingPeering(
                    foreignClusterStore,
                    fc.spec.clusterIdentity.clusterID,
                    !enabledOutgoing(fc)
                  );
                }}
              >
                {!enabledButtonOut(fc)
                  ? "loading".toUpperCase()
                  : enabledOutgoing(fc)
                  ? "Disable".toUpperCase()
                  : "Enable".toUpperCase()}
              </div>,
              <div
                className={`peering-button ${
                  !enabledButtonIn(fc)
                    ? "disabled-button"
                    : enabledIncoming(fc)
                    ? "error"
                    : "success"
                }`}
                style={{
                  fontWeight: "bold",
                  width: "100px",
                  textAlign: "center",
                  paddingTop: "0.1rem",
                  paddingBottom: "0.1rem",
                  borderRadius: "0.5rem",
                }}
                onClick={(event) => {
                  event.stopPropagation();
                  toggleIncomingPeering(
                    foreignClusterStore,
                    fc.spec.clusterIdentity.clusterID,
                    !enabledIncoming(fc)
                  );
                }}
              >
                {!enabledButtonIn(fc)
                  ? "loading".toUpperCase()
                  : enabledIncoming(fc)
                  ? "Disable".toUpperCase()
                  : "Enable".toUpperCase()}
              </div>,
            ]}
          />
        </Grid>
      </div>
    </>
  );
};
