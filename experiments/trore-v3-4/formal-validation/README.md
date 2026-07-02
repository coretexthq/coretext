# Coretext Formal Validation Methodology

This directory holds the formal-validation methodology for the `coretext.evaluation.formal-validation` scope.

The methodology is complete, but the experiment has not been executed. Files in this directory define what must be frozen, what evidence must be collected, how contracts are judged, and how Chapter 4 should report the result.

## Artifact Index

- [methodology.md](methodology.md): end-to-end validation protocol and boundaries.
- [contract-matrix.md](contract-matrix.md): contract, fixture, evidence, and pass/fail matrix.
- [fixtures-to-freeze.md](fixtures-to-freeze.md): fixture groups and freeze procedure.
- [evidence-and-classification.md](evidence-and-classification.md): evidence artifacts, dashboard/session-history mapping, and failure taxonomy.
- [report-template.md](report-template.md): Chapter 4 reporting format.

## Execution Boundary

Do not run this experiment against live project hooks or a live target workspace. Formal validation must use frozen fixture copies and isolated temporary workspaces.

Allowed before the experiment:

- static inspection of source files, tests, docs, and thesis text;
- creation of fixture plans and expected-output templates;
- review of existing implementation test names and documented behavior.

Not performed in this methodology session:

- route engine execution on formal fixtures;
- runtime hook execution against a live target;
- dashboard launch or browser inspection;
- fixture hashing;
- final pass/fail scoring.
