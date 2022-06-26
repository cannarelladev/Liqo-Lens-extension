import { NamespaceOffloading } from './nsoffloading';
import { Renderer } from '@k8slens/extensions';

export class NamespaceOffloadingApi extends Renderer.K8sApi.KubeApi<NamespaceOffloading> {
}

export const nsOffloadingApi = new NamespaceOffloadingApi({
  objectConstructor: NamespaceOffloading
});

export class NamespaceOffloadingStore extends Renderer.K8sApi.KubeObjectStore<NamespaceOffloading> {
  api = nsOffloadingApi
}

export const nsOffloadingStore = new NamespaceOffloadingStore();
Renderer.K8sApi.apiManager.registerStore(nsOffloadingStore);