import { opentelemetryEnabled } from "@/pkg/otel";
import { name, version } from "../package.json";

if (opentelemetryEnabled) {
  const { setupOpenTelemetry } = await import("@/pkg/otel/setup");
  setupOpenTelemetry({ name, version });
} else {
  console.info("OpenTelemetry is disabled");
}
