import { spawn } from 'child_process';
import path from 'path';

/**
 * Runs a Python script located in the packaged resources folder.  The Python
 * runtime is bundled under resources/python-runtime.  This function spawns
 * the interpreter and returns the script's stdout as a string.  Errors are
 * propagated as exceptions.
 */
export function runPythonScript(scriptName: string, args: string[] = []): Promise<string> {
  return new Promise((resolve, reject) => {
    // Determine paths for the Python executable and the script
    const resourcesPath = process.env.NODE_ENV === 'development'
      ? path.join(__dirname, '..', '..', 'python')
      : path.join(process.resourcesPath, 'python-runtime');
    const pythonExe = process.platform === 'win32' ? 'python.exe' : 'python';
    const pythonPath = path.join(resourcesPath, pythonExe);
    const scriptPath = process.env.NODE_ENV === 'development'
      ? path.join(__dirname, '..', '..', 'python', scriptName)
      : path.join(process.resourcesPath, 'python', scriptName);

    const proc = spawn(pythonPath, [scriptPath, ...args]);
    let stdout = '';
    let stderr = '';
    proc.stdout.on('data', data => { stdout += data.toString(); });
    proc.stderr.on('data', data => { stderr += data.toString(); });
    proc.on('close', code => {
      if (code === 0) resolve(stdout.trim());
      else reject(new Error(stderr.trim() || `Python process exited with code ${code}`));
    });
  });
}

// Example OCR wrapper
export async function ocrImage(imagePath: string): Promise<string> {
  return runPythonScript('ocr.py', [imagePath]);
}
