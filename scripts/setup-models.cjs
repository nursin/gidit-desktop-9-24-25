const fs = require('fs');
const path = require('path');

/**
 * setup-models.js
 *
 * This script runs during the `postinstall` step to prepare the resources
 * directory with placeholder model and runtime folders.  In a real
 * application this script would download the required AI models and
 * dependencies.  Here it simply ensures that the directory structure
 * exists so that electron-builder can bundle the resources properly.
 */

function ensureDirectory(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

function main() {
  const root = path.resolve(__dirname, '..');
  const resourcesDir = path.join(root, 'resources');
  const modelsDir = path.join(resourcesDir, 'models', 'gemma3-270m');
  const pythonRuntimeDir = path.join(resourcesDir, 'python-runtime');

  ensureDirectory(modelsDir);
  ensureDirectory(pythonRuntimeDir);

  // Create placeholder files to avoid empty directories being pruned
  const modelReadme = path.join(modelsDir, 'README.txt');
  if (!fs.existsSync(modelReadme)) {
    fs.writeFileSync(
      modelReadme,
      'Placeholder for the gemma3-270m model.\nDuring a real build this directory will contain the model files.\n'
    );
  }
  const runtimeReadme = path.join(pythonRuntimeDir, 'README.txt');
  if (!fs.existsSync(runtimeReadme)) {
    fs.writeFileSync(
      runtimeReadme,
      'Placeholder for the portable Python runtime.\nIn production this folder will contain the embedded Python binaries.\n'
    );
  }

  console.log('Resources prepared');
}

main();