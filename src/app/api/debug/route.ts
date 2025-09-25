// src/app/api/debug/route.ts
export async function GET() {
  console.log("✅ API ROUTE HIT -", new Date().toISOString());
  return Response.json({
    message: "Debug route working",
    timestamp: new Date().toISOString(),
  });
}
