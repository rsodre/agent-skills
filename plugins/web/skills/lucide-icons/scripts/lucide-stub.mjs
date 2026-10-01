// Stands in for `lucide-react` while `render-icon.mjs` loads a `custom.tsx`: the real factory returns
// a React component that keeps its node private, and what the renderer wants is the node.
export function createLucideIcon(name, node) {
  return { name, node };
}
export default createLucideIcon;
