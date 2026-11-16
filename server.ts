import type { BbPluginApi } from "@get-bb/plugin-sdk";

// Interface-only plugin: no backend state, RPC, network, or services.
export default function rusPlugin(_bb: BbPluginApi): void {}
