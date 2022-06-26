import { Renderer } from "@k8slens/extensions";
import { Input } from "@k8slens/extensions/dist/src/renderer/components/input";
import path from "path";
import React from "react";
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

  const clear = () => {
    setInsertCommand("");
  }

  const generate = async () => {
    try {
      const generatedCommand = await getPeeringParameters()
      setGenerateCommand(JSON.stringify(generatedCommand, null, 2));
    }
    catch (e) {
      console.log(e);
    }
  }

  const peer = async () => {
    try {
      const peerCommand = JSON.parse(insertCommand);
      await peerWithCluster(foreignClusterStore, peerCommand.clusterName, peerCommand.clusterID, peerCommand.authURL, peerCommand.token);
    }
    catch (e) {
      console.log(e);
    }
  }

  const preview =
    "liqoctl peer out-of-band <CLUSTER NAME>\
    \n\t--auth-url <URL:PORT>\
    \n\t--cluster-id <CLUSTER UID>\
    \n\t--auth-token <TOKEN>";

  return (
    <div className="flex gaps align-flex-start">
      <Grid container spacing={2}>
        <Grid item xs={6}>
          <Card className="liqo-box">
            <CardHeader
              titleTypographyProps={{
                className: "liqo-box-title",
              }}
              className="liqo-primary"
              title="Insert Peering command"
            />
            <CardContent>
              <Grid container spacing={2}>
                <Grid item xs={10}>
                  <TextField
                    fullWidth
                    focused
                    multiline
                    minRows={6}
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
                <Grid item xs={2}>
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
                  <Button
                    disabled={insertCommand === ""}
                    variant="contained"
                    color="inherit"
                    size="large"
                    fullWidth
                    style={{ fontSize: "12pt" }}
                    onClick={clear}
                  >
                    CLEAR
                  </Button>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={6}>
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
                <Grid item xs={9}>
                  <TextField
                    fullWidth
                    //focused
                    multiline
                    minRows={6}
                    disabled
                    //label="Command"
                    defaultValue={preview}
                    InputProps={{
                      className: "liqo-input-code",
                    }}
                    InputLabelProps={{
                      className: "liqo-input-labels",
                    }}
                    variant="outlined"
                    color="secondary"
                    className="liqo-primary"
                    value={generateCommand}
                    //onChange={(e) => setCommand(e.target.value)}
                  />
                </Grid>
                <Grid item xs={3}>
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
                    style={{ fontSize: "12pt" }}
                    onClick={() => {
                      navigator.clipboard.writeText(generateCommand);
                    }}
                  >
                    COPY
                  </Button>
                </Grid>
              </Grid>
              {/* <Grid item xs={12}>
                <TextareaAutosize style={{ width: "100%", height: "100%" }} />
              </Grid>
              <Grid item xs={12}>
                <Button
                  variant="contained"
                  color="default"
                  size="large"
                  fullWidth
                >
                  GENERATE
                </Button>
              </Grid> */}
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12}>
          <Card className="liqo-box">
            <CardContent>
              <Renderer.Component.TabLayout>
              </Renderer.Component.TabLayout>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </div>
  );
};
