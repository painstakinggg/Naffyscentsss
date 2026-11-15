export async function onRequestGet({ env }) {
  const checks = {
    pagesFunctions: true,
    d1: false,
    r2: Boolean(env.MEDIA),
  };

  try {
    if (!env.DB) throw new Error("D1 binding DB is missing");
    await env.DB.prepare("SELECT 1 AS ok").first();
    checks.d1 = true;
  } catch (error) {
    return new Response(JSON.stringify({
      ok: false,
      service: "NAFFY SCENTS API",
      checks,
      error: error instanceof Error ? error.message : "D1 health check failed",
    }), {
      status: 503,
      headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" },
    });
  }

  return new Response(JSON.stringify({
    ok: checks.d1 && checks.r2,
    service: "NAFFY SCENTS API",
    checks,
  }), {
    status: checks.d1 && checks.r2 ? 200 : 503,
    headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" },
  });
}
