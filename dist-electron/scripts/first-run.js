"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
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
    const root = path_1.default.resolve(__dirname, '..');
    const resourcesDir = path_1.default.join(root, 'resources');
    const modelsDir = path_1.default.join(resourcesDir, 'models', 'gemma3-270m');
    const pythonRuntimeDir = path_1.default.join(resourcesDir, 'python-runtime');
    // Ensure the models directory exists with a placeholder file
    if (!fs_1.default.existsSync(modelsDir)) {
        fs_1.default.mkdirSync(modelsDir, { recursive: true });
        fs_1.default.writeFileSync(path_1.default.join(modelsDir, 'README.txt'), 'This folder should contain the gemma3-270m model files.\n');
        console.log('Created placeholder model directory at', modelsDir);
    }
    // Ensure the python runtime directory exists
    if (!fs_1.default.existsSync(pythonRuntimeDir)) {
        fs_1.default.mkdirSync(pythonRuntimeDir, { recursive: true });
        fs_1.default.writeFileSync(path_1.default.join(pythonRuntimeDir, 'README.txt'), 'This folder should contain the portable Python runtime for your platform.\n');
        console.log('Created placeholder python-runtime directory at', pythonRuntimeDir);
    }
}
ensureResources().catch(err => {
    console.error('Error in first-run:', err);
});
