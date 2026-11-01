import { createStore } from 'zustand/vanilla';
import { AppError, appError, errorMessage } from '@/lib/api';
import { getSubscription, updateSubscription } from '@/lib/requests/subscriptions';
import { listWorkflowNodes, runWorkflow, saveWorkflowDraft } from '@/lib/requests/workflow';
import type { SubscriptionDetail } from '@/lib/types/subscriptions';
import type { WorkflowNodeCatalog } from '@/lib/types/workflow';
import type { FlowSnapshot, NodeRunState } from '@/lib/workflow/model';
import { validateArrangement } from '@/lib/workflow/model/arrangement';
import { createNodeInstance, toWorkflow, updateNodeConfig } from '@/lib/workflow/model/canvas';
import { migrateSnapshot, restoreSnapshot, serializeSnapshot, SNAPSHOT_VERSION } from '@/lib/workflow/model/snapshot';
import { typeRegistry } from '@/lib/workflow/nodes/client';
import { validateConnection } from '@/lib/workflow/nodes/core/connections';
import type { NodeManifest } from '@/lib/workflow/nodes/types';

export interface WorkflowState {
  subscriptionId: string;
  catalog: WorkflowNodeCatalog;
  nodesLoading: boolean;
  nodesLoaded: boolean;
  nodesError: string | null;
  subscription: SubscriptionDetail | null;
  flow: FlowSnapshot | null;
  detailLoading: boolean;
  detailLoaded: boolean;
  detailError: string | null;
  saving: boolean;
  running: boolean;
  runId: string | null;
  runStatus: 'idle' | 'running' | 'success' | 'failed' | 'cancelled';
  runError: string | null;
  nodeStates: Record<string, NodeRunState>;
  run(): Promise<void>;
  stop(): void;
  addNode(type: string, position: { x: number; y: number }): void;
  moveNode(id: string, position: { x: number; y: number }): void;
  removeNode(id: string): void;
  connectNodes(source: string, target: string): void;
  removeEdge(id: string): void;
  updateConfig(id: string, config: unknown): void;
  save(): Promise<void>;
  loadNodes(): Promise<void>;
  loadDetail(): Promise<void>;
  reload(): Promise<void>;
  cancelLoad(): void;
  setFlow(flow: FlowSnapshot): void;
}
export type WorkflowStore = ReturnType<typeof createWorkflowStore>;

function message(reason: unknown): string {
  return reason instanceof AppError ? errorMessage(reason) : reason instanceof Error ? reason.message : '';
}

