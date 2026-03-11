import { createClient } from '@insforge/sdk';

const baseUrl = 'https://dg3vuxw9.eu-central.insforge.app';
const anonKey = 'ik_be17b44e1c0b3f7373e31bd7e7033c67';

export const insforge = createClient({
  baseUrl,
  anonKey,
});
