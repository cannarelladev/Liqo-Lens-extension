import { Renderer } from "@k8slens/extensions";
import { Input } from "@k8slens/extensions/dist/src/renderer/components/input";
import path from "path";
import React, { useEffect } from "react";
import {
  Card,
  CardContent,
  Grid,
  TextareaAutosize,
  TextField,
  CardHeader,
  Button,
} from "@material-ui/core";
import { getPeeringParameters, peerWithCluster } from "../../api/api";
import { Icon } from "@material-ui/core";
import "../../css/main.css";
import { ForeignCluster, foreignClusterStore } from "../../api/foreigncluster";

enum fcSortBy {
  clusterName = "clusterName",
  incomingPeering = "incomingPeering",
  outcomingPeering = "outcomingPeering",
  networking = "networking",
  authentication = "authentication",
}

export function PeeringIcon(props: Renderer.Component.IconProps) {
  return (
    <Renderer.Component.Icon
      {...props}
      material="cable"
      tooltip={path.basename(__filename)}
    />
  );
}

export const PeeringPage: React.FC<{ extension: Renderer.LensExtension }> = (
  props
) => {
  const [insertCommand, setInsertCommand] = React.useState("");
  const [generateCommand, setGenerateCommand] = React.useState("");
  const [generateCommandLIQOCTL, setGenerateCommandLIQOCTL] =
    React.useState("");

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
      fc.status.peeringConditions.find((pc) => pc.type === "IncomingPeering")
        ?.status ?? "None"
    );
  };

  const getOutcomingValue = (fc: ForeignCluster) => {
    return (
      fc.status.peeringConditions.find((pc) => pc.type === "OutgoingPeering")
        ?.status ?? "None"
    );
  };

  const getNetworkingValue = (fc: ForeignCluster) => {
    return (
      fc.status.peeringConditions.find((pc) => pc.type === "NetworkStatus")
        ?.status ?? "None"
    );
  };

  const getAuthenticationValue = (fc: ForeignCluster) => {
    return (
      fc.status.peeringConditions.find(
        (pc) => pc.type === "AuthenticationStatus"
      )?.status ?? "None"
    );
  };

  useEffect(() => {
    generate();
  }, []);

  return (
    <>
      <div
        className="flex gaps align-flex-start"
        style={{ paddingBottom: "2rem" }}
      >
        <div className="col-6" style={{ paddingRight: "0.5rem" }}>
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
