"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.runPythonScript = runPythonScript;
exports.ocrImage = ocrImage;
const child_process_1 = require("child_process");
const path_1 = __importDefault(require("path"));
/**
 * Runs a Python script located in the packaged resources folder.  The Python
 * runtime is bundled under resources/python-runtime.  This function spawns
 * the interpreter and returns the script's stdout as a string.  Errors are
 * propagated as exceptions.
 */
function runPythonScript(scriptName, args = []) {
    return new Promise((resolve, reject) => {
        // Determine paths for the Python executable and the script
        const resourcesPath = process.env.NODE_ENV === 'development'
            ? path_1.default.join(__dirname, '..', '..', 'python')
            : path_1.default.join(process.resourcesPath, 'python-runtime');
        const pythonExe = process.platform === 'win32' ? 'python.exe' : 'python';
        const pythonPath = path_1.default.join(resourcesPath, pythonExe);
        const scriptPath = process.env.NODE_ENV === 'development'
            ? path_1.default.join(__dirname, '..', '..', 'python', scriptName)
            : path_1.default.join(process.resourcesPath, 'python', scriptName);
        const proc = (0, child_process_1.spawn)(pythonPath, [scriptPath, ...args]);
        let stdout = '';
        let stderr = '';
        proc.stdout.on('data', data => { stdout += data.toString(); });
        proc.stderr.on('data', data => { stderr += data.toString(); });
        proc.on('close', code => {
            if (code === 0)
                resolve(stdout.trim());
            else
                reject(new Error(stderr.trim() || `Python process exited with code ${code}`));
        });
    });
}
// Example OCR wrapper
async function ocrImage(imagePath) {
    return runPythonScript('ocr.py', [imagePath]);
}
