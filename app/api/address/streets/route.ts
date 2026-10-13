import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

const streetKeywords = /(Caddesi|Cad\.|Cad|Sokağı|Sokak|Sk\.|Sk|Bulvarı|Bulvar|Blv\.|Meydanı|Yolu|Küme Evler|Çıkmazı)/i;
const blacklistKeywords = /(Belediyesi|Kaymakamlığı|Okulu|Lisesi|Ortaokulu|İlkokulu|Hastanesi|Karakolu|Müdürlüğü|Muhtarlığı|Durağı|İstasyonu|Metrosu|Parkı|Camii|Mescidi|Eczanesi)/i;

async function fetchFromPhoton(queryStr: string): Promise<string[]> {
  try {
    const url = 'https://photon.komoot.io/api/?q=' + encodeURIComponent(queryStr) + '&limit=40';
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'OtantikosConceptECommerce/1.0',
        Accept: 'application/json',
      },
      next: { revalidate: 86400 },
    });

    if (!res.ok) return [];
    const data = await res.json();
    const result: string[] = [];

    (data.features || []).forEach((f: any) => {
      const p = f.properties || {};

      const checkAndAdd = (name?: string) => {
        if (!name) return;
        const clean = name.trim();
        if (
          clean.length > 2 &&
          !blacklistKeywords.test(clean) &&
          (streetKeywords.test(clean) || p.osm_key === 'highway' || p.type === 'street')
        ) {
          result.push(clean);
        }
      };

      checkAndAdd(p.name);
      checkAndAdd(p.street);
    });

    return result;
  } catch (err) {
    return [];
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const province = searchParams.get('province') || '';
    const district = searchParams.get('district') || '';
    const neighborhood = searchParams.get('neighborhood') || '';
    const query = searchParams.get('query') || '';

    if (!province && !district && !neighborhood && !query) {
      return NextResponse.json({ streets: [] });
    }

    const cleanDist = district.replace(/\s*\(.*?\)/, '').trim();
    const cleanHood = neighborhood.replace(/\s*(Mah\.|Mahallesi|Mah)$/i, '').trim();

    const streetsSet = new Set<string>();

    if (query && query.trim().length >= 2) {
      // User is searching for a specific street/cadde
      const q = query.trim();
      const queries = [
        `${q} ${cleanHood} ${cleanDist} ${province}`,
        `${q} ${cleanDist} ${province}`,
      ];

      const results = await Promise.all(queries.map((qs) => fetchFromPhoton(qs)));
      results.flat().forEach((st) => streetsSet.add(st));
    } else {
      // Initial load for neighborhood streets: search parallel patterns
      const queries = [
        `Sokak ${cleanHood} ${cleanDist} ${province}`,
        `Caddesi ${cleanHood} ${cleanDist} ${province}`,
        `${cleanHood} ${cleanDist} ${province}`,
      ];

      const results = await Promise.all(queries.map((qs) => fetchFromPhoton(qs)));
      results.flat().forEach((st) => streetsSet.add(st));
    }

    const streets = Array.from(streetsSet).sort((a, b) => a.localeCompare(b, 'tr'));

    return NextResponse.json(
      {
        success: true,
        streets,
      },
      {
        headers: {
          'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
        },
      }
    );
  } catch (err: any) {
    console.warn('[Streets API Fetch Notice]', err);
    return NextResponse.json({ streets: [] });
  }
}
