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
import { Icon } from "@material-ui/core";
import "../../css/main.css";

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
  const [command, setCommand] = React.useState("");

  return (
    <div className="flex gaps align-flex-start">
      <Grid container spacing={2}>
        <Grid item xs={6}>
          <Card className="liqo-box">
            <CardHeader
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
                    onChange={(e) => setCommand(e.target.value)}
                  />
                </Grid>
                <Grid item xs={2}>
                  <Button
                    variant="contained"
                    color="primary"
                    size="large"
                    fullWidth
                    endIcon={<Renderer.Component.Icon material="cable" />}
                    style={{ fontSize: "12pt", marginBottom: "2rem" }}
                  >
                    PEER
                  </Button>
                  <Button
                    variant="contained"
                    color="inherit"
                    size="large"
                    fullWidth
                    style={{ fontSize: "12pt" }}
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
                    defaultValue={"Prova"}
                    InputProps={{
                      className: "liqo-input",
                    }}
                    InputLabelProps={{
                      className: "liqo-input-labels",
                    }}
                    variant="outlined"
                    color="secondary"
                    className="liqo-primary"
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
                  >
                    GENERATE
                  </Button>
                  <Button
                    variant="contained"
                    color="inherit"
                    size="large"
                    fullWidth
                    style={{ fontSize: "12pt" }}
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
                {/* <Renderer.Component.KubeObjectListLayout
                  className="Certicates"
                  store={certificatesStore}
                  sortingCallbacks={{
                    [sortBy.name]: (certificate: Certificate) =>
                      certificate.getName(),
                    [sortBy.namespace]: (certificate: Certificate) =>
                      certificate.metadata.namespace,
                    [sortBy.issuer]: (certificate: Certificate) =>
                      certificate.spec.issuerRef.name,
                  }}
                  searchFilters={[
                    (certificate: Certificate) => certificate.getSearchFields(),
                  ]}
                  renderHeaderTitle="Certificates"
                  renderTableHeader={[
                    { title: "Name", className: "name", sortBy: sortBy.name },
                    {
                      title: "Namespace",
                      className: "namespace",
                      sortBy: sortBy.namespace,
                    },
                    {
                      title: "Issuer",
                      className: "issuer",
                      sortBy: sortBy.namespace,
                    },
                  ]}
                  renderTableContents={(certificate: Certificate) => [
                    certificate.getName(),
                    certificate.metadata.namespace,
                    certificate.spec.issuerRef.name,
                  ]}
                /> */}
              </Renderer.Component.TabLayout>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </div>
  );
};
