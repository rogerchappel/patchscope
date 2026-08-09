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

  if ((args.command === 'help' || args.command === 'version') && rest.length > 0) {
    throw new Error(`${args.command} does not accept operands or options`);
  }

  for (let index = 0; index < rest.length; index += 1) {
    const item = rest[index];
    if (!item) continue;
    if (item === '--staged') args.staged = true;
    else if (item === '--worktree') args.worktree = true;
    else if (item === '--stdin' || item === '-') args.stdin = true;
    else if (item === '--json') args.json = true;
    else if (item === '--out') {
      const out = rest[++index];
      if (!out || out.startsWith('-')) throw new Error('--out requires a file path');
      args.out = out;
    }
    else if (item.startsWith('--out=')) {
      const out = item.slice('--out='.length);
      if (!out) throw new Error('--out requires a file path');
      args.out = out;
    }
    else if (item === '--fail-on') {
      const failOn = rest[++index];
      if (!failOn || failOn.startsWith('-')) throw new Error('--fail-on requires a non-empty class list');
      args.failOn = failOn.split(',');
    }
    else if (item.startsWith('--fail-on=')) {
      const failOn = item.slice('--fail-on='.length);
      if (!failOn) throw new Error('--fail-on requires a non-empty class list');
      args.failOn = failOn.split(',');
    }
    else if (item.startsWith('-')) throw new Error(`Unknown option: ${item}`);
    else {
      if (args.file) throw new Error('Choose only one input source: file, --staged, --worktree, or --stdin.');
      args.file = item;
    }
  }

  const sources = [args.file, args.staged, args.worktree, args.stdin].filter(Boolean).length;
  if ((args.command === 'scan' || args.command === 'suggest-tests') && sources === 0) args.worktree = true;
  if (sources > 1) throw new Error('Choose only one input source: file, --staged, --worktree, or --stdin.');
  return args;
}
