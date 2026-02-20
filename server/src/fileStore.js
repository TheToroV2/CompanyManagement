import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR = path.join(__dirname, '..', 'data');
const COMPANIES_FILE = path.join(DATA_DIR, 'companies.json');

async function ensureDataDir() {
  try {
    await fs.mkdir(DATA_DIR, { recursive: true });
  } catch (err) {
    // ignore
  }
}

async function loadCompanies() {
  await ensureDataDir();
  try {
    const txt = await fs.readFile(COMPANIES_FILE, 'utf8');
    return JSON.parse(txt || '[]');
  } catch (err) {
    if (err.code === 'ENOENT') return [];
    throw err;
  }
}

async function saveCompanies(list) {
  await ensureDataDir();
  const tmp = COMPANIES_FILE + '.tmp';
  await fs.writeFile(tmp, JSON.stringify(list, null, 2), 'utf8');
  await fs.rename(tmp, COMPANIES_FILE);
}

function normalizeId(s) {
  if (!s || typeof s !== 'string') return '';
  return s.replace(/[\s\-]/g, '').toLowerCase();
}

export async function findCompanyByNormalizedNIT(normalized) {
  const list = await loadCompanies();
  return list.find((c) => c.normalizedNIT === normalized) || null;
}

export async function insertCompany(company) {
  const list = await loadCompanies();
  list.push(company);
  await saveCompanies(list);
  return company;
}

export async function seed(companies) {
  await ensureDataDir();
  const existing = await loadCompanies();
  const map = new Map(existing.map((c) => [c.normalizedNIT, c]));
  for (const c of companies) map.set(c.normalizedNIT, c);
  const merged = Array.from(map.values());
  await saveCompanies(merged);
}

export default { loadCompanies, saveCompanies, findCompanyByNormalizedNIT, insertCompany, seed };
