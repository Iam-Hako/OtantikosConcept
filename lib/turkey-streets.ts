import * as path from 'path';

let dbInstance: any = null;

function getDb() {
  if (!dbInstance) {
    try {
      const Database = require('better-sqlite3');
      const dbPath = path.join(process.cwd(), 'lib', 'data', 'turkey_streets.db');
      dbInstance = new Database(dbPath, { readonly: true, fileMustExist: true });
    } catch (err) {
      console.warn('[TurkeyStreets DB Init Notice]', err);
      dbInstance = null;
    }
  }
  return dbInstance;
}

function cleanDistrict(dist: string): string {
  return (dist || '')
    .trim()
    .toLocaleUpperCase('tr-TR')
    .replace(/\s*\(.*?\)/g, '')
    .trim();
}

function cleanNeighborhood(hood: string): string {
  return (hood || '')
    .trim()
    .toLocaleUpperCase('tr-TR')
    .replace(/\s*\(.*?\)/g, '')
    .replace(/\s+(MAHALLESİ|MAHALLE|MAH\.|MAH|KÖYÜ|KÖY|MEVKİİ|MEZRASI)$/, '')
    .replace(/\./g, '')
    .trim();
}

export function getOfficialStreets(district: string, neighborhood: string, query?: string): string[] {
  const db = getDb();
  if (!db) return [];

  const cDist = cleanDistrict(district);
  const cHood = cleanNeighborhood(neighborhood);

  if (!cDist || !cHood) return [];

  try {
    // 1. Try exact match first
    let sql = `
      SELECT s.street 
      FROM streets s
      JOIN neighborhoods n ON s.area_id = n.id
      WHERE n.district = ? AND n.neighborhood = ?
    `;
    const params: any[] = [cDist, cHood];

    if (query && query.trim().length > 0) {
      sql += ` AND s.street LIKE ?`;
      params.push(`%${query.trim()}%`);
    }

    sql += ` ORDER BY s.street ASC`;

    let rows: any[] = db.prepare(sql).all(...params);

    // 2. If exact match didn't yield results, try fuzzy match on neighborhood
    if (rows.length === 0) {
      let fuzzySql = `
        SELECT s.street 
        FROM streets s
        JOIN neighborhoods n ON s.area_id = n.id
        WHERE n.district = ? AND (n.neighborhood LIKE ? OR ? LIKE '%' || n.neighborhood || '%')
      `;
      const fuzzyParams: any[] = [cDist, `%${cHood}%`, cHood];

      if (query && query.trim().length > 0) {
        fuzzySql += ` AND s.street LIKE ?`;
        fuzzyParams.push(`%${query.trim()}%`);
      }

      fuzzySql += ` ORDER BY s.street ASC`;
      rows = db.prepare(fuzzySql).all(...fuzzyParams);
    }

    const unique = Array.from(new Set(rows.map((r: any) => r.street as string)));
    return unique.sort((a, b) => a.localeCompare(b, 'tr'));
  } catch (err) {
    console.warn('[OfficialStreets Query Error]', err);
    return [];
  }
}
