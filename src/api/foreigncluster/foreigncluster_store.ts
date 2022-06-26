import { ForeignCluster } from './foreigncluster';
import { Renderer } from '@k8slens/extensions';

export class ForeignClusterApi extends Renderer.K8sApi.KubeApi<ForeignCluster> {
}

export const foreignClusterApi = new ForeignClusterApi({
  objectConstructor: ForeignCluster
});

export class ForeignClusterStore extends Renderer.K8sApi.KubeObjectStore<ForeignCluster> {
  api = foreignClusterApi
}

export const foreignClusterStore = new ForeignClusterStore();
Renderer.K8sApi.apiManager.registerStore(foreignClusterStore);