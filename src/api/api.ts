import { NamespaceOffloading, NamespaceOffloadingSpec } from './nsoffloading';
import { ForeignCluster, ForeignClusterSpec } from './foreigncluster';
import { Renderer } from '@k8slens/extensions';

// Refer to https://api-docs.k8slens.dev/master/extensions/api/classes/Renderer.K8sApi.KubeObjectStore/ for the Kubernetes object store API

/** If the namespace is not offloaded, this returns `null`. Otherwise, it returns an object with the following properties:
 *  - `offloadingPhase`, that can be one of "Ready" (i.e. remote Namespaces have been correctly created
                  on previously selected clusters.) "NoClusterSelected" (i.e. no cluster
                  matches user constraints.) "InProgress" (i.e. remote Namespaces''
                  creation is still ongoing.) "SomeFailed" (i.e. there was an error
                  during creation of some remote Namespaces.) "AllFailed" (i.e. there
                  was an error during creation of all remote Namespaces.) "Terminating"
                  (i.e. remote namespaces are undergoing graceful termination.)
    - `remoteNamespaceName`, the name of the namespace on the remote cluster
 */
/* function getOffloadingStatus(nsOffloadingStore: Renderer.K8sApi.KubeObjectStore<NamespaceOffloading>, namespace: string): NamespaceOffloadingStatus | null {
    const offloading = nsOffloadingStore.getByName("offloading", namespace);
    return offloading?.status;
} */

/** Offloads a namespace on the selected clusters (default: all of them) and returns the created NamespaceOffloading */
function offloadNamespace(nsOffloadingStore: Renderer.K8sApi.KubeObjectStore<NamespaceOffloading>, namespace: string, ownClusterId: string, clusters: string[] = [], podOffloadingStartegy: string): Promise<NamespaceOffloading> {
    const matchExpressions = [
        { key: "liqo.io/remote-cluster-id", operator: "NotIn", values: [ownClusterId] }
    ];
    if (clusters.length != 0)
        matchExpressions.push({ key: "liqo.io/remote-cluster-id", operator: "In", values: clusters });

    const offloadingSpec: NamespaceOffloadingSpec = {
        namespaceMappingStrategy: "DefaultName",
        podOffloadingStrategy:    podOffloadingStartegy,
        clusterSelector: {
            nodeSelectorTerms: [
                {
                    matchExpressions: matchExpressions
                }
            ],
        },
    }
    return nsOffloadingStore.create({name: "offloading", namespace: namespace}, { spec: offloadingSpec });
}

/* function editNamespaceOffloading(nsOffloadingStore: Renderer.K8sApi.KubeObjectStore<NamespaceOffloading>, namespace: string, ownClusterId: string, clusters: string[] = [], podOffloadingStartegy: string): Promise<NamespaceOffloading> {
    const matchExpressions = [
        { key: "liqo.io/remote-cluster-id", operator: "NotIn", values: [ownClusterId] }
    ];
    if (clusters.length != 0)
        matchExpressions.push({ key: "liqo.io/remote-cluster-id", operator: "In", values: clusters });

    const offloadingSpec: NamespaceOffloadingSpec = {
        namespaceMappingStrategy: "DefaultName",
        PodOffloadingStrategy:    podOffloadingStartegy,
        clusterSelector: {
            nodeSelectorTerms: [
                {
                    matchExpressions: matchExpressions
                }
            ],
        },
    }
    return nsOffloadingStore.create({name: "offloading", namespace: namespace}, { spec: offloadingSpec });
} */

/** Peers with the cluster with the given auth URL and token */
export async function peerWithCluster(fcStore: Renderer.K8sApi.KubeObjectStore<ForeignCluster>, clusterName: string, clusterID: string, authUrl: string, token: string): Promise<ForeignCluster> {
    try {
        await Renderer.K8sApi.secretsApi.create({name: "remote-token-" + clusterID, namespace: "liqo"}, {
            metadata: {
                labels: {
                "discovery.liqo.io/cluster-id": clusterID,
                }
            },
            spec: {
                data: {
                token: atob(token),
                }
            },
        });
    } catch (e) {
        // The secret may already exist if we peered with this cluster in the past.
        // If that is the issue, ignore it - otherwise, rethrow the exception
        if (e?.error?.reason != "AlreadyExists")
            throw e;
        console.warn("Peering secret already exists:", e);
    }

    const fc = fcStore.getItems().find(fc => fc.spec.clusterIdentity.clusterID === clusterID);
    if (fc) {
        console.warn("Foreign cluster already exists:", fc);
        const patch = {outgoingPeeringEnabled: "Yes"};
        const newSpec: ForeignClusterSpec = Object.assign(fc.spec, patch);
        const newFc: ForeignCluster = Object.assign(fc, {spec: newSpec});
        return fcStore.update(fc, newFc);
    } else {
        const fcSpec: ForeignClusterSpec = {
            clusterIdentity: {
                clusterID: clusterID,
                clusterName: clusterName,
            },
            foreignAuthUrl: authUrl,
            outgoingPeeringEnabled: "Yes",
            incomingPeeringEnabled: "Auto",
            insecureSkipTLSVerify: true,
            networkingEnabled: "Yes",
        };
        return await fcStore.create({name: clusterName}, { spec: fcSpec });
    }
}

/** Enables or disables outgoing peering with the given cluster */
export async function toggleOutgoingPeering(fcStore: Renderer.K8sApi.KubeObjectStore<ForeignCluster>, clusterID: string, enabled: boolean): Promise<ForeignCluster> {
    const fc = fcStore.getItems().find(fc => fc.spec.clusterIdentity.clusterID === clusterID);
    if (!fc)
        throw new Error("No cluster found");
    const patch = {outgoingPeeringEnabled: enabled ? "Yes" : "No"};
    const newSpec: ForeignClusterSpec = Object.assign(fc.spec, patch);
    const newFc: ForeignCluster = Object.assign(fc, {spec: newSpec});
    return fcStore.update(fc, newFc);    
}

export async function getPeeringParameters() {
    const tokenSecret = await Renderer.K8sApi.secretsApi.get({name: "auth-token", namespace: "liqo"});
    if (!tokenSecret) { throw new Error("No auth token secret found"); }
    const token = atob(tokenSecret.data["token"]);
    
    const clusterIdentityCm = await Renderer.K8sApi.configMapApi.get({name: "liqo-clusterid-configmap", namespace: "liqo"});
    if (!clusterIdentityCm) { throw new Error("No auth token secret found"); }
    const clusterID = clusterIdentityCm.data["CLUSTER_ID"];
    const clusterName = clusterIdentityCm.data["CLUSTER_NAME"];
    
    const authNodeList = (await Renderer.K8sApi.nodesApi.list())
    if (!authNodeList) { throw new Error("No auth node found"); }
    const authNode = authNodeList.find(node => node.metadata.labels && !(node.metadata.labels["liqo.io/type"] == "virtual-node"));
    if (!authNode) { throw new Error("No auth node found"); }
    const authIP = authNode.status.addresses ? authNode.status.addresses[0].address : "";
    const authSvc = await Renderer.K8sApi.serviceApi.get({name: "liqo-auth", namespace: "liqo"});
    if (!authSvc) { throw new Error("No auth service found"); }
    if (authSvc.spec.type != "NodePort") throw new Error("Unsupported service type");
    const authPort = authSvc.spec.ports[0].nodePort
    const authURL = `https://${authIP}${authPort == 443 ? "" : (":" + authPort)}`;
    
    return {token, clusterID, clusterName, authURL};
}