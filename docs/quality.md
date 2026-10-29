# Quality gate

Run `npm ci` and install ShellCheck 0.9 or newer. Run `npm run quality`.
The same command runs in the single-job quality workflow on pull requests and
pushes to main. No secrets, hardware, private data, or paid services are required.

The gate uses ESLint recommended rules plus ineffective catch, empty blocks,
unused variables and disabled inline suppressions; TypeScript strict `checkJs`;
Markdownlint without inline suppressions; ShellCheck including style findings;
Knip for unused files, exports, and dependencies; jscpd for new clones; and Node's
test runner. ESLint warnings have the same failure status as errors. Tool and
configuration failures stop the gate. Checks do not rewrite source files.

`quality-baseline.json` records only findings from the accepted base SHA. Each
fingerprint hashes tool, path, rule, full diagnostic, source line, and occurrence.
Moving a line does not create debt, but adding another identical finding does.
Removed findings do not fail. No count-based allowances apply. New files receive
the same rules. jscpd builds an ephemeral clone baseline from that same Git SHA
using 100 tokens and 8 lines, without network or embedding models.

## Reproduce the baseline

Use a temporary directory containing `git archive BASE_SHA`, initialize a scratch
Git repository and stage that snapshot. Copy only `eslint.config.mjs`,
`tsconfig.json`, and `.markdownlint.json` from the kit. Link the kit's installed
`node_modules` there. From that scratch root run the kit's absolute
`scripts/quality.mjs --write-baseline BASE_SHA` with Node. Compare its
`quality-baseline.json` byte for byte with the committed file, then delete the
scratch directory. Do not generate a baseline from the candidate tree.

The baseline writer is an explicit maintenance tool. Routine quality runs never
update the baseline. A changed baseline requires review against the recorded
base, not regeneration from the candidate. New suppressions are forbidden.

## Negative checks

`npm test` exercises real CLI installs and the commit hook. It also creates a
scratch copy for quality probes. Unused JavaScript, a strict type error, an empty
catch, an inline lint suppression, Markdown heading errors, shell mistakes, an
unused export and a duplicated function must all be rejected. Scratch files are
removed after each run. Missing or broken tools fail separately from findings.

## Existing behavior limits

The shell installer rejects its advertised OpenCode target. Its `all` option
therefore fails after partial installation. The verify helper records these
outcomes and checks the resulting files. This kit changes no installer behavior.
Skill instructions are prose; installing their files does not prove an LLM will
follow them. No paid provider or agent account is needed for these checks.
