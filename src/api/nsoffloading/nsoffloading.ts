import { Renderer } from "@k8slens/extensions";

export class NamespaceOffloading extends Renderer.K8sApi.KubeObject {
  static kind = "NamespaceOffloading";
  static apiVersion = "offloading.liqo.io/v1alpha1";
  static plural = "namespaceoffloadings";
  static apiBase = `/apis/${this.apiVersion}/${this.plural}`;
  static namespaced = false;

  kind: string
  apiVersion: string
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
  spec: NamespaceOffloadingSpec
  status: {
    offloadingPhase: string
    remoteNamespaceName: string
    conditions: {
      lastTransitionTime: string;
      message: string;
      reason: string;
      status: string;
      type?: string;
    }[];
    acceptedNames: string
    kind: string
    plural: string
    storedVersions: []
  }
}

export type NamespaceOffloadingSpec = {
  clusterSelector: {
    nodeSelectorTerms: {
      matchExpressions: {
        key: string;
        operator: string;
        values: string[];
      }[];
    }[];
  }
  namespaceMappingStrategy: string
  podOffloadingStrategy: string
}