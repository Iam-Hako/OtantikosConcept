import { NextResponse } from 'next/server';
// @ts-ignore
import * as tn from 'turkey-neighbourhoods';

export const dynamic = 'force-dynamic';

function getCityCode(cityName: string): string | null {
  if (!cityName) return null;
  const norm = cityName.toLowerCase().trim();
  for (const [code, name] of Object.entries(tn.cityNamesByCode as Record<string, string>)) {
    if (name.toLowerCase() === norm) return code;
  }
  return null;
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const province = searchParams.get('province') || '';
    const district = searchParams.get('district') || '';

    if (!province || !district) {
      return NextResponse.json({ error: 'İl ve ilçe parametreleri zorunludur.' }, { status: 400 });
    }

    const cityCode = getCityCode(province);
    if (!cityCode) {
      return NextResponse.json({ neighborhoods: [] });
    }

    // Clean district name from notes like "Fatih (Eminönü/Tahtakale)" -> "Fatih"
    const cleanDistrict = district.replace(/\s*\(.*?\)/, '').trim();

    const rawHoods: string[] = tn.getNeighbourhoodsByCityCodeAndDistrict(cityCode, cleanDistrict) || [];

    // Format and sort neighborhoods cleanly
    const neighborhoods = Array.from(new Set(rawHoods.map((h) => h.trim()))).sort((a, b) =>
      a.localeCompare(b, 'tr')
    );

    return NextResponse.json(
      {
        success: true,
        province,
        district: cleanDistrict,
        neighborhoods,
      },
      {
        headers: {
          'Cache-Control': 'public, s-maxage=86400, stale-while-revalidate=604800',
        },
      }
    );
  } catch (err: any) {
    console.error('[Neighborhoods API Error]', err);
    return NextResponse.json({ error: err.message || 'Mahalleler alınamadı.' }, { status: 500 });
  }
}
