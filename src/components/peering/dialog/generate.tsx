import { Renderer } from "@k8slens/extensions";
import { Grid, TextField } from "@material-ui/core";
import React, { Dispatch, FC, SetStateAction } from "react";
import { getPeeringParameters } from "../../../api/api";

const { Dialog } = Renderer.Component;

type GenerateCommandDialogInterface = {
  isOpen: boolean;
  setIsOpen: Dispatch<SetStateAction<boolean>>;
};

export const GenerateCommandDialog: FC<GenerateCommandDialogInterface> = (
  props
) => {
  const { isOpen, setIsOpen } = props;

  const [generateCommand, setGenerateCommand] = React.useState("");
  const [generateCommandLIQOCTL, setGenerateCommandLIQOCTL] =
    React.useState("");

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

  return (
    <Dialog
      //className="AddTenantDialog"
      modal
      isOpen={isOpen}
      onOpen={generate}
      close={() => setIsOpen(false)}
    >
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
            //defaultValue={preview}
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
  );
};
