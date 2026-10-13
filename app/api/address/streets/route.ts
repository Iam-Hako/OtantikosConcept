import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

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

    const searchTerms: string[] = [];
    if (query && query.trim().length >= 2) {
      searchTerms.push(query.trim());
    }
    if (cleanHood) searchTerms.push(cleanHood);
    if (cleanDist) searchTerms.push(cleanDist);
    if (province) searchTerms.push(province);
    searchTerms.push('Türkiye');

    const qStr = searchTerms.join(' ');
    const url = 'https://photon.komoot.io/api/?q=' + encodeURIComponent(qStr) + '&limit=50';

    const res = await fetch(url, {
      headers: {
        'User-Agent': 'OtantikosConceptECommerce/1.0',
        Accept: 'application/json',
      },
      next: { revalidate: 86400 }, // Cache 24 hours
    });

    if (!res.ok) {
      return NextResponse.json({ streets: [] });
    }

    const data = await res.json();
    const streetsSet = new Set<string>();

    const streetKeywords = /(Caddesi|Cad\.|Cad|Sokağı|Sokak|Sk\.|Sk|Bulvarı|Bulvar|Blv\.|Meydanı|Yolu|Küme Evler|Çıkmazı)/i;

    (data.features || []).forEach((f: any) => {
      const p = f.properties || {};

      if (p.name && (p.osm_key === 'highway' || p.type === 'street' || streetKeywords.test(p.name))) {
        // Expose cleaned street name
        const cleanName = p.name.trim();
        if (cleanName.length > 2 && !cleanName.includes('Belediyesi') && !cleanName.includes('Kaymakamlığı')) {
          streetsSet.add(cleanName);
        }
      }
      if (p.street) {
        const cleanStreet = p.street.trim();
        if (cleanStreet.length > 2) {
          streetsSet.add(cleanStreet);
        }
      }
    });

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
