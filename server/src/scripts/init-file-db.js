import fileStore from '../fileStore.js';

function normalizeId(s) {
  if (!s || typeof s !== 'string') return '';
  return s.replace(/[\s\-]/g, '').toLowerCase();
}

async function main() {
  const now = new Date().toISOString();
  const seed = [
    {
      id: `company_${Date.now()}_${Math.random().toString(36).substr(2,9)}`,
      nit: '900674335',
      normalizedNIT: normalizeId('900674335'),
      name: 'Seeded Company A',
      email: 'a@example.com',
      phone: '3000000001',
      address: 'Carrera 1 # 10 - 20',
      registeredAt: now,
      status: 'active',
    },
    {
      id: `company_${Date.now()+1}_${Math.random().toString(36).substr(2,9)}`,
      nit: '900674336',
      normalizedNIT: normalizeId('900674336'),
      name: 'Seeded Company B',
      email: 'b@example.com',
      phone: '3000000002',
      address: 'Carrera 2 # 20 - 30',
      registeredAt: now,
      status: 'active',
    },
    {
      id: `company_${Date.now()+2}_${Math.random().toString(36).substr(2,9)}`,
      nit: '811033098',
      normalizedNIT: normalizeId('811033098'),
      name: 'Seeded Company C',
      email: 'c@example.com',
      phone: '3000000003',
      address: 'Calle 3 # 30 - 40',
      registeredAt: now,
      status: 'active',
    },
  ];

  try {
    await fileStore.seed(seed.map((s) => ({ ...s })));
    console.log('File DB seeded.');
  } catch (err) {
    console.error('Seed failed:', err);
    process.exit(1);
  }
}

main();
