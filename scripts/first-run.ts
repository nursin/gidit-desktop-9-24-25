import fs from 'fs'
import path from 'path'

/**
 * first-run.ts
 *
 * This script is executed after `npm install` (via the `postinstall` script).
 * It ensures that required models and resource folders exist so that the
 * application can run without additional downloads.  In a production
 * environment you would download the actual model files here.  For the
 * purposes of this demonstration we simply create placeholder folders and
 * files.  The script is written in TypeScript and executed via ts-node.
 */

async function ensureResources() {
  const root = path.resolve(__dirname, '..')
  const resourcesDir = path.join(root, 'resources');
  const modelsDir = path.join(resourcesDir, 'models', 'gemma3-270m');
  const pythonRuntimeDir = path.join(resourcesDir, 'python-runtime');

  // Ensure the models directory exists with a placeholder file
  if (!fs.existsSync(modelsDir)) {
    fs.mkdirSync(modelsDir, { recursive: true });
    fs.writeFileSync(
      path.join(modelsDir, 'README.txt'),
      'This folder should contain the gemma3-270m model files.\n'
    );
    console.log('Created placeholder model directory at', modelsDir);
  }

  // Ensure the python runtime directory exists
  if (!fs.existsSync(pythonRuntimeDir)) {
    fs.mkdirSync(pythonRuntimeDir, { recursive: true });
    fs.writeFileSync(
      path.join(pythonRuntimeDir, 'README.txt'),
      'This folder should contain the portable Python runtime for your platform.\n'
    );
    console.log('Created placeholder python-runtime directory at', pythonRuntimeDir);
  }
}

ensureResources().catch(err => {
  console.error('Error in first-run:', err);
});
