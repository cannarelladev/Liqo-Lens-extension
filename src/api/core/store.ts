import { Renderer } from "@k8slens/extensions";

const nodesStore: Renderer.K8sApi.NodesStore =
  Renderer.K8sApi.apiManager.getStore(
    Renderer.K8sApi.nodesApi
  ) as Renderer.K8sApi.NodesStore;

const namespaceStore: Renderer.K8sApi.NamespaceStore =
  Renderer.K8sApi.apiManager.getStore(
    Renderer.K8sApi.namespacesApi
  ) as Renderer.K8sApi.NamespaceStore;

export { nodesStore, namespaceStore };
