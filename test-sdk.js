const { createClient } = require('@insforge/sdk');

const baseUrl = 'https://h26zt6ri.eu-central.insforge.app';
const anonKey = 'ik_be17b44e1c0b3f7373e31bd7e7033c67';

const insforge = createClient({
  baseUrl,
  anonKey,
});

async function run() {
  const { data, error } = await insforge.database.from('system_stats').select('*');
  console.log('Data:', data);
  if (error) console.error('Error:', error);
}

run();
