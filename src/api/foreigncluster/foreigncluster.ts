import { Renderer } from "@k8slens/extensions";

export class ForeignCluster extends Renderer.K8sApi.KubeObject {
  static kind = "ForeignCluster";
  static apiVersion = "discovery.liqo.io/v1alpha1";
  static plural = "foreignclusters";
  static apiBase = `/apis/${this.apiVersion}/${this.plural}`;
  static namespaced = false;

  apiVersion: string
  kind: string
  metadata: {
    name: string
    namespace: string
    resourceVersion: string
    uid: string
    annotations: {
      [key: string]: string;
    }
    labels: {
      [key: string]: string;
    }
    selfLink: string
    creationTimestamp: string
  }
  spec: ForeignClusterSpec
  status: {
    peeringConditions: {
      lastTransitionTime: string;
      message: string;
      reason: string;
      status: string;
      type?: string;
    }[];
    tenantNamespace: {
      local: string
      remote: string
    }
  }
}

export type ForeignClusterSpec = {
  clusterIdentity: {
    clusterID: string
    clusterName: string
  }
  foreignAuthUrl: string
  incomingPeeringEnabled: string
  insecureSkipTLSVerify: boolean
  networkingEnabled: string
  outgoingPeeringEnabled: string
}