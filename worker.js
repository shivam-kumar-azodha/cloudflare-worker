import { parseHTML } from "linkedom";

addEventListener("fetch", (event) => {
  event.respondWith(handleRequest(event.request));
});

async function handleRequest(request) {
  const { searchParams } = new URL(request.url);
  let url = searchParams.get("url");

  if (!url) {
    return new Response("URL parameter is missing", { status: 400 });
  }

  if (request.method === "OPTIONS") {
    return handleOptions(request);
  }

  // Add https:// if URL doesn't start with a protocol
  if (!url.startsWith("http://") && !url.startsWith("https://")) {
    url = `https://${url}`;
  }

  try {
    const response = await fetch(url);
    const html = await response.text();
    const metadata = extractMetadata(html);
    return new Response(JSON.stringify(metadata), {
      headers: getCorsHeaders({ "Content-Type": "application/json" }),
    });
  } catch (error) {
    return new Response("Failed to fetch metadata", {
      status: 500,
      headers: getCorsHeaders(),
    });
  }
}

function handleOptions(request) {
  return new Response(null, {
    status: 204,
    headers: getCorsHeaders({
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    }),
  });
}

function getCorsHeaders(additionalHeaders = {}) {
  return {
    "Access-Control-Allow-Origin": "*",
    ...additionalHeaders,
  };
}

function extractMetadata(html) {
  const { document } = parseHTML(html);

  const title = document.querySelector("title")?.textContent || "";

  const description =
    document
      .querySelector('meta[name="description"]')
      ?.getAttribute("content") ||
    document
      .querySelector('meta[property="og:description"]')
      ?.getAttribute("content") ||
    document
      .querySelector('meta[name="twitter:description"]')
      ?.getAttribute("content") ||
    "";

  const image =
    document
      .querySelector('meta[property="og:image"]')
      ?.getAttribute("content") ||
    document
      .querySelector('meta[name="twitter:image"]')
      ?.getAttribute("content") ||
    document
      .querySelector('link[rel="apple-touch-icon"]')
      ?.getAttribute("href") ||
    document.querySelector('link[rel="icon"]')?.getAttribute("href") ||
    "";

  const url =
    document
      .querySelector('meta[property="og:url"]')
      ?.getAttribute("content") ||
    document
      .querySelector('meta[name="twitter:url"]')
      ?.getAttribute("content") ||
    "";

  return { title, description, image, url };
}
