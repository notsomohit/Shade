export function GET() {
  return Response.json({
    status: "ok",
    service: "StudioNorth API",
    timestamp: new Date().toISOString(),
  });
}
