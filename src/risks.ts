import { isGeneratedLike, isLockfile, subsystemFor } from './paths.js';
import type { FilePatch, RiskFinding, SecretFinding } from './types.js';

function finding(risk: RiskFinding): RiskFinding {
  return { ...risk, files: [...new Set(risk.files)].sort() };
}

export function detectRisks(files: FilePatch[], secrets: SecretFinding[]): RiskFinding[] {
  const risks: RiskFinding[] = [];
  if (secrets.length) {
    risks.push(finding({
      class: 'secret',
      level: 'critical',
      message: `${secrets.length} secret-like addition${secrets.length === 1 ? '' : 's'} detected`,
      files: secrets.map((secret) => secret.file)
    }));
  }

  const binary = files.filter((file) => file.isBinary).map((file) => file.path);
  if (binary.length) risks.push(finding({ class: 'binary', level: 'medium', message: 'Binary patch content needs manual review', files: binary }));

  const generated = files.filter((file) => isGeneratedLike(file.path)).map((file) => file.path);
  if (generated.length) risks.push(finding({ class: 'generated', level: 'medium', message: 'Generated or machine-written files changed', files: generated }));

  const hugeGenerated = files.filter((file) => isGeneratedLike(file.path) && file.additions + file.deletions >= 250).map((file) => file.path);
  if (hugeGenerated.length) risks.push(finding({ class: 'huge-generated', level: 'high', message: 'Large generated-file patch can hide meaningful changes', files: hugeGenerated }));

  const lockfiles = files.filter((file) => isLockfile(file.path)).map((file) => file.path);
  if (lockfiles.length) risks.push(finding({ class: 'lockfile', level: 'medium', message: 'Dependency lockfiles changed', files: lockfiles }));

  const large = files.filter((file) => file.additions + file.deletions >= 400 && !isGeneratedLike(file.path)).map((file) => file.path);
  if (large.length) risks.push(finding({ class: 'large-change', level: 'high', message: 'Large source patch deserves focused review', files: large }));

  const deleteHeavy = files.filter((file) => file.deletions >= 100 && file.deletions > file.additions * 2).map((file) => file.path);
  if (deleteHeavy.length) risks.push(finding({ class: 'delete-heavy', level: 'medium', message: 'Deletion-heavy changes can remove behavior or docs', files: deleteHeavy }));

  const sourceTouched = files.some((file) => ['source', 'tooling', 'config'].includes(subsystemFor(file.path)));
  const testsTouched = files.some((file) => subsystemFor(file.path) === 'tests');
  if (sourceTouched && !testsTouched) {
    risks.push(finding({ class: 'missing-tests', level: 'medium', message: 'Source/tooling changed without test files in the patch', files: files.filter((file) => ['source', 'tooling', 'config'].includes(subsystemFor(file.path))).map((file) => file.path) }));
  }

  const docsTouched = files.some((file) => subsystemFor(file.path) === 'docs');
  const publicSurfaceTouched = files.some((file) => /^(src|lib|bin|cli)\//.test(file.path) || /package\.json$/.test(file.path));
  if (publicSurfaceTouched && !docsTouched) {
    risks.push(finding({ class: 'missing-docs', level: 'low', message: 'Public surface changed without documentation updates', files: files.filter((file) => /^(src|lib|bin|cli)\//.test(file.path) || /package\.json$/.test(file.path)).map((file) => file.path) }));
  }

  const order = ['secret', 'huge-generated', 'large-change', 'binary', 'lockfile', 'generated', 'missing-tests', 'delete-heavy', 'missing-docs'];
  return risks.sort((a, b) => order.indexOf(a.class) - order.indexOf(b.class) || a.message.localeCompare(b.message));
}
