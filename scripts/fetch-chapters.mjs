// Fetches the Royal Road syndication feed and saves the newest chapters
// to data/chapters.json. No dependencies; needs Node 18+.

import { mkdir, writeFile } from "node:fs/promises";

const FICTION_ID = "195172";
const FEED_URL = `https://www.royalroad.com/fiction/syndication/${FICTION_ID}`;
const OUT_FILE = "data/chapters.json";
const LIMIT = 5;

function decode(text) {
  return text
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1")
    .replace(/<[^>]*>/g, "")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#0?39;|&apos;/g, "'")
    .replace(/&amp;/g, "&");
}

function tag(block, name) {
  const m = block.match(new RegExp(`<${name}[^>]*>([\\s\\S]*?)</${name}>`, "i"));
  return m ? decode(m[1]).trim() : "";
}

try {
  const res = await fetch(FEED_URL, {
    headers: {
      "User-Agent": "Mozilla/5.0 (compatible; ethanscott.work chapter sync)",
      Accept: "application/rss+xml, application/xml, text/xml",
    },
  });
  if (!res.ok) throw new Error(`Feed returned HTTP ${res.status}`);

  const xml = await res.text();

  const chapters = [...xml.matchAll(/<item\b[^>]*>([\s\S]*?)<\/item>/gi)]
    .map((m) => {
      const block = m[1];
      const date = new Date(tag(block, "pubDate"));
      return {
        title: tag(block, "title"),
        url: tag(block, "link"),
        date: isNaN(date) ? null : date.toISOString(),
      };
    })
    .filter((c) => c.title && c.url.startsWith("https://www.royalroad.com/"))
    .sort((a, b) => (b.date || "").localeCompare(a.date || ""))
    .slice(0, LIMIT);

  if (chapters.length === 0) throw new Error("No chapters found in the feed");

  await mkdir("data", { recursive: true });
  await writeFile(OUT_FILE, JSON.stringify({ chapters }, null, 2) + "\n");
  console.log(`Saved ${chapters.length} chapters.`);
} catch (err) {
  console.log(`::warning::Chapter sync skipped: ${err.message}`);
}
