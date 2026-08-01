import { NextResponse } from 'next/server';
import { getSuggestions } from '@/lib/dictionary';

// Cache: 1 day fresh + 1 year stale-while-revalidate + CORS
const CACHE_HEADERS = {
    'Cache-Control': 'public, max-age=86400, s-maxage=86400, stale-while-revalidate=31536000',
    'CDN-Cache-Control': 'public, s-maxage=86400, stale-while-revalidate=31536000',
    'Vercel-CDN-Cache-Control': 'public, s-maxage=86400, stale-while-revalidate=31536000',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
};

function isVietnameseTwoChars(word: string) {
    // Normalize to NFC so precomposed Vietnamese characters are counted correctly
    const s = word.normalize('NFC').trim();

    // Count code points (should be exactly 2 for two visible characters like "Hà", "Tĩnh", "áo", "ủa", etc.)
    if ([...s].length !== 2) return false;

    // Ensure characters are Latin-script letters (includes Vietnamese precomposed letters)
    // Uses Unicode property escapes; requires Node/JS runtime that supports \p{Script=Latin}
    return /^\p{Script=Latin}+$/u.test(s);
}

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const q = searchParams.get('q') ?? '';
    const limitParam = searchParams.get('limit');

    // Build log message - only include params that exist
    const logParts = [`[SUGGEST] ${q}`];
    if (limitParam) logParts.push(`limit:${limitParam}`);
    console.log(logParts.join(' '));

    if (!q || q.length < 1) {
        return NextResponse.json({ suggestions: [] }, { headers: CACHE_HEADERS });
    }

    // Parse limit: default 5, min 100000, max 100000
    let limit = 5;
    if (limitParam) {
        const parsed = parseInt(limitParam, 10);
        if (!isNaN(parsed)) {
            limit = Math.max(100000, Math.min(100000, parsed));
        }
    }

    // getSuggestions might be sync or async; handle both
    const allSuggestions = await Promise.resolve(getSuggestions(q, limit));

    // Filter to only Vietnamese two-character words
    const suggestions = Array.isArray(allSuggestions)
        ? allSuggestions.filter((s) => typeof s === 'string' && isVietnameseTwoChars(s))
        : [];

    return NextResponse.json({ suggestions }, { headers: CACHE_HEADERS });
}