export function createWorkflowStore(subscriptionId: string) {
  return createStore<WorkflowState>()((set, get) => {
    let nodesController: AbortController | null = null;
    let detailController: AbortController | null = null;
    let runController: AbortController | null = null;

    function currentFlow(): FlowSnapshot {
      const state = get();

      if (
        !state.flow ||
        !state.detailLoaded ||
        state.detailLoading ||
        state.detailError !== null ||
        state.saving ||
        state.running
      ) {
        throw appError('workflow.SNAPSHOT_NOT_READY');
      }

      return state.flow;
    }

    function resolve(type: string): NodeManifest {
      const node = get().catalog.nodes.find((item) => item.type === type);

      if (!node) {
        throw appError('workflow.NODE_NOT_FOUND');
      }

      return node;
    }

    async function loadNodes(): Promise<void> {
      nodesController?.abort();
      const controller = new AbortController();

      nodesController = controller;
      set({ nodesLoading: true, nodesError: null });
      try {
        const catalog = await listWorkflowNodes(controller.signal);

        if (!controller.signal.aborted) {
          set({ catalog, nodesLoaded: true });
        }
      } catch (reason) {
        if (!controller.signal.aborted) {
          set({ nodesError: message(reason) });
        }
      } finally {
        if (nodesController === controller) {
          nodesController = null;
          set({ nodesLoading: false });
        }
      }
    }

    async function loadDetail(): Promise<void> {
      if (get().saving || get().running) {
        return;
      }

      detailController?.abort();
      const controller = new AbortController();

      detailController = controller;
      set({ detailLoading: true, detailError: null });
      try {
        const subscription = await getSubscription(subscriptionId, controller.signal);
        const flow =
          subscription.flow === null
            ? { schemaVersion: SNAPSHOT_VERSION, workflowId: subscriptionId, nodes: [], edges: [] }
            : restoreSnapshot(subscription.flow);

        if (flow.workflowId !== subscriptionId) {
          throw appError('workflow.INVALID_SNAPSHOT');
        }

        if (!controller.signal.aborted) {
          set({ subscription, flow, detailLoaded: true });
        }
      } catch (reason) {
        if (!controller.signal.aborted) {
          set({ detailError: message(reason) });
        }
      } finally {
        if (detailController === controller) {
          detailController = null;
          set({ detailLoading: false });
        }
      }
    }

    return {
      subscriptionId,
      catalog: { groups: [], nodes: [], defaults: {} },
      saving: false,
      running: false,
      runId: null,
      runStatus: 'idle',
      runError: null,
      nodeStates: {},
      async run() {
        const flow = currentFlow();
        const controller = new AbortController();
        const runId = crypto.randomUUID();

        runController = controller;
        set({ running: true, runId, runStatus: 'running', runError: null, nodeStates: {} });
        try {
          await saveWorkflowDraft(subscriptionId, serializeSnapshot(flow), controller.signal);
          controller.signal.throwIfAborted();
          await runWorkflow(
            subscriptionId,
            runId,
            (event) => {
              if (controller.signal.aborted || get().runId !== event.runId) {
                return;
              }

              if (event.type === 'node.updated') {
                set((state) => ({ nodeStates: { ...state.nodeStates, [event.node.nodeId]: event.node } }));
              } else if (event.type === 'run.completed') {
                set({ runStatus: 'success' });
              } else if (event.type === 'run.failed' || event.type === 'run.cancelled') {
                set({ runStatus: event.type === 'run.failed' ? 'failed' : 'cancelled', runError: event.message });
                if (event.type === 'run.failed') {
                  throw new Error(event.message);
                }
              }
            },
            controller.signal,
          );
        } catch (reason) {
          set({
            runStatus: controller.signal.aborted ? 'cancelled' : 'failed',
            runError: controller.signal.aborted ? null : message(reason),
          });
          set((state) => ({
            nodeStates: Object.fromEntries(
              Object.entries(state.nodeStates).map(([id, node]) => [
                id,
                node.status === 'running' || node.status === 'pending'
                  ? {
                      ...node,
                      status:
                        node.status === 'running' ? (controller.signal.aborted ? 'cancelled' : 'failed') : 'skipped',
                      finishedAt: Date.now(),
                    }
                  : node,
              ]),
            ),
          }));
          if (!controller.signal.aborted) {
            throw reason;
          }
        } finally {
          if (runController === controller) {
            runController = null;
            set({ running: false });
          }
        }
      },
      stop() {
        runController?.abort();
      },
      nodesLoading: true,
      nodesLoaded: false,
      nodesError: null,
      subscription: null,
      flow: null,
      detailLoading: true,
      detailLoaded: false,
      detailError: null,
      addNode(type, position) {
        const flow = currentFlow();
        const state = get();
        const manifest = resolve(type);
        const node = createNodeInstance(manifest, state.catalog.defaults[type], position);

        set({ flow: { ...flow, nodes: [...flow.nodes, node] } });
      },
      moveNode(id, position) {
        const flow = currentFlow();

        get().setFlow({ ...flow, nodes: flow.nodes.map((node) => (node.id === id ? { ...node, position } : node)) });
      },
      removeNode(id) {
        const flow = currentFlow();

        set({
          flow: {
            ...flow,
            nodes: flow.nodes.filter((node) => node.id !== id),
            edges: flow.edges.filter((edge) => edge.source !== id && edge.target !== id),
          },
        });
      },
      connectNodes(source, target) {
        const flow = currentFlow();
        const edge = { id: crypto.randomUUID(), source, target };

        validateConnection(toWorkflow(flow), edge, resolve, typeRegistry);
        set({ flow: { ...flow, edges: [...flow.edges, edge] } });
      },
      removeEdge(id) {
        const flow = currentFlow();

        set({ flow: { ...flow, edges: flow.edges.filter((edge) => edge.id !== id) } });
      },
      updateConfig(id, config) {
        set({ flow: updateNodeConfig(currentFlow(), id, config) });
      },
      async save() {
        const state = get();
        const flow = currentFlow();

        if (!state.nodesLoaded || state.nodesLoading || state.nodesError !== null) {
          throw appError('workflow.NODE_NOT_FOUND');
        }

        validateArrangement(toWorkflow(flow), resolve, typeRegistry);
        const raw = serializeSnapshot(flow);

        set({ saving: true });
        try {
          await updateSubscription({ id: subscriptionId, flow: raw });
          set((state) => ({ subscription: state.subscription ? { ...state.subscription, flow: raw } : null }));
        } finally {
          set({ saving: false });
        }
      },
      loadNodes,
      loadDetail,
      async reload() {
        await Promise.all([loadNodes(), loadDetail()]);
      },
      cancelLoad() {
        nodesController?.abort();
        detailController?.abort();
        runController?.abort();
        nodesController = null;
        detailController = null;
        set({ nodesLoading: false, detailLoading: false });
      },
      setFlow(flow) {
        if (!get().detailLoaded || get().detailLoading || get().detailError !== null || get().saving || get().running) {
          throw appError('workflow.SNAPSHOT_NOT_READY');
        }

        const snapshot = migrateSnapshot(flow);

        if (snapshot.workflowId !== subscriptionId) {
          throw appError('workflow.INVALID_SNAPSHOT');
        }

        set({ flow: snapshot });
      },
    };
  });
}
