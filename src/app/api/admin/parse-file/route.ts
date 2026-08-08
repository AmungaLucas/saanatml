import { NextRequest, NextResponse } from 'next/server'
import mammoth from 'mammoth'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File | null

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 })
    }

    const ext = file.name.split('.').pop()?.toLowerCase()
    if (!ext || !['docx', 'pdf', 'doc', 'txt'].includes(ext)) {
      return NextResponse.json({ error: 'Unsupported file type. Use DOCX, PDF, or TXT.' }, { status: 400 })
    }

    // Size limit: 10MB
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json({ error: 'File too large. Max 10MB.' }, { status: 400 })
    }

    const buffer = Buffer.from(await file.arrayBuffer())
    let text = ''
    let titleHint = ''

    if (ext === 'txt') {
      text = buffer.toString('utf-8')
    } else if (ext === 'docx' || ext === 'doc') {
      const result = await mammoth.extractRawText({ buffer })
      text = result.value
    } else if (ext === 'pdf') {
      // Dynamic import to handle pdf-parse ESM compatibility
      const pdfParse = (await import('pdf-parse')).default || (await import('pdf-parse'))
      const data = await pdfParse(buffer)
      text = data.text
      // Use PDF metadata for title hint
      if (data.info?.Title) {
        titleHint = data.info.Title
      }
    }

    if (!text.trim()) {
      return NextResponse.json({ error: 'Could not extract text from the file.' }, { status: 400 })
    }

    // Convert plain text to basic markdown
    const markdown = textToMarkdown(text)

    // Try to extract a title from the first line
    const lines = text.split('\n').filter(l => l.trim().length > 0)
    if (!titleHint && lines.length > 0) {
      titleHint = lines[0].trim().slice(0, 100)
    }

    // Estimate read time (~200 words per minute)
    const wordCount = text.split(/\s+/).length
    const readTime = Math.max(1, Math.ceil(wordCount / 200))

    // Generate excerpt (first 200 chars)
    const excerpt = markdown.replace(/[#*_\[\]]/g, '').trim().slice(0, 200).trim() + '...'

    // Extract potential tags from content (common art keywords)
    const content = text.toLowerCase()
    const keywordMap: Record<string, string[]> = {
      'Music': ['music', 'song', 'album', 'artist', 'band', 'concert', 'genre', 'hip hop', 'afrobeat', 'benga'],
      'Film': ['film', 'movie', 'cinema', 'director', 'documentary', 'screen', 'camera', 'festival'],
      'Visual Arts': ['art', 'painting', 'sculpture', 'gallery', 'exhibition', 'artist', 'canvas', 'mural'],
      'Theatre': ['theatre', 'theater', 'stage', 'play', 'performance', 'drama', 'actor', 'actress'],
      'Literature': ['book', 'literature', 'novel', 'poetry', 'poem', 'writer', 'author', 'reading', 'publish'],
      'Culture': ['culture', 'cultural', 'heritage', 'tradition', 'african', 'kenya', 'east africa', 'identity'],
      'Creative Economy': ['creative', 'economy', 'creative economy', 'industry', 'market', 'business', 'entrepreneur'],
    }
    const matchedTags: string[] = []
    for (const [tag, keywords] of Object.entries(keywordMap)) {
      if (keywords.some(kw => content.includes(kw))) {
        matchedTags.push(tag)
      }
    }

    return NextResponse.json({
      markdown,
      titleHint,
      excerpt,
      readTime,
      tags: matchedTags.join(', '),
      wordCount,
      fileName: file.name,
    })
  } catch (err) {
    console.error('File parse error:', err)
    return NextResponse.json(
      { error: 'Failed to parse file. Make sure it is a valid DOCX or PDF.' },
      { status: 500 }
    )
  }
}

/**
 * Convert plain text to basic markdown:
 * - Lines that look like headings (short, no trailing period) become ## 
 * - Empty lines become paragraph breaks
 * - Preserve existing structure
 */
function textToMarkdown(text: string): string {
  const lines = text.split('\n')
  const result: string[] = []
  let prevEmpty = false

  for (const line of lines) {
    const trimmed = line.trim()

    if (!trimmed) {
      if (!prevEmpty) {
        result.push('')
        prevEmpty = true
      }
      continue
    }
    prevEmpty = false

    // Detect headings: short lines (< 80 chars) that don't end with punctuation
    // and are followed by content, OR lines that are all caps, or start with a number
    const isShortLine = trimmed.length < 80
    const noTrailingPunctuation = !/[.!?,;:]$/.test(trimmed)
    const isAllCaps = trimmed === trimmed.toUpperCase() && /[A-Z]/.test(trimmed)
    const startsWithNumber = /^\d+[.)]\s/.test(trimmed)

    if (isShortLine && noTrailingPunctuation && !startsWithNumber && result.length > 0) {
      result.push(`\n## ${trimmed}\n`)
    } else if (isAllCaps && trimmed.length < 60) {
      result.push(`\n## ${trimmed.charAt(0) + trimmed.slice(1).toLowerCase()}\n`)
    } else {
      result.push(trimmed)
    }
  }

  return result.join('\n').replace(/\n{3,}/g, '\n\n').trim()
}
