import {
  NodeSpecJSON,
  registerCoreProfile,
  registerSceneProfile,
  Registry,
  writeNodeSpecsToJSON,
} from "@wired-labs/behave-graph-core";

let nodeSpecJSON: NodeSpecJSON[] | undefined = undefined;

export function getNodeSpecJSON() {
  if (nodeSpecJSON === undefined) {
    const registry = new Registry();
    registerCoreProfile(registry);
    registerSceneProfile(registry);
    nodeSpecJSON = writeNodeSpecsToJSON(registry).sort((a, b) => a.type.localeCompare(b.type));
  }

  return nodeSpecJSON;
}
