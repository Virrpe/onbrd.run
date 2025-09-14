import { execSync } from 'child_process';
import { existsSync, mkdirSync, copyFileSync, readdirSync, statSync } from 'fs';
import { join } from 'path';

const ARTIFACTS_DIR = 'artifacts';
const EXTENSION_BUILD_DIR = 'extension/dist';

function runCommand(command: string, cwd?: string): void {
  console.log(`Running: ${command}`);
  execSync(command, { stdio: 'inherit', cwd });
}

function ensureDir(dir: string): void {
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true });
  }
}

function copyExtensionFiles(): void {
  const sourceDir = EXTENSION_BUILD_DIR;
  const targetDir = join(ARTIFACTS_DIR, 'extension');
  
  ensureDir(targetDir);
  
  // Copy all files from dist to artifacts/extension
  const files = readdirSync(sourceDir);
  files.forEach(file => {
    const sourcePath = join(sourceDir, file);
    const targetPath = join(targetDir, file);
    
    const stat = statSync(sourcePath);
    if (stat.isDirectory()) {
      // Copy directory contents recursively
      copyDirectory(sourcePath, targetPath);
    } else {
      copyFileSync(sourcePath, targetPath);
    }
  });
  
  console.log(`Extension files copied to ${targetDir}`);
}

function copyDirectory(src: string, dest: string): void {
  ensureDir(dest);
  const files = readdirSync(src);
  files.forEach(file => {
    const srcPath = join(src, file);
    const destPath = join(dest, file);
    const stat = statSync(srcPath);
    if (stat.isDirectory()) {
      copyDirectory(srcPath, destPath);
    } else {
      copyFileSync(srcPath, destPath);
    }
  });
}

function createZip(): void {
  const zipPath = join(process.cwd(), ARTIFACTS_DIR, 'onboarding-audit-extension.zip');
  const sourceDir = join(process.cwd(), ARTIFACTS_DIR, 'extension');
  
  // Ensure the artifacts directory exists
  ensureDir(join(process.cwd(), ARTIFACTS_DIR));
  
  // Create zip using system zip command
  runCommand(`zip -r "${zipPath}" .`, sourceDir);
  console.log(`Extension packaged as ${zipPath}`);
}

function main(): void {
  console.log('🚀 Building and packaging OnboardingAudit.ai extension...\n');
  
  try {
    // Ensure artifacts directory exists
    ensureDir(ARTIFACTS_DIR);
    
    // Build the extension
    console.log('📦 Building extension...');
    runCommand('pnpm build', 'extension');
    
    // Copy extension files to artifacts
    console.log('📁 Copying extension files...');
    copyExtensionFiles();
    
    // Create zip package
    console.log('🗜️ Creating zip package...');
    createZip();
    
    console.log('\n✅ Extension packaged successfully!');
    console.log(`📍 Location: ${join(ARTIFACTS_DIR, 'onboarding-audit-extension.zip')}`);
    
  } catch (error) {
    console.error('❌ Packaging failed:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}