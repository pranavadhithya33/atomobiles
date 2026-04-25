import fs from 'fs';
import { execSync } from 'child_process';

console.log('Starting automated Vercel deployment...');

try {
  const envContent = fs.readFileSync('.env.local', 'utf-8');
  const lines = envContent.split('\n');

  for (const line of lines) {
    if (!line.trim() || line.startsWith('#')) continue;
    
    const splitIndex = line.indexOf('=');
    if (splitIndex === -1) continue;
    
    const key = line.substring(0, splitIndex).trim();
    const value = line.substring(splitIndex + 1).trim();
    
    if (key && value) {
      console.log(`Uploading environment variable: ${key}`);
      try {
        // Upload to production
        execSync(`echo "${value}" | npx vercel env add ${key} production`, { stdio: 'ignore' });
        // Upload to preview/development
        execSync(`echo "${value}" | npx vercel env add ${key} preview`, { stdio: 'ignore' });
        execSync(`echo "${value}" | npx vercel env add ${key} development`, { stdio: 'ignore' });
      } catch (err) {
        // Might already exist, that's fine
      }
    }
  }

  console.log('Environment variables uploaded successfully! Triggering production deployment...');
  const deployOutput = execSync('npx vercel --prod --yes', { encoding: 'utf-8' });
  console.log('Deployment successful:');
  console.log(deployOutput);
  
} catch (err) {
  console.error('Error during automated deployment:', err.message);
}
