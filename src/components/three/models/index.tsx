import AboutStudio from "@/components/three/models/AboutStudio";
import type { ComponentType } from "react";
import AboutCube from "@/components/three/models/AboutCube";
import AppDevPhones from "@/components/three/models/AppDevPhones";
import AssemblingCube from "@/components/three/models/AssemblingCube";
import AutomationFlow from "@/components/three/models/AutomationFlow";
import BrandCube from "@/components/three/models/BrandCube";
import CallingAgent3D from "@/components/three/models/CallingAgent3D";
import ContactMessage from "@/components/three/models/ContactMessage";
import DeviceFrame from "@/components/three/models/DeviceFrame";
import DriftingCube from "@/components/three/models/DriftingCube";
import Folders from "@/components/three/models/Folders";
import Funnel from "@/components/three/models/Funnel";
import GetwithusOverview from "@/components/three/models/GetwithusOverview";
import GlassBrowser from "@/components/three/models/GlassBrowser";
import HandsetRings from "@/components/three/models/HandsetRings";
import type { ModelKey, ModelProps } from "@/components/three/models/keys";
import { LegalDocument, Shield } from "@/components/three/models/LegalModels";
import MarketingGrowth from "@/components/three/models/MarketingGrowth";
import NodeGraph from "@/components/three/models/NodeGraph";
import PaperPlane from "@/components/three/models/PaperPlane";
import ProcessSteps from "@/components/three/models/ProcessSteps";
import PhoneBubbles from "@/components/three/models/PhoneBubbles";
import PhoneScreens from "@/components/three/models/PhoneScreens";
import ProcessPath from "@/components/three/models/ProcessPath";
import ServerHub from "@/components/three/models/ServerHub";
import ServicesTurntable from "@/components/three/models/ServicesTurntable";
import ServicesHub from "@/components/three/models/ServicesHub";
import SoftwareCloud from "@/components/three/models/SoftwareCloud";
import WebDevLayers from "@/components/three/models/WebDevLayers";
import WhatsAppBot3D from "@/components/three/models/WhatsAppBot3D";

function FoldersOpen() {
  return <Folders />;
}

function FoldersClosed() {
  return <Folders closed />;
}

/** Every page model by name. Part of the 3D chunk: only ModelCanvas imports it. */
export const MODELS: Record<ModelKey, ComponentType<ModelProps>> = {
  "brand-cube":        BrandCube,
  "glass-browser":     GlassBrowser,
  "web-dev-layers":    WebDevLayers,
  "app-dev-phones":    AppDevPhones,
  "automation-flow":   AutomationFlow,
  "marketing-growth":  MarketingGrowth,
  "software-cloud":    SoftwareCloud,
  "whatsapp-bot-3d":   WhatsAppBot3D,
  "calling-agent-3d":  CallingAgent3D,
  "services-hub":      ServicesHub,
  "process-steps":     ProcessSteps,
  "about-studio":      AboutStudio,
  "contact-message":   ContactMessage,
  "getwithus-overview": GetwithusOverview,
  "phone-screens":     PhoneScreens,
  "node-graph":        NodeGraph,
  "phone-bubbles":     PhoneBubbles,
  "handset-rings":     HandsetRings,
  funnel:              Funnel,
  "server-hub":        ServerHub,
  "services-turntable":ServicesTurntable,
  "process-path":      ProcessPath,
  "about-cube":        AboutCube,
  folders:             FoldersOpen,
  "folders-closed":    FoldersClosed,
  "device-frame":      DeviceFrame,
  "paper-plane":       PaperPlane,
  "assembling-cube":   AssemblingCube,
  shield:              Shield,
  "legal-document":    LegalDocument,
  "drifting-cube":     DriftingCube,
};
