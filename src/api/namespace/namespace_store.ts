import { NS } from './namespace';
import { Renderer } from '@k8slens/extensions';
import { Namespace } from '@k8slens/extensions/dist/src/common/k8s-api/endpoints';

export class NSApi extends Renderer.K8sApi.KubeApi<NS> {
}

export const nsApi = new NSApi({
  objectConstructor: NS
});

export class NSStore extends Renderer.K8sApi.KubeObjectStore<NS> {
  api = nsApi
}

export const nsStore = new NSStore();
Renderer.K8sApi.apiManager.registerStore(nsStore);