import fs from 'node:fs';

export async function readStdin(): Promise<string> {
  const chunks: Buffer[] = [];
  for await (const chunk of process.stdin) chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  return Buffer.concat(chunks).toString('utf8');
}

export function readPatchFile(filePath: string): string {
  return fs.readFileSync(filePath, 'utf8');
}

export function writeOutput(filePath: string | undefined, content: string): void {
  if (filePath) fs.writeFileSync(filePath, content, 'utf8');
  else process.stdout.write(content);
}
