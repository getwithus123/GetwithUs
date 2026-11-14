/**
 * The page models WebGLModel can mount, by name. The models themselves live in
 * the 3D chunk (models/index.tsx); this file only names them, so pages can pick
 * one without importing three.
 */
export type ModelKey =
  | "brand-cube"
  | "glass-browser"
  | "web-dev-layers"
  | "app-dev-phones"
  | "automation-flow"
  | "marketing-growth"
  | "software-cloud"
  | "whatsapp-bot-3d"
  | "calling-agent-3d"
  | "services-hub"
  | "process-steps"
  | "about-studio"
  | "contact-message"
  | "getwithus-overview"
  | "phone-screens"
  | "node-graph"
  | "phone-bubbles"
  | "handset-rings"
  | "funnel"
  | "server-hub"
  | "services-turntable"
  | "process-path"
  | "about-cube"
  | "folders"
  | "folders-closed"
  | "device-frame"
  | "paper-plane"
  | "assembling-cube"
  | "shield"
  | "legal-document"
  | "drifting-cube";

/** Props a page can hand its model: the case study screenshot and its frame. */
export type ModelProps = { image?: string; kind?: "browser" | "phone" };

/** Where the camera sits for a model, when the default framing does not fit it. */
export const MODEL_VIEWS: Partial<
  Record<ModelKey, { position: [number, number, number]; fov?: number }>
> = {
  "services-turntable": { position: [0, 3.4, 11.5] },
  "node-graph": { position: [0, 0.8, 8] },
  "server-hub": { position: [0, 0.4, 7.8] },
  "process-path": { position: [0, 1.4, 8.6] },
  "about-cube": { position: [0, 1.0, 8.6] },
  folders: { position: [0, 0.6, 7.8] },
  "folders-closed": { position: [0, 0.6, 7.4] },
  "paper-plane": { position: [0, 1.2, 7.8] },
  // Layered web-dev scene
  "web-dev-layers": { position: [0, 0, 9], fov: 30 },
  // Two phones side-by-side
  "app-dev-phones": { position: [0, 0, 9.5], fov: 30 },
  // Flow models  - prototype camera is (0, 0, 10), fov 30.
  "automation-flow":   { position: [0, 0, 10],   fov: 30 },
  // marketing-growth nodes span roughly x=-1.9 to x=+2.55; centre ~x=0.3, pull back
  "marketing-growth":  { position: [0.3, 0, 12], fov: 30 },
  "software-cloud":    { position: [0, 0, 10],   fov: 30 },
  "whatsapp-bot-3d":   { position: [0, 0, 10],   fov: 30 },
  "calling-agent-3d":  { position: [0, 0, 10],   fov: 30 },
  "services-hub":      { position: [0, 0, 10],   fov: 30 },
  "process-steps":        { position: [0, 0, 10],   fov: 30 },
  "about-studio":         { position: [0, 0, 10.5], fov: 30 },
  "contact-message":      { position: [0, 0, 10.5], fov: 30 },
  "getwithus-overview":   { position: [0, 0, 10.5], fov: 30 },
};

/** Models that never move (the legal pages): drawn once, never animated. */
export const STATIC_MODELS: ReadonlySet<ModelKey> = new Set(["shield", "legal-document"]);

/**
 * Models that provide their own lights and should NOT receive ModelCanvas's
 * default <Lights>. This prevents double-lighting on prototype-ported models.
 */
export const OWN_LIGHTS_MODELS: ReadonlySet<ModelKey> = new Set([
  "app-dev-phones",
  "automation-flow",
  "marketing-growth",
  "software-cloud",
  "whatsapp-bot-3d",
  "calling-agent-3d",
  "services-hub",
  "process-steps",
  "about-studio",
  "contact-message",
  "getwithus-overview",
]);
