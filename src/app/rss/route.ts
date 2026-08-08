import { db } from '@/lib/db'

const SITE_URL = 'https://sanaathrumylens.co.ke'

export async function GET() {
  try {
    const articles = await db.article.findMany({
      orderBy: { publishedAt: 'desc' },
      take: 20,
      include: { category: true, author: true },
    })

    const items = articles
      .map(a => `
    <item>
      <title><![CDATA[${a.title}]]></title>
      <link>${SITE_URL}/articles/${a.slug}</link>
      <guid isPermaLink="true">${SITE_URL}/articles/${a.slug}</guid>
      <description><![CDATA[${a.excerpt}]]></description>
      <pubDate>${new Date(a.publishedAt).toUTCString()}</pubDate>
      <author>${a.author?.name || 'Unknown'}</author>
      <category>${a.category?.name || 'Uncategorized'}</category>
    </item>`)
      .join('')

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>Sanaa Through My Lens</title>
    <link>${SITE_URL}</link>
    <description>An arts &amp; culture opinion blog highlighting stories around the art scene in Kenya and East Africa</description>
    <language>en</language>
    <atom:link href="${SITE_URL}/rss" rel="self" type="application/rss+xml" />
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    ${items}
  </channel>
</rss>`

    return new Response(xml, {
      headers: {
        'Content-Type': 'application/xml; charset=utf-8',
        'Cache-Control': 's-maxage=3600, stale-while-revalidate',
      },
    })
  } catch (err) {
    console.error('RSS generation error:', err)
    return new Response('<rss version="2.0"><channel><title>Error</title><description>Failed to generate RSS feed</description></channel></rss>', {
      headers: { 'Content-Type': 'application/xml; charset=utf-8' },
      status: 500,
    })
  }
}
