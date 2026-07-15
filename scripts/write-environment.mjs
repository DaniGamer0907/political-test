import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';

const requiredVariables = ['SUPABASE_URL', 'SUPABASE_ANON_KEY'];
const missingVariables = requiredVariables.filter((key) => !process.env[key]);

if (missingVariables.length > 0) {
  throw new Error(`Missing required environment variables: ${missingVariables.join(', ')}`);
}

const environmentPath = resolve('src/environments/environment.prod.ts');
const environmentSource = `export const environment = {
  production: true,
  supabaseUrl: ${JSON.stringify(process.env['SUPABASE_URL'])},
  supabaseAnonKey: ${JSON.stringify(process.env['SUPABASE_ANON_KEY'])},
};
`;

mkdirSync(dirname(environmentPath), { recursive: true });
writeFileSync(environmentPath, environmentSource);

