import { NextResponse } from 'next/server';
import { getOfficialStreets } from '@/lib/turkey-streets';

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

    // 1. Try Primary High-Speed Official National Database (1,083,396 streets)
    const officialStreets = getOfficialStreets(cleanDist, cleanHood, query);

    if (officialStreets.length > 0) {
      return NextResponse.json(
        {
          success: true,
          source: 'nvi_official_uavt',
          count: officialStreets.length,
          streets: officialStreets,
        },
        {
          headers: {
            'Cache-Control': 'public, s-maxage=86400, stale-while-revalidate=604800',
          },
        }
      );
    }

    // 2. Fallback to OpenStreetMap/Photon if official db didn't have this specific neighborhood
    const streetsSet = new Set<string>();

    if (query && query.trim().length >= 2) {
      const q = query.trim();
      const queries = [
        `${q} ${cleanHood} ${cleanDist} ${province}`,
        `${q} ${cleanDist} ${province}`,
      ];

      const results = await Promise.all(queries.map((qs) => fetchFromPhoton(qs)));
      results.flat().forEach((st) => streetsSet.add(st));
    } else {
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
        source: 'osm_fallback',
        count: streets.length,
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
