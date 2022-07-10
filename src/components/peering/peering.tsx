import { Renderer } from "@k8slens/extensions";
import { Input } from "@k8slens/extensions/dist/src/renderer/components/input";
import path from "path";
import React, { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  Grid,
  TextareaAutosize,
  TextField,
  CardHeader,
  Button,
  AppBar,
  Toolbar,
  Container,
  Typography,
} from "@material-ui/core";
import { getPeeringParameters, peerWithCluster } from "../../api/api";
import { Icon as IconMUI } from "@material-ui/core";
import "../../css/main.css";
import { ForeignCluster, foreignClusterStore } from "../../api/foreigncluster";

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

  const clearGenerate = () => {
    setGenerateCommand("");
    setGenerateCommandLIQOCTL("");
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

  return (
    <>
      <Dialog
        isOpen={showGenerateCommandDialog}
        onOpen={generate}
        close={() => setShowGenerateCommandDialog(false)}
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
      <Dialog
        isOpen={showInsertCommandDialog}
        onOpen={generate}
        close={() => setShowInsertCommandDialog(false)}
      >
        <Grid container spacing={2} className="liqo-generate-dialog">
          <Grid item xs={12}>
            <TextField
              fullWidth
              focused
              multiline
              minRows={10}
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
        {/*                 <Grid item xs={3}>
                  <Button
                    variant="contained"
                    color="secondary"
                    size="large"
                    fullWidth
                    endIcon={<Renderer.Component.Icon material="add_link" />}
                    style={{ fontSize: "12pt", marginBottom: "2rem" }}
                    onClick={generate}
                  >
                    GENERATE
                  </Button>
                  <Button
                    disabled={generateCommand === ""}
                    variant="contained"
                    color="inherit"
                    size="large"
                    fullWidth
                    style={{ fontSize: "12pt", marginBottom: "2rem" }}
                    onClick={copy}
                  >
                    COPY
                  </Button>
                  <Button
                    disabled={generateCommand === ""}
                    variant="contained"
                    color="inherit"
                    size="large"
                    fullWidth
                    style={{ fontSize: "12pt" }}
                    onClick={clearGenerate}
                  >
                    CLEAR
                  </Button>
                </Grid> */}
        {/* <AdbIcon sx={{ display: { xs: "none", md: "flex" }, mr: 1 }} /> */}

        {/* <div className="col-6" style={{ paddingRight: "0.5rem" }}>
          <Card className="liqo-box">
            <CardHeader
              titleTypographyProps={{
                className: "liqo-box-title",
              }}
              className="liqo-primary h1"
              title="Generate Peering command"
            />
            <CardContent>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField
                    style={{ paddingBottom: "2rem" }}
                    fullWidth
                    //focused
                    multiline
                    minRows={8}
                    disabled
                    label="JSON Command"
                    defaultValue={preview}
                    InputProps={{
                      className: "liqo-input-code",
                    }}
                    InputLabelProps={{
                      className: "liqo-output-labels",
                    }}
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
                    defaultValue={preview}
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
            </CardContent>
          </Card>
        </div>
        <div className="col-6" style={{ paddingLeft: "0.5rem" }}>
          <Card className="liqo-box" style={{ height: "100%" }}>
            <CardHeader
              titleTypographyProps={{
                className: "liqo-box-title",
              }}
              className="liqo-primary"
              title="Insert Peering command (JSON)"
            />
            <CardContent>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    focused
                    multiline
                    minRows={10}
                    label="Command"
                    InputProps={{
                      className: "liqo-input",
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
                <Grid item xs={6} style={{ paddingBottom: "3rem" }}>
                  <Button
                    disabled={insertCommand === ""}
                    variant="contained"
                    color="primary"
                    size="large"
                    fullWidth
                    endIcon={<Renderer.Component.Icon material="cable" />}
                    style={{ fontSize: "12pt", marginBottom: "2rem" }}
                    onClick={peer}
                  >
                    PEER
                  </Button>
                </Grid>
                <Grid item xs={6} style={{ paddingBottom: "3rem" }}>
                  <Button
                    disabled={insertCommand === ""}
                    variant="contained"
                    color="inherit"
                    size="large"
                    fullWidth
                    style={{ fontSize: "12pt" }}
                    onClick={clearInsert}
                  >
                    CLEAR
                  </Button>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </div> */}
      </div>
      <div className="flex gaps align-flex-start">
        <Grid item xs={12}>
          <Renderer.Component.KubeObjectListLayout
            className="Certicates"
            store={foreignClusterStore}
            sortingCallbacks={{
              [fcSortBy.clusterName]: (fc: ForeignCluster) =>
                fc.spec.clusterIdentity.clusterName,
              [fcSortBy.incomingPeering]: (fc: ForeignCluster) =>
                getIncomingValue(fc),
              [fcSortBy.outcomingPeering]: (fc: ForeignCluster) =>
                getOutcomingValue(fc),
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
                title: "Incoming Peering",
                className: "incomingPeeringEnabled",
                sortBy: fcSortBy.incomingPeering,
              },
              {
                title: "Outgoing Peering",
                className: "outgoingPeeringEnabled",
                sortBy: fcSortBy.outcomingPeering,
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
            ]}
            renderTableContents={(fc: ForeignCluster) => [
              fc.spec.clusterIdentity.clusterName,
              getIncomingValue(fc),
              getOutcomingValue(fc),
              getNetworkingValue(fc),
              getAuthenticationValue(fc),
            ]}
          />
        </Grid>
      </div>
    </>
  );
};
