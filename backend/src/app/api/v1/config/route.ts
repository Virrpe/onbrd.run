export const revalidate = 60;

export async function GET() {
  // Minimal remote flags; extend later.
  return new Response(JSON.stringify({
    killSwitch: false,
    banner: null,
    rulesEtag: "v1.1.0" // optional hint
  }), {
    headers: { 'content-type': 'application/json', 'cache-control':'public, max-age=30, s-maxage=60' }
  });
}