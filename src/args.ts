export interface ParsedArgs {
  command: 'scan' | 'suggest-tests' | 'help' | 'version';
  file?: string;
  staged: boolean;
  worktree: boolean;
  stdin: boolean;
  json: boolean;
  out?: string;
  failOn: string[];
}

export function parseArgs(argv: string[]): ParsedArgs {
  const args: ParsedArgs = { command: 'help', staged: false, worktree: false, stdin: false, json: false, failOn: [] };
  const [command, ...rest] = argv;
  if (command === 'scan' || command === 'suggest-tests' || command === 'version' || command === 'help') args.command = command;
  else if (command) throw new Error(`Unknown command: ${command}`);

  for (let index = 0; index < rest.length; index += 1) {
    const item = rest[index];
    if (!item) continue;
    if (item === '--staged') args.staged = true;
    else if (item === '--worktree') args.worktree = true;
    else if (item === '--stdin' || item === '-') args.stdin = true;
    else if (item === '--json') args.json = true;
    else if (item === '--out') {
      const out = rest[++index];
      if (!out) throw new Error('--out requires a file path');
      args.out = out;
    }
    else if (item.startsWith('--out=')) args.out = item.slice('--out='.length);
    else if (item === '--fail-on') args.failOn = (rest[++index] ?? '').split(',');
    else if (item.startsWith('--fail-on=')) args.failOn = item.slice('--fail-on='.length).split(',');
    else if (item.startsWith('-')) throw new Error(`Unknown option: ${item}`);
    else args.file = item;
  }

  const sources = [args.file, args.staged, args.worktree, args.stdin].filter(Boolean).length;
  if ((args.command === 'scan' || args.command === 'suggest-tests') && sources === 0) args.worktree = true;
  if (sources > 1) throw new Error('Choose only one input source: file, --staged, --worktree, or --stdin.');
  return args;
}
