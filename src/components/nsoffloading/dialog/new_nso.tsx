import { Renderer } from "@k8slens/extensions";
import React, { useEffect } from "react";
import { useState, FC } from "react";

const { Select, MenuItem, Input, Dialog, Wizard, WizardStep } = Renderer.Component;

type NewNSOProps = {
  isOpen: boolean;
  ns: string[];
};

const enum PO_STRATEGY {
  LOCALANDREMOTE = "LocalAndRemote",
  LOCAL = "Local",
  REMOTE = "Remote",
}

export const NewNSO: FC<NewNSOProps> = (props) => {
  const { isOpen, ns } = props;
  const [namespace, setNamespace] = useState<string>("");
  const [offloading, setOffloading] = useState<PO_STRATEGY>(
    PO_STRATEGY.LOCALANDREMOTE
  );

  const reset = () => {
    return null;
  };

  addNSO = async () => {
    const { onSuccess, onError } = this.props;

    try {
      const owner = { kind: ownerKind, name: ownerName };
      const spec = { owner };
      const created = await tenantStore.create({ name }, { spec });

      onSuccess?.(created);
      AddTenantDialog.close();
    } catch (err) {
      Component.Notifications.error((err as JsonApiErrorParsed));
      onError?.(err);
    }
  };

  

  return (
    <Dialog
      {...this.props}
      className="AddTenantDialog"
      isOpen={AddTenantDialog.isOpen}
      onOpen={this.reset}
      close={AddTenantDialog.close}
    >
      <Wizard header={header} done={AddTenantDialog.close}>
        <WizardStep
          contentClass="flex gaps column"
          nextLabel="Create"
          next={this.addTenant}
        >
          <b>Namespace</b>
          <Select
            isCreatable
            value={namespace}
            onChange={({ value }) => setNamespace(value)}
          >
            {ns.map((n) => (
              <MenuItem key={n} value={n}>
                {n}
              </MenuItem>
            ))}
          </Select>
          <b>Pod Offloading Strategy</b>
          <Select
            isCreatable
            value={offloading}
            onChange={({ value }) => setNamespace(value)}
          >
            {.map((n) => (
              <MenuItem key={n} value={n}>
                {n}
              </MenuItem>
            ))}
          </Select>
          <Input
            required
            autoFocus
            value={offloading}
            onChange={(value) => setOffloading(value)}
          />
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
