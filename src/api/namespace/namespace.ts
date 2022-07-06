import { Renderer } from "@k8slens/extensions";

export class NS extends Renderer.K8sApi.Namespace {
  static kind = "Namespace";
  static apiVersion = "v1";
  static plural = "namespaces";
  static apiBase = `/api/${this.apiVersion}/${this.plural}`;
  //static namespaced = true;
}


/* KubeObject {
  static kind = "Namespace";
  static apiVersion = "core/v1";
  static plural = "namespaces";
  static apiBase = `/api/v1/${this.plural}`;
  static namespaced = true;

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
  
} */