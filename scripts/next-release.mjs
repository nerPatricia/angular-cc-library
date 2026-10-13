#!/usr/bin/env node
// Determines the next release version from Conventional Commits since the last v* tag.
// Uses semantic-release in dry-run mode ONLY for analysis; publishing, committing and
// tagging are done by .github/workflows/publish.yml after a successful npm publish.
//
// Env:
//   RELEASE_BRANCH  branch to analyze (default: master)
//   FORCE_RELEASE   optional patch | minor | major (skips commit analysis)
//   GITHUB_OUTPUT   when set, results are appended as step outputs
import { execFileSync } from 'node:child_process';
import { appendFileSync, readFileSync } from 'node:fs';
import semanticRelease from 'semantic-release';

const branch = process.env.RELEASE_BRANCH || 'master';
const force = (process.env.FORCE_RELEASE || '').trim();
const git = (...args) => execFileSync('git', args, { encoding: 'utf8' }).trim();
const log = (msg) => process.stderr.write(`[next-release] ${msg}\n`);

const outputs = { release: 'false', type: '', version: '', tag: '', baseline_tag: '' };

function lastTag() {
  return git('tag', '--list', 'v*', '--merged', 'HEAD', '--sort=-v:refname').split('\n')[0] || '';
}

function increment(version, type) {
  const [major, minor, patch] = version.split('.').map(Number);
  if (type === 'major') return `${major + 1}.0.0`;
  if (type === 'minor') return `${major}.${minor + 1}.0`;
  return `${major}.${minor}.${patch + 1}`;
}

// Baseline: without any v* tag, tag the commit that introduced the current package.json version.
if (!lastTag()) {
  const { version } = JSON.parse(readFileSync('package.json', 'utf8'));
  const sha =
    git('log', '-1', '--format=%H', `-S"version": "${version}"`, '--', 'package.json') || git('rev-parse', 'HEAD');
  git('tag', `v${version}`, sha);
  outputs.baseline_tag = `v${version}`;
  log(`No v* tags found. Created baseline tag v${version} at ${sha.slice(0, 7)}.`);
}

if (force) {
  if (!['patch', 'minor', 'major'].includes(force)) {
    throw new Error(`Invalid FORCE_RELEASE "${force}". Use patch, minor or major.`);
  }
  const version = increment(lastTag().replace(/^v/, ''), force);
  Object.assign(outputs, { release: 'true', type: force, version, tag: `v${version}` });
  log(`Forced ${force} release: ${version}`);
} else {
  const result = await semanticRelease(
    {
      branches: [branch],
      tagFormat: 'v${version}',
      dryRun: true,
      ci: false,
      plugins: [['@semantic-release/commit-analyzer', { preset: 'conventionalcommits' }]],
    },
    { stdout: process.stderr, stderr: process.stderr },
  );
  if (result && result.nextRelease) {
    const { type, version, gitTag } = result.nextRelease;
    Object.assign(outputs, { release: 'true', type, version, tag: gitTag });
    log(`Next release: ${version} (${type}) since ${result.lastRelease.gitTag || 'beginning'}`);
  } else {
    log('No release-worthy commits (feat, fix, perf or breaking change). Nothing to publish.');
  }
}

const lines = Object.entries(outputs).map(([k, v]) => `${k}=${v}`);
if (process.env.GITHUB_OUTPUT) appendFileSync(process.env.GITHUB_OUTPUT, lines.join('\n') + '\n');
console.log(lines.join('\n'));
