import { SpanStatusCode } from "@opentelemetry/api";
import { createMiddleware } from "hono/factory";
import { getTracer, inActiveSpan } from "./helpers";

function formatHeaders(headers: Record<string, string> | Headers) {
  return Object.entries(headers).map(([key, value]) => `${key}: ${value}`);
}

export const opentelemetry = (name?: string) => {
  const tracer = getTracer(name ?? "http");
  return createMiddleware<{ Variables: { requestId: string } }>((c, next) =>
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    inActiveSpan(async (parent) => {
      parent?.updateName(`HTTP ${c.req.method} ${c.req.path}`);
      if (c.req.method === "OPTIONS") {
        return next();
      }
      return tracer.startActiveSpan(`HTTP ${c.req.method} ${c.req.path}`, async (span) => {
        span?.addEvent("http.start");
        span?.setAttributes({
          "http.req.headers": formatHeaders(c.req.header()),
          "http.req.method": c.req.method,
          "http.req.path": c.req.path,
        });
        await next().catch((e: unknown) => {
          if (e instanceof Error) {
            span?.recordException(e);
          }
          span?.setStatus({ code: SpanStatusCode.ERROR });
          throw e;
        });
        span?.setAttributes({
          "http.res.status": c.res.status,
          "http.res.headers": formatHeaders(c.res.headers),
        });
        span?.addEvent("http.end");
      });
    }),
  );
};
