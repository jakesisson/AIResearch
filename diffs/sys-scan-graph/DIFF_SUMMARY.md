# Diff Summary

**Project:** Research Data/sys-scan-graph  
**Repo:** `J-mazz/sys-scan-graph`  
**Commit range:** `d0e0ea8a` → `b9a45064` (researched commit is 1 ahead, 0 behind).
**Category (researched commit):** performance  

[Compare on GitHub](https://github.com/J-mazz/sys-scan-graph/compare/d0e0ea8a9d030175fb196f8f4f30ecf378bd0f10...b9a4506472e8dd660ce3d5d2e2b4f2d076a4d16f)

## Summary

- **Files changed:** 300
- **Lines added:** 17987
- **Lines removed:** 1366

**Themes:** tests, CI/CD, error handling, test coverage, LangGraph workflow, RAG/retrieval, schemas/types, type checking, API/routes, LangChain/LLM, authentication, message trimming

**Tech debt (from TruePositiveCommitsClean):** Performance

## Changes by file

### ✏️ `.github/workflows/ci.yml.disabled`

- **Status:** renamed | **+22** / **-0**
- **Description:** Additions: e.g. python-test:
- **Themes:** tests, CI/CD

### ✏️ `.github/workflows/codeql.yml.disabled`

- **Status:** renamed | **+0** / **-0**
- **Description:** Content changed.

### ✏️ `.github/workflows/release-validate.yml.disabled`

- **Status:** renamed | **+0** / **-0**
- **Description:** Content changed.

### ✏️ `ARCHITECTURE.md`

- **Status:** modified | **+82** / **-50**
- **Description:** Implementation or content updated.
- **Themes:** error handling, tests, test coverage, CI/CD, LangGraph workflow

### ✏️ `CMakeLists.txt`

- **Status:** modified | **+40** / **-2**
- **Description:** Implementation or content updated.
- **Themes:** tests, test coverage, RAG/retrieval

### ✏️ `CXX_OPTIMIZATION_CHECKLIST.md`

- **Status:** modified | **+70** / **-22**
- **Description:** Implementation or content updated.
- **Themes:** CI/CD

### ✏️ `README.md`

- **Status:** modified | **+4** / **-5**
- **Description:** Implementation or content updated.
- **Themes:** test coverage, CI/CD, LangGraph workflow, RAG/retrieval, schemas/types

### ✏️ `agent/__pycache__/__init__.cpython-312.pyc`

- **Status:** modified | **+0** / **-0**
- **Description:** Content changed.

### ✏️ `agent/__pycache__/baseline.cpython-312.pyc`

- **Status:** modified | **+0** / **-0**
- **Description:** Content changed.

### ✏️ `agent/__pycache__/cli.cpython-312.pyc`

- **Status:** modified | **+0** / **-0**
- **Description:** Content changed.

### ✏️ `agent/__pycache__/integrity.cpython-312.pyc`

- **Status:** modified | **+0** / **-0**
- **Description:** Content changed.

### ✏️ `agent/__pycache__/knowledge.cpython-312.pyc`

- **Status:** modified | **+0** / **-0**
- **Description:** Content changed.

### ✏️ `agent/__pycache__/llm.cpython-312.pyc`

- **Status:** modified | **+0** / **-0**
- **Description:** Content changed.

### ✏️ `agent/__pycache__/llm_models.cpython-312.pyc`

- **Status:** modified | **+0** / **-0**
- **Description:** Content changed.

### ✏️ `agent/__pycache__/models.cpython-312.pyc`

- **Status:** modified | **+0** / **-0**
- **Description:** Content changed.

### ✏️ `agent/__pycache__/pipeline.cpython-312.pyc`

- **Status:** modified | **+0** / **-0**
- **Description:** Content changed.

### ✏️ `agent/__pycache__/redaction.cpython-312.pyc`

- **Status:** modified | **+0** / **-0**
- **Description:** Content changed.

### ✏️ `agent/__pycache__/reduction.cpython-312.pyc`

- **Status:** modified | **+0** / **-0**
- **Description:** Content changed.

### ✏️ `agent/__pycache__/rule_gap_miner.cpython-312.pyc`

- **Status:** modified | **+0** / **-0**
- **Description:** Content changed.

### ✏️ `agent/__pycache__/rule_redundancy.cpython-312.pyc`

- **Status:** modified | **+0** / **-0**
- **Description:** Content changed.

### ✏️ `agent/__pycache__/rule_suggest.cpython-312.pyc`

- **Status:** modified | **+0** / **-0**
- **Description:** Content changed.

### ✏️ `agent/__pycache__/rules.cpython-312.pyc`

- **Status:** modified | **+0** / **-0**
- **Description:** Content changed.

### ✏️ `agent/cli.py`

- **Status:** modified | **+8** / **-12**
- **Description:** Imports or dependencies changed.
- **Themes:** type checking, LangGraph workflow, schemas/types

### ✏️ `agent/graph.py`

- **Status:** modified | **+121** / **-10**
- **Description:** Logic or function implementation changed.
- **Themes:** error handling, type checking, CI/CD, LangGraph workflow, RAG/retrieval

### ➕ `agent/graph_nodes_performance.py`

- **Status:** added | **+642** / **-0**
- **Description:** New module with imports.
- **Themes:** error handling, type checking, CI/CD, schemas/types

### ➕ `agent/graph_nodes_reliability.py`

- **Status:** added | **+607** / **-0**
- **Description:** New module with imports.
- **Themes:** error handling, type checking, CI/CD, LangGraph workflow, API/routes

### ➕ `agent/graph_nodes_scalability.py`

- **Status:** added | **+342** / **-0**
- **Description:** New module with imports.
- **Themes:** error handling, CI/CD, LangGraph workflow, API/routes

### ➕ `agent/legacy/knowledge.py`

- **Status:** added | **+4** / **-0**
- **Description:** """

### ➕ `agent/legacy/llm_provider.py`

- **Status:** added | **+4** / **-0**
- **Description:** """

### ➕ `agent/legacy/models.py`

- **Status:** added | **+14** / **-0**
- **Description:** """

### ➕ `agent/legacy/pipeline.py`

- **Status:** added | **+1265** / **-0**
- **Description:** New module with imports.
- **Themes:** error handling, type checking, test coverage, CI/CD, LangGraph workflow

### ➕ `agent/legacy/reduction.py`

- **Status:** added | **+4** / **-0**
- **Description:** """

### ➕ `agent/legacy/rules.py`

- **Status:** added | **+4** / **-0**
- **Description:** """

### ✏️ `agent/pipeline.py`

- **Status:** modified | **+14** / **-1265**
- **Description:** Imports or dependencies changed.
- **Themes:** error handling, type checking, test coverage, CI/CD, LangGraph workflow

### ✏️ `agent/tests/__pycache__/__init__.cpython-312.pyc`

- **Status:** modified | **+0** / **-0**
- **Description:** Content changed.

### ✏️ `agent/tests/__pycache__/test_attack_coverage.cpython-312-pytest-8.4.1.pyc`

- **Status:** modified | **+0** / **-0**
- **Description:** Content changed.

### ✏️ `agent/tests/__pycache__/test_audit.cpython-312-pytest-8.4.1.pyc`

- **Status:** modified | **+0** / **-0**
- **Description:** Content changed.

### ✏️ `agent/tests/__pycache__/test_causal_hypotheses.cpython-312-pytest-8.4.1.pyc`

- **Status:** modified | **+0** / **-0**
- **Description:** Content changed.

### ✏️ `agent/tests/__pycache__/test_compromised_dev_host_snapshot.cpython-312-pytest-8.4.1.pyc`

- **Status:** modified | **+0** / **-0**
- **Description:** Content changed.

### ✏️ `agent/tests/__pycache__/test_counterfactual.cpython-312-pytest-8.4.1.pyc`

- **Status:** modified | **+0** / **-0**
- **Description:** Content changed.

### ✏️ `agent/tests/__pycache__/test_fleet_report_schema.cpython-312-pytest-8.4.1.pyc`

- **Status:** modified | **+0** / **-0**
- **Description:** Content changed.

### ✏️ `agent/tests/__pycache__/test_input_security.cpython-312-pytest-8.4.1.pyc`

- **Status:** modified | **+0** / **-0**
- **Description:** Content changed.

### ✏️ `agent/tests/__pycache__/test_integrity.cpython-312-pytest-8.4.1.pyc`

- **Status:** modified | **+0** / **-0**
- **Description:** Content changed.

### ✏️ `agent/tests/__pycache__/test_metric_drift.cpython-312-pytest-8.4.1.pyc`

- **Status:** modified | **+0** / **-0**
- **Description:** Content changed.

### ✏️ `agent/tests/__pycache__/test_policy.cpython-312-pytest-8.4.1.pyc`

- **Status:** modified | **+0** / **-0**
- **Description:** Content changed.

### ✏️ `agent/tests/__pycache__/test_process_novelty.cpython-312-pytest-8.4.1.pyc`

- **Status:** modified | **+0** / **-0**
- **Description:** Content changed.

### ✏️ `agent/tests/__pycache__/test_redaction.cpython-312-pytest-8.4.1.pyc`

- **Status:** modified | **+0** / **-0**
- **Description:** Content changed.

### ✏️ `agent/tests/__pycache__/test_reduction_snapshot.cpython-312-pytest-8.4.1.pyc`

- **Status:** modified | **+0** / **-0**
- **Description:** Content changed.

### ✏️ `agent/tests/__pycache__/test_rule_gap_miner.cpython-312-pytest-8.4.1.pyc`

- **Status:** modified | **+0** / **-0**
- **Description:** Content changed.

### ✏️ `agent/tests/__pycache__/test_rule_gap_refinement.cpython-312-pytest-8.4.1.pyc`

- **Status:** modified | **+0** / **-0**
- **Description:** Content changed.

### ✏️ `agent/tests/__pycache__/test_rule_redundancy.cpython-312-pytest-8.4.1.pyc`

- **Status:** modified | **+0** / **-0**
- **Description:** Content changed.

### ✏️ `agent/tests/__pycache__/test_rule_suggest.cpython-312-pytest-8.4.1.pyc`

- **Status:** modified | **+0** / **-0**
- **Description:** Content changed.

### ✏️ `agent/tests/__pycache__/test_sequence_correlation.cpython-312-pytest-8.4.1.pyc`

- **Status:** modified | **+0** / **-0**
- **Description:** Content changed.

### ➕ `agent/venv/bin/Activate.ps1`

- **Status:** added | **+247** / **-0**
- **Description:** <#
- **Themes:** tests, type checking, CI/CD

### ➕ `agent/venv/bin/activate`

- **Status:** added | **+70** / **-0**
- **Description:** # This file must be used with "source bin/activate" *from bash*

### ➕ `agent/venv/bin/activate.csh`

- **Status:** added | **+27** / **-0**
- **Description:** # This file must be used with "source bin/activate.csh" *from csh*.
- **Themes:** tests

### ➕ `agent/venv/bin/activate.fish`

- **Status:** added | **+69** / **-0**
- **Description:** # This file must be used with "source <venv>/bin/activate.fish" *from fish*
- **Themes:** tests

### ➕ `agent/venv/bin/f2py`

- **Status:** added | **+8** / **-0**
- **Description:** #!/home/joseph-mazzini/sys-scan-graph/agent/venv/bin/python3

### ➕ `agent/venv/bin/httpx`

- **Status:** added | **+8** / **-0**
- **Description:** #!/home/joseph-mazzini/sys-scan-graph/agent/venv/bin/python3

### ➕ `agent/venv/bin/jsondiff`

- **Status:** added | **+41** / **-0**
- **Description:** #!/home/joseph-mazzini/sys-scan-graph/agent/venv/bin/python3
- **Themes:** error handling, CI/CD

### ➕ `agent/venv/bin/jsonpatch`

- **Status:** added | **+107** / **-0**
- **Description:** #!/home/joseph-mazzini/sys-scan-graph/agent/venv/bin/python3
- **Themes:** error handling, CI/CD

### ➕ `agent/venv/bin/jsonpointer`

- **Status:** added | **+67** / **-0**
- **Description:** #!/home/joseph-mazzini/sys-scan-graph/agent/venv/bin/python3
- **Themes:** error handling

### ➕ `agent/venv/bin/jsonschema`

- **Status:** added | **+8** / **-0**
- **Description:** #!/home/joseph-mazzini/sys-scan-graph/agent/venv/bin/python3
- **Themes:** schemas/types

### ➕ `agent/venv/bin/langchain-server`

- **Status:** added | **+8** / **-0**
- **Description:** #!/home/joseph-mazzini/sys-scan-graph/agent/venv/bin/python3
- **Themes:** LangChain/LLM

### ➕ `agent/venv/bin/langsmith`

- **Status:** added | **+8** / **-0**
- **Description:** #!/home/joseph-mazzini/sys-scan-graph/agent/venv/bin/python3

### ➕ `agent/venv/bin/markdown-it`

- **Status:** added | **+8** / **-0**
- **Description:** #!/home/joseph-mazzini/sys-scan-graph/agent/venv/bin/python3

### ➕ `agent/venv/bin/normalizer`

- **Status:** added | **+8** / **-0**
- **Description:** #!/home/joseph-mazzini/sys-scan-graph/agent/venv/bin/python3

### ➕ `agent/venv/bin/pip`

- **Status:** added | **+8** / **-0**
- **Description:** #!/home/joseph-mazzini/sys-scan-graph/agent/venv/bin/python3

### ➕ `agent/venv/bin/pip3`

- **Status:** added | **+8** / **-0**
- **Description:** #!/home/joseph-mazzini/sys-scan-graph/agent/venv/bin/python3

### ➕ `agent/venv/bin/pip3.12`

- **Status:** added | **+8** / **-0**
- **Description:** #!/home/joseph-mazzini/sys-scan-graph/agent/venv/bin/python3

### ➕ `agent/venv/bin/py.test`

- **Status:** added | **+8** / **-0**
- **Description:** #!/home/joseph-mazzini/sys-scan-graph/agent/venv/bin/python3
- **Themes:** tests

### ➕ `agent/venv/bin/pygmentize`

- **Status:** added | **+8** / **-0**
- **Description:** #!/home/joseph-mazzini/sys-scan-graph/agent/venv/bin/python3

### ➕ `agent/venv/bin/pytest`

- **Status:** added | **+8** / **-0**
- **Description:** #!/home/joseph-mazzini/sys-scan-graph/agent/venv/bin/python3
- **Themes:** tests

### ➕ `agent/venv/bin/python`

- **Status:** added | **+1** / **-0**
- **Description:** python3

### ➕ `agent/venv/bin/python3`

- **Status:** added | **+1** / **-0**
- **Description:** /usr/bin/python3

### ➕ `agent/venv/bin/python3.12`

- **Status:** added | **+1** / **-0**
- **Description:** python3

### ➕ `agent/venv/bin/typer`

- **Status:** added | **+8** / **-0**
- **Description:** #!/home/joseph-mazzini/sys-scan-graph/agent/venv/bin/python3

### ➕ `agent/venv/include/site/python3.12/greenlet/greenlet.h`

- **Status:** added | **+164** / **-0**
- **Description:** /* -*- indent-tabs-mode: nil; tab-width: 4; -*- */
- **Themes:** type checking, API/routes

### ➕ `agent/venv/lib/python3.12/site-packages/PyNaCl-1.5.0.dist-info/INSTALLER`

- **Status:** added | **+1** / **-0**
- **Description:** pip

### ➕ `agent/venv/lib/python3.12/site-packages/PyNaCl-1.5.0.dist-info/LICENSE`

- **Status:** added | **+174** / **-0**
- **Description:** Apache License
- **Themes:** type checking, CI/CD, authentication

### ➕ `agent/venv/lib/python3.12/site-packages/PyNaCl-1.5.0.dist-info/METADATA`

- **Status:** added | **+245** / **-0**
- **Description:** Metadata-Version: 2.1
- **Themes:** error handling, tests, type checking, test coverage, CI/CD

### ➕ `agent/venv/lib/python3.12/site-packages/PyNaCl-1.5.0.dist-info/RECORD`

- **Status:** added | **+69** / **-0**
- **Description:** PyNaCl-1.5.0.dist-info/INSTALLER,sha256=zuuue4knoyJ-UwPPXg8fezS7VCrXJQrAP7zeN...
- **Themes:** CI/CD

### ➕ `agent/venv/lib/python3.12/site-packages/PyNaCl-1.5.0.dist-info/REQUESTED`

- **Status:** added | **+0** / **-0**
- **Description:** Content changed.

### ➕ `agent/venv/lib/python3.12/site-packages/PyNaCl-1.5.0.dist-info/WHEEL`

- **Status:** added | **+7** / **-0**
- **Description:** Wheel-Version: 1.0

### ➕ `agent/venv/lib/python3.12/site-packages/PyNaCl-1.5.0.dist-info/top_level.txt`

- **Status:** added | **+2** / **-0**
- **Description:** _sodium

### ➕ `agent/venv/lib/python3.12/site-packages/PyYAML-6.0.2.dist-info/INSTALLER`

- **Status:** added | **+1** / **-0**
- **Description:** pip

### ➕ `agent/venv/lib/python3.12/site-packages/PyYAML-6.0.2.dist-info/LICENSE`

- **Status:** added | **+20** / **-0**
- **Description:** Copyright (c) 2017-2021 Ingy döt Net
- **Themes:** type checking, CI/CD, authentication

### ➕ `agent/venv/lib/python3.12/site-packages/PyYAML-6.0.2.dist-info/METADATA`

- **Status:** added | **+46** / **-0**
- **Description:** Metadata-Version: 2.1
- **Themes:** CI/CD, API/routes, authentication

### ➕ `agent/venv/lib/python3.12/site-packages/PyYAML-6.0.2.dist-info/RECORD`

- **Status:** added | **+44** / **-0**
- **Description:** PyYAML-6.0.2.dist-info/INSTALLER,sha256=zuuue4knoyJ-UwPPXg8fezS7VCrXJQrAP7zeN...
- **Themes:** CI/CD, RAG/retrieval, authentication

### ➕ `agent/venv/lib/python3.12/site-packages/PyYAML-6.0.2.dist-info/REQUESTED`

- **Status:** added | **+0** / **-0**
- **Description:** Content changed.

### ➕ `agent/venv/lib/python3.12/site-packages/PyYAML-6.0.2.dist-info/WHEEL`

- **Status:** added | **+6** / **-0**
- **Description:** Wheel-Version: 1.0

### ➕ `agent/venv/lib/python3.12/site-packages/PyYAML-6.0.2.dist-info/top_level.txt`

- **Status:** added | **+2** / **-0**
- **Description:** _yaml

### ➕ `agent/venv/lib/python3.12/site-packages/_pytest/__init__.py`

- **Status:** added | **+13** / **-0**
- **Description:** New module with imports.
- **Themes:** error handling, RAG/retrieval

### ➕ `agent/venv/lib/python3.12/site-packages/_pytest/_argcomplete.py`

- **Status:** added | **+117** / **-0**
- **Description:** """Allow bash-completion for argparse with argcomplete if installed.
- **Themes:** error handling, CI/CD

### ➕ `agent/venv/lib/python3.12/site-packages/_pytest/_code/__init__.py`

- **Status:** added | **+26** / **-0**
- **Description:** """Python inspection/code generation API."""
- **Themes:** error handling, API/routes

### ➕ `agent/venv/lib/python3.12/site-packages/_pytest/_code/code.py`

- **Status:** added | **+1567** / **-0**
- **Description:** # mypy: allow-untyped-defs
- **Themes:** error handling, tests, type checking, CI/CD, RAG/retrieval

### ➕ `agent/venv/lib/python3.12/site-packages/_pytest/_code/source.py`

- **Status:** added | **+225** / **-0**
- **Description:** # mypy: allow-untyped-defs
- **Themes:** error handling, type checking, RAG/retrieval, authentication

### ➕ `agent/venv/lib/python3.12/site-packages/_pytest/_io/__init__.py`

- **Status:** added | **+10** / **-0**
- **Description:** New module with imports.

### ➕ `agent/venv/lib/python3.12/site-packages/_pytest/_io/pprint.py`

- **Status:** added | **+673** / **-0**
- **Description:** # mypy: allow-untyped-defs
- **Themes:** error handling, type checking, CI/CD, authentication

### ➕ `agent/venv/lib/python3.12/site-packages/_pytest/_io/saferepr.py`

- **Status:** added | **+130** / **-0**
- **Description:** New module with imports.
- **Themes:** error handling, CI/CD

### ➕ `agent/venv/lib/python3.12/site-packages/_pytest/_io/terminalwriter.py`

- **Status:** added | **+254** / **-0**
- **Description:** """Helper functions for writing to terminals and files."""
- **Themes:** error handling, tests, CI/CD, API/routes

### ➕ `agent/venv/lib/python3.12/site-packages/_pytest/_io/wcwidth.py`

- **Status:** added | **+57** / **-0**
- **Description:** New module with imports.
- **Themes:** CI/CD

### ➕ `agent/venv/lib/python3.12/site-packages/_pytest/_py/__init__.py`

- **Status:** added | **+0** / **-0**
- **Description:** Content changed.

### ➕ `agent/venv/lib/python3.12/site-packages/_pytest/_py/error.py`

- **Status:** added | **+119** / **-0**
- **Description:** """create errno-specific classes for IO or os calls."""
- **Themes:** error handling, type checking, CI/CD

### ➕ `agent/venv/lib/python3.12/site-packages/_pytest/_py/path.py`

- **Status:** added | **+1475** / **-0**
- **Description:** # mypy: allow-untyped-defs
- **Themes:** error handling, tests, type checking, CI/CD

### ➕ `agent/venv/lib/python3.12/site-packages/_pytest/_version.py`

- **Status:** added | **+21** / **-0**
- **Description:** # file generated by setuptools-scm
- **Themes:** type checking

### ➕ `agent/venv/lib/python3.12/site-packages/_pytest/assertion/__init__.py`

- **Status:** added | **+208** / **-0**
- **Description:** # mypy: allow-untyped-defs
- **Themes:** tests, type checking, CI/CD

### ➕ `agent/venv/lib/python3.12/site-packages/_pytest/assertion/rewrite.py`

- **Status:** added | **+1216** / **-0**
- **Description:** """Rewrite assertion AST to produce nice error messages."""
- **Themes:** message trimming, error handling, tests, type checking, CI/CD

### ➕ `agent/venv/lib/python3.12/site-packages/_pytest/assertion/truncate.py`

- **Status:** added | **+137** / **-0**
- **Description:** """Utilities for truncating assertion output.
- **Themes:** tests, CI/CD

### ➕ `agent/venv/lib/python3.12/site-packages/_pytest/assertion/util.py`

- **Status:** added | **+621** / **-0**
- **Description:** # mypy: allow-untyped-defs
- **Themes:** error handling, tests, type checking, CI/CD, API/routes

### ➕ `agent/venv/lib/python3.12/site-packages/_pytest/cacheprovider.py`

- **Status:** added | **+625** / **-0**
- **Description:** # mypy: allow-untyped-defs
- **Themes:** error handling, tests, type checking, CI/CD

### ➕ `agent/venv/lib/python3.12/site-packages/_pytest/capture.py`

- **Status:** added | **+1144** / **-0**
- **Description:** # mypy: allow-untyped-defs
- **Themes:** error handling, tests, type checking, CI/CD

### ➕ `agent/venv/lib/python3.12/site-packages/_pytest/compat.py`

- **Status:** added | **+322** / **-0**
- **Description:** # mypy: allow-untyped-defs
- **Themes:** error handling, tests, type checking, CI/CD, authentication

### ➕ `agent/venv/lib/python3.12/site-packages/_pytest/config/__init__.py`

- **Status:** added | **+2029** / **-0**
- **Description:** # mypy: allow-untyped-defs
- **Themes:** error handling, tests, type checking, CI/CD, RAG/retrieval

### ➕ `agent/venv/lib/python3.12/site-packages/_pytest/config/argparsing.py`

- **Status:** added | **+533** / **-0**
- **Description:** # mypy: allow-untyped-defs
- **Themes:** error handling, tests, type checking, CI/CD

### ➕ `agent/venv/lib/python3.12/site-packages/_pytest/config/compat.py`

- **Status:** added | **+85** / **-0**
- **Description:** New module with imports.
- **Themes:** tests

### ➕ `agent/venv/lib/python3.12/site-packages/_pytest/config/exceptions.py`

- **Status:** added | **+13** / **-0**
- **Description:** New module with imports.
- **Themes:** tests

### ➕ `agent/venv/lib/python3.12/site-packages/_pytest/config/findpaths.py`

- **Status:** added | **+239** / **-0**
- **Description:** New module with imports.
- **Themes:** error handling, tests, type checking

### ➕ `agent/venv/lib/python3.12/site-packages/_pytest/debugging.py`

- **Status:** added | **+407** / **-0**
- **Description:** # mypy: allow-untyped-defs
- **Themes:** error handling, tests, type checking, CI/CD

### ➕ `agent/venv/lib/python3.12/site-packages/_pytest/deprecated.py`

- **Status:** added | **+91** / **-0**
- **Description:** """Deprecation messages and bits of code used elsewhere in the codebase that
- **Themes:** error handling, tests, type checking

### ➕ `agent/venv/lib/python3.12/site-packages/_pytest/doctest.py`

- **Status:** added | **+754** / **-0**
- **Description:** # mypy: allow-untyped-defs
- **Themes:** message trimming, error handling, tests, type checking, CI/CD

### ➕ `agent/venv/lib/python3.12/site-packages/_pytest/faulthandler.py`

- **Status:** added | **+105** / **-0**
- **Description:** New module with imports.
- **Themes:** error handling, tests, API/routes

### ➕ `agent/venv/lib/python3.12/site-packages/_pytest/fixtures.py`

- **Status:** added | **+0** / **-0**
- **Description:** Content changed.

### ➕ `agent/venv/lib/python3.12/site-packages/_pytest/freeze_support.py`

- **Status:** added | **+0** / **-0**
- **Description:** Content changed.

### ➕ `agent/venv/lib/python3.12/site-packages/_pytest/helpconfig.py`

- **Status:** added | **+0** / **-0**
- **Description:** Content changed.

### ➕ `agent/venv/lib/python3.12/site-packages/_pytest/hookspec.py`

- **Status:** added | **+0** / **-0**
- **Description:** Content changed.

### ➕ `agent/venv/lib/python3.12/site-packages/_pytest/junitxml.py`

- **Status:** added | **+0** / **-0**
- **Description:** Content changed.

### ➕ `agent/venv/lib/python3.12/site-packages/_pytest/legacypath.py`

- **Status:** added | **+0** / **-0**
- **Description:** Content changed.

### ➕ `agent/venv/lib/python3.12/site-packages/_pytest/logging.py`

- **Status:** added | **+0** / **-0**
- **Description:** Content changed.

### ➕ `agent/venv/lib/python3.12/site-packages/_pytest/main.py`

- **Status:** added | **+0** / **-0**
- **Description:** Content changed.

### ➕ `agent/venv/lib/python3.12/site-packages/_pytest/mark/__init__.py`

- **Status:** added | **+0** / **-0**
- **Description:** Content changed.

### ➕ `agent/venv/lib/python3.12/site-packages/_pytest/mark/expression.py`

- **Status:** added | **+0** / **-0**
- **Description:** Content changed.

### ➕ `agent/venv/lib/python3.12/site-packages/_pytest/mark/structures.py`

- **Status:** added | **+0** / **-0**
- **Description:** Content changed.

### ➕ `agent/venv/lib/python3.12/site-packages/_pytest/monkeypatch.py`

- **Status:** added | **+0** / **-0**
- **Description:** Content changed.

### ➕ `agent/venv/lib/python3.12/site-packages/_pytest/nodes.py`

- **Status:** added | **+0** / **-0**
- **Description:** Content changed.

### ➕ `agent/venv/lib/python3.12/site-packages/_pytest/outcomes.py`

- **Status:** added | **+0** / **-0**
- **Description:** Content changed.

### ➕ `agent/venv/lib/python3.12/site-packages/_pytest/pastebin.py`

- **Status:** added | **+0** / **-0**
- **Description:** Content changed.

### ➕ `agent/venv/lib/python3.12/site-packages/_pytest/pathlib.py`

- **Status:** added | **+0** / **-0**
- **Description:** Content changed.

### ➕ `agent/venv/lib/python3.12/site-packages/_pytest/py.typed`

- **Status:** added | **+0** / **-0**
- **Description:** Content changed.

### ➕ `agent/venv/lib/python3.12/site-packages/_pytest/pytester.py`

- **Status:** added | **+0** / **-0**
- **Description:** Content changed.

### ➕ `agent/venv/lib/python3.12/site-packages/_pytest/pytester_assertions.py`

- **Status:** added | **+0** / **-0**
- **Description:** Content changed.

### ➕ `agent/venv/lib/python3.12/site-packages/_pytest/python.py`

- **Status:** added | **+0** / **-0**
- **Description:** Content changed.

### ➕ `agent/venv/lib/python3.12/site-packages/_pytest/python_api.py`

- **Status:** added | **+0** / **-0**
- **Description:** Content changed.

### ➕ `agent/venv/lib/python3.12/site-packages/_pytest/raises.py`

- **Status:** added | **+0** / **-0**
- **Description:** Content changed.

### ➕ `agent/venv/lib/python3.12/site-packages/_pytest/recwarn.py`

- **Status:** added | **+0** / **-0**
- **Description:** Content changed.

### ➕ `agent/venv/lib/python3.12/site-packages/_pytest/reports.py`

- **Status:** added | **+0** / **-0**
- **Description:** Content changed.

### ➕ `agent/venv/lib/python3.12/site-packages/_pytest/runner.py`

- **Status:** added | **+0** / **-0**
- **Description:** Content changed.

### ➕ `agent/venv/lib/python3.12/site-packages/_pytest/scope.py`

- **Status:** added | **+0** / **-0**
- **Description:** Content changed.

### ➕ `agent/venv/lib/python3.12/site-packages/_pytest/setuponly.py`

- **Status:** added | **+0** / **-0**
- **Description:** Content changed.

### ➕ `agent/venv/lib/python3.12/site-packages/_pytest/setupplan.py`

- **Status:** added | **+0** / **-0**
- **Description:** Content changed.

### ➕ `agent/venv/lib/python3.12/site-packages/_pytest/skipping.py`

- **Status:** added | **+0** / **-0**
- **Description:** Content changed.

### ➕ `agent/venv/lib/python3.12/site-packages/_pytest/stash.py`

- **Status:** added | **+0** / **-0**
- **Description:** Content changed.

### ➕ `agent/venv/lib/python3.12/site-packages/_pytest/stepwise.py`

- **Status:** added | **+0** / **-0**
- **Description:** Content changed.

### ➕ `agent/venv/lib/python3.12/site-packages/_pytest/terminal.py`

- **Status:** added | **+0** / **-0**
- **Description:** Content changed.

### ➕ `agent/venv/lib/python3.12/site-packages/_pytest/threadexception.py`

- **Status:** added | **+0** / **-0**
- **Description:** Content changed.

### ➕ `agent/venv/lib/python3.12/site-packages/_pytest/timing.py`

- **Status:** added | **+0** / **-0**
- **Description:** Content changed.

### ➕ `agent/venv/lib/python3.12/site-packages/_pytest/tmpdir.py`

- **Status:** added | **+0** / **-0**
- **Description:** Content changed.

### ➕ `agent/venv/lib/python3.12/site-packages/_pytest/tracemalloc.py`

- **Status:** added | **+0** / **-0**
- **Description:** Content changed.

### ➕ `agent/venv/lib/python3.12/site-packages/_pytest/unittest.py`

- **Status:** added | **+0** / **-0**
- **Description:** Content changed.

### ➕ `agent/venv/lib/python3.12/site-packages/_pytest/unraisableexception.py`

- **Status:** added | **+0** / **-0**
- **Description:** Content changed.

### ➕ `agent/venv/lib/python3.12/site-packages/_pytest/warning_types.py`

- **Status:** added | **+0** / **-0**
- **Description:** Content changed.

### ➕ `agent/venv/lib/python3.12/site-packages/_pytest/warnings.py`

- **Status:** added | **+0** / **-0**
- **Description:** Content changed.

### ➕ `agent/venv/lib/python3.12/site-packages/_yaml/__init__.py`

- **Status:** added | **+0** / **-0**
- **Description:** Content changed.

### ➕ `agent/venv/lib/python3.12/site-packages/aiohappyeyeballs-2.6.1.dist-info/INSTALLER`

- **Status:** added | **+0** / **-0**
- **Description:** Content changed.

### ➕ `agent/venv/lib/python3.12/site-packages/aiohappyeyeballs-2.6.1.dist-info/LICENSE`

- **Status:** added | **+0** / **-0**
- **Description:** Content changed.

### ➕ `agent/venv/lib/python3.12/site-packages/aiohappyeyeballs-2.6.1.dist-info/METADATA`

- **Status:** added | **+0** / **-0**
- **Description:** Content changed.

### ➕ `agent/venv/lib/python3.12/site-packages/aiohappyeyeballs-2.6.1.dist-info/RECORD`

- **Status:** added | **+0** / **-0**
- **Description:** Content changed.

### ➕ `agent/venv/lib/python3.12/site-packages/aiohappyeyeballs-2.6.1.dist-info/WHEEL`

- **Status:** added | **+0** / **-0**
- **Description:** Content changed.

### ➕ `agent/venv/lib/python3.12/site-packages/aiohappyeyeballs/__init__.py`

- **Status:** added | **+0** / **-0**
- **Description:** Content changed.

### ➕ `agent/venv/lib/python3.12/site-packages/aiohappyeyeballs/_staggered.py`

- **Status:** added | **+0** / **-0**
- **Description:** Content changed.

### ➕ `agent/venv/lib/python3.12/site-packages/aiohappyeyeballs/impl.py`

- **Status:** added | **+0** / **-0**
- **Description:** Content changed.

### ➕ `agent/venv/lib/python3.12/site-packages/aiohappyeyeballs/py.typed`

- **Status:** added | **+0** / **-0**
- **Description:** Content changed.

### ➕ `agent/venv/lib/python3.12/site-packages/aiohappyeyeballs/types.py`

- **Status:** added | **+0** / **-0**
- **Description:** Content changed.

### ➕ `agent/venv/lib/python3.12/site-packages/aiohappyeyeballs/utils.py`

- **Status:** added | **+0** / **-0**
- **Description:** Content changed.

### ➕ `agent/venv/lib/python3.12/site-packages/aiohttp-3.12.15.dist-info/INSTALLER`

- **Status:** added | **+0** / **-0**
- **Description:** Content changed.

### ➕ `agent/venv/lib/python3.12/site-packages/aiohttp-3.12.15.dist-info/METADATA`

- **Status:** added | **+0** / **-0**
- **Description:** Content changed.

### ➕ `agent/venv/lib/python3.12/site-packages/aiohttp-3.12.15.dist-info/RECORD`

- **Status:** added | **+0** / **-0**
- **Description:** Content changed.

### ➕ `agent/venv/lib/python3.12/site-packages/aiohttp-3.12.15.dist-info/WHEEL`

- **Status:** added | **+0** / **-0**
- **Description:** Content changed.

### ➕ `agent/venv/lib/python3.12/site-packages/aiohttp-3.12.15.dist-info/licenses/LICENSE.txt`

- **Status:** added | **+0** / **-0**
- **Description:** Content changed.

### ➕ `agent/venv/lib/python3.12/site-packages/aiohttp-3.12.15.dist-info/licenses/vendor/llhttp/LICENSE`

- **Status:** added | **+0** / **-0**
- **Description:** Content changed.

### ➕ `agent/venv/lib/python3.12/site-packages/aiohttp-3.12.15.dist-info/top_level.txt`

- **Status:** added | **+0** / **-0**
- **Description:** Content changed.

### ➕ `agent/venv/lib/python3.12/site-packages/aiohttp/.hash/_cparser.pxd.hash`

- **Status:** added | **+0** / **-0**
- **Description:** Content changed.

### ➕ `agent/venv/lib/python3.12/site-packages/aiohttp/.hash/_find_header.pxd.hash`

- **Status:** added | **+0** / **-0**
- **Description:** Content changed.

### ➕ `agent/venv/lib/python3.12/site-packages/aiohttp/.hash/_http_parser.pyx.hash`

- **Status:** added | **+0** / **-0**
- **Description:** Content changed.

### ➕ `agent/venv/lib/python3.12/site-packages/aiohttp/.hash/_http_writer.pyx.hash`

- **Status:** added | **+0** / **-0**
- **Description:** Content changed.

### ➕ `agent/venv/lib/python3.12/site-packages/aiohttp/.hash/hdrs.py.hash`

- **Status:** added | **+0** / **-0**
- **Description:** Content changed.

### ➕ `agent/venv/lib/python3.12/site-packages/aiohttp/__init__.py`

- **Status:** added | **+0** / **-0**
- **Description:** Content changed.

### ➕ `agent/venv/lib/python3.12/site-packages/aiohttp/_cookie_helpers.py`

- **Status:** added | **+0** / **-0**
- **Description:** Content changed.

### ➕ `agent/venv/lib/python3.12/site-packages/aiohttp/_cparser.pxd`

- **Status:** added | **+0** / **-0**
- **Description:** Content changed.

### ➕ `agent/venv/lib/python3.12/site-packages/aiohttp/_find_header.pxd`

- **Status:** added | **+0** / **-0**
- **Description:** Content changed.

### ➕ `agent/venv/lib/python3.12/site-packages/aiohttp/_headers.pxi`

- **Status:** added | **+0** / **-0**
- **Description:** Content changed.

### ➕ `agent/venv/lib/python3.12/site-packages/aiohttp/_http_parser.pyx`

- **Status:** added | **+0** / **-0**
- **Description:** Content changed.

### ➕ `agent/venv/lib/python3.12/site-packages/aiohttp/_http_writer.pyx`

- **Status:** added | **+0** / **-0**
- **Description:** Content changed.

### ➕ `agent/venv/lib/python3.12/site-packages/aiohttp/_websocket/.hash/mask.pxd.hash`

- **Status:** added | **+0** / **-0**
- **Description:** Content changed.

### ➕ `agent/venv/lib/python3.12/site-packages/aiohttp/_websocket/.hash/mask.pyx.hash`

- **Status:** added | **+0** / **-0**
- **Description:** Content changed.

### ➕ `agent/venv/lib/python3.12/site-packages/aiohttp/_websocket/.hash/reader_c.pxd.hash`

- **Status:** added | **+0** / **-0**
- **Description:** Content changed.

### ➕ `agent/venv/lib/python3.12/site-packages/aiohttp/_websocket/__init__.py`

- **Status:** added | **+0** / **-0**
- **Description:** Content changed.

### ➕ `agent/venv/lib/python3.12/site-packages/aiohttp/_websocket/helpers.py`

- **Status:** added | **+0** / **-0**
- **Description:** Content changed.

### ➕ `agent/venv/lib/python3.12/site-packages/aiohttp/_websocket/mask.pxd`

- **Status:** added | **+0** / **-0**
- **Description:** Content changed.

### ➕ `agent/venv/lib/python3.12/site-packages/aiohttp/_websocket/mask.pyx`

- **Status:** added | **+0** / **-0**
- **Description:** Content changed.

### ➕ `agent/venv/lib/python3.12/site-packages/aiohttp/_websocket/models.py`

- **Status:** added | **+0** / **-0**
- **Description:** Content changed.

### ➕ `agent/venv/lib/python3.12/site-packages/aiohttp/_websocket/reader.py`

- **Status:** added | **+0** / **-0**
- **Description:** Content changed.

### ➕ `agent/venv/lib/python3.12/site-packages/aiohttp/_websocket/reader_c.pxd`

- **Status:** added | **+0** / **-0**
- **Description:** Content changed.

### ➕ `agent/venv/lib/python3.12/site-packages/aiohttp/_websocket/reader_c.py`

- **Status:** added | **+0** / **-0**
- **Description:** Content changed.

### ➕ `agent/venv/lib/python3.12/site-packages/aiohttp/_websocket/reader_py.py`

- **Status:** added | **+0** / **-0**
- **Description:** Content changed.

### ➕ `agent/venv/lib/python3.12/site-packages/aiohttp/_websocket/writer.py`

- **Status:** added | **+0** / **-0**
- **Description:** Content changed.

### ➕ `agent/venv/lib/python3.12/site-packages/aiohttp/abc.py`

- **Status:** added | **+0** / **-0**
- **Description:** Content changed.

### ➕ `agent/venv/lib/python3.12/site-packages/aiohttp/base_protocol.py`

- **Status:** added | **+0** / **-0**
- **Description:** Content changed.

### ➕ `agent/venv/lib/python3.12/site-packages/aiohttp/client.py`

- **Status:** added | **+0** / **-0**
- **Description:** Content changed.

### ➕ `agent/venv/lib/python3.12/site-packages/aiohttp/client_exceptions.py`

- **Status:** added | **+0** / **-0**
- **Description:** Content changed.

### ➕ `agent/venv/lib/python3.12/site-packages/aiohttp/client_middleware_digest_auth.py`

- **Status:** added | **+0** / **-0**
- **Description:** Content changed.

### ➕ `agent/venv/lib/python3.12/site-packages/aiohttp/client_middlewares.py`

- **Status:** added | **+0** / **-0**
- **Description:** Content changed.

### ➕ `agent/venv/lib/python3.12/site-packages/aiohttp/client_proto.py`

- **Status:** added | **+0** / **-0**
- **Description:** Content changed.

### ➕ `agent/venv/lib/python3.12/site-packages/aiohttp/client_reqrep.py`

- **Status:** added | **+0** / **-0**
- **Description:** Content changed.

### ➕ `agent/venv/lib/python3.12/site-packages/aiohttp/client_ws.py`

- **Status:** added | **+0** / **-0**
- **Description:** Content changed.

### ➕ `agent/venv/lib/python3.12/site-packages/aiohttp/compression_utils.py`

- **Status:** added | **+0** / **-0**
- **Description:** Content changed.

### ➕ `agent/venv/lib/python3.12/site-packages/aiohttp/connector.py`

- **Status:** added | **+0** / **-0**
- **Description:** Content changed.

### ➕ `agent/venv/lib/python3.12/site-packages/aiohttp/cookiejar.py`

- **Status:** added | **+0** / **-0**
- **Description:** Content changed.

### ➕ `agent/venv/lib/python3.12/site-packages/aiohttp/formdata.py`

- **Status:** added | **+0** / **-0**
- **Description:** Content changed.

### ➕ `agent/venv/lib/python3.12/site-packages/aiohttp/hdrs.py`

- **Status:** added | **+0** / **-0**
- **Description:** Content changed.

### ➕ `agent/venv/lib/python3.12/site-packages/aiohttp/helpers.py`

- **Status:** added | **+0** / **-0**
- **Description:** Content changed.

### ➕ `agent/venv/lib/python3.12/site-packages/aiohttp/http.py`

- **Status:** added | **+0** / **-0**
- **Description:** Content changed.

### ➕ `agent/venv/lib/python3.12/site-packages/aiohttp/http_exceptions.py`

- **Status:** added | **+0** / **-0**
- **Description:** Content changed.

### ➕ `agent/venv/lib/python3.12/site-packages/aiohttp/http_parser.py`

- **Status:** added | **+0** / **-0**
- **Description:** Content changed.

### ➕ `agent/venv/lib/python3.12/site-packages/aiohttp/http_websocket.py`

- **Status:** added | **+0** / **-0**
- **Description:** Content changed.

### ➕ `agent/venv/lib/python3.12/site-packages/aiohttp/http_writer.py`

- **Status:** added | **+0** / **-0**
- **Description:** Content changed.

### ➕ `agent/venv/lib/python3.12/site-packages/aiohttp/log.py`

- **Status:** added | **+0** / **-0**
- **Description:** Content changed.

### ➕ `agent/venv/lib/python3.12/site-packages/aiohttp/multipart.py`

- **Status:** added | **+0** / **-0**
- **Description:** Content changed.

### ➕ `agent/venv/lib/python3.12/site-packages/aiohttp/payload.py`

- **Status:** added | **+0** / **-0**
- **Description:** Content changed.

### ➕ `agent/venv/lib/python3.12/site-packages/aiohttp/payload_streamer.py`

- **Status:** added | **+0** / **-0**
- **Description:** Content changed.

### ➕ `agent/venv/lib/python3.12/site-packages/aiohttp/py.typed`

- **Status:** added | **+0** / **-0**
- **Description:** Content changed.

### ➕ `agent/venv/lib/python3.12/site-packages/aiohttp/pytest_plugin.py`

- **Status:** added | **+0** / **-0**
- **Description:** Content changed.

### ➕ `agent/venv/lib/python3.12/site-packages/aiohttp/resolver.py`

- **Status:** added | **+0** / **-0**
- **Description:** Content changed.

### ➕ `agent/venv/lib/python3.12/site-packages/aiohttp/streams.py`

- **Status:** added | **+0** / **-0**
- **Description:** Content changed.

### ➕ `agent/venv/lib/python3.12/site-packages/aiohttp/tcp_helpers.py`

- **Status:** added | **+0** / **-0**
- **Description:** Content changed.

### ➕ `agent/venv/lib/python3.12/site-packages/aiohttp/test_utils.py`

- **Status:** added | **+0** / **-0**
- **Description:** Content changed.

### ➕ `agent/venv/lib/python3.12/site-packages/aiohttp/tracing.py`

- **Status:** added | **+0** / **-0**
- **Description:** Content changed.

### ➕ `agent/venv/lib/python3.12/site-packages/aiohttp/typedefs.py`

- **Status:** added | **+0** / **-0**
- **Description:** Content changed.

### ➕ `agent/venv/lib/python3.12/site-packages/aiohttp/web.py`

- **Status:** added | **+0** / **-0**
- **Description:** Content changed.

### ➕ `agent/venv/lib/python3.12/site-packages/aiohttp/web_app.py`

- **Status:** added | **+0** / **-0**
- **Description:** Content changed.

### ➕ `agent/venv/lib/python3.12/site-packages/aiohttp/web_exceptions.py`

- **Status:** added | **+0** / **-0**
- **Description:** Content changed.

### ➕ `agent/venv/lib/python3.12/site-packages/aiohttp/web_fileresponse.py`

- **Status:** added | **+0** / **-0**
- **Description:** Content changed.

### ➕ `agent/venv/lib/python3.12/site-packages/aiohttp/web_log.py`

- **Status:** added | **+0** / **-0**
- **Description:** Content changed.

### ➕ `agent/venv/lib/python3.12/site-packages/aiohttp/web_middlewares.py`

- **Status:** added | **+0** / **-0**
- **Description:** Content changed.

### ➕ `agent/venv/lib/python3.12/site-packages/aiohttp/web_protocol.py`

- **Status:** added | **+0** / **-0**
- **Description:** Content changed.

### ➕ `agent/venv/lib/python3.12/site-packages/aiohttp/web_request.py`

- **Status:** added | **+0** / **-0**
- **Description:** Content changed.

### ➕ `agent/venv/lib/python3.12/site-packages/aiohttp/web_response.py`

- **Status:** added | **+0** / **-0**
- **Description:** Content changed.

### ➕ `agent/venv/lib/python3.12/site-packages/aiohttp/web_routedef.py`

- **Status:** added | **+0** / **-0**
- **Description:** Content changed.

### ➕ `agent/venv/lib/python3.12/site-packages/aiohttp/web_runner.py`

- **Status:** added | **+0** / **-0**
- **Description:** Content changed.

### ➕ `agent/venv/lib/python3.12/site-packages/aiohttp/web_server.py`

- **Status:** added | **+0** / **-0**
- **Description:** Content changed.

### ➕ `agent/venv/lib/python3.12/site-packages/aiohttp/web_urldispatcher.py`

- **Status:** added | **+0** / **-0**
- **Description:** Content changed.

### ➕ `agent/venv/lib/python3.12/site-packages/aiohttp/web_ws.py`

- **Status:** added | **+0** / **-0**
- **Description:** Content changed.

### ➕ `agent/venv/lib/python3.12/site-packages/aiohttp/worker.py`

- **Status:** added | **+0** / **-0**
- **Description:** Content changed.

### ➕ `agent/venv/lib/python3.12/site-packages/aiosignal-1.4.0.dist-info/INSTALLER`

- **Status:** added | **+0** / **-0**
- **Description:** Content changed.

### ➕ `agent/venv/lib/python3.12/site-packages/aiosignal-1.4.0.dist-info/METADATA`

- **Status:** added | **+0** / **-0**
- **Description:** Content changed.

### ➕ `agent/venv/lib/python3.12/site-packages/aiosignal-1.4.0.dist-info/RECORD`

- **Status:** added | **+0** / **-0**
- **Description:** Content changed.

### ➕ `agent/venv/lib/python3.12/site-packages/aiosignal-1.4.0.dist-info/WHEEL`

- **Status:** added | **+0** / **-0**
- **Description:** Content changed.

### ➕ `agent/venv/lib/python3.12/site-packages/aiosignal-1.4.0.dist-info/licenses/LICENSE`

- **Status:** added | **+0** / **-0**
- **Description:** Content changed.

### ➕ `agent/venv/lib/python3.12/site-packages/aiosignal-1.4.0.dist-info/top_level.txt`

- **Status:** added | **+0** / **-0**
- **Description:** Content changed.

### ➕ `agent/venv/lib/python3.12/site-packages/aiosignal/__init__.py`

- **Status:** added | **+0** / **-0**
- **Description:** Content changed.

### ➕ `agent/venv/lib/python3.12/site-packages/aiosignal/py.typed`

- **Status:** added | **+0** / **-0**
- **Description:** Content changed.

### ➕ `agent/venv/lib/python3.12/site-packages/annotated_types-0.7.0.dist-info/INSTALLER`

- **Status:** added | **+0** / **-0**
- **Description:** Content changed.

### ➕ `agent/venv/lib/python3.12/site-packages/annotated_types-0.7.0.dist-info/METADATA`

- **Status:** added | **+0** / **-0**
- **Description:** Content changed.

### ➕ `agent/venv/lib/python3.12/site-packages/annotated_types-0.7.0.dist-info/RECORD`

- **Status:** added | **+0** / **-0**
- **Description:** Content changed.

### ➕ `agent/venv/lib/python3.12/site-packages/annotated_types-0.7.0.dist-info/WHEEL`

- **Status:** added | **+0** / **-0**
- **Description:** Content changed.

### ➕ `agent/venv/lib/python3.12/site-packages/annotated_types-0.7.0.dist-info/licenses/LICENSE`

- **Status:** added | **+0** / **-0**
- **Description:** Content changed.

### ➕ `agent/venv/lib/python3.12/site-packages/annotated_types/__init__.py`

- **Status:** added | **+0** / **-0**
- **Description:** Content changed.

### ➕ `agent/venv/lib/python3.12/site-packages/annotated_types/py.typed`

- **Status:** added | **+0** / **-0**
- **Description:** Content changed.

### ➕ `agent/venv/lib/python3.12/site-packages/annotated_types/test_cases.py`

- **Status:** added | **+0** / **-0**
- **Description:** Content changed.

### ➕ `agent/venv/lib/python3.12/site-packages/anyio-4.10.0.dist-info/INSTALLER`

- **Status:** added | **+0** / **-0**
- **Description:** Content changed.

### ➕ `agent/venv/lib/python3.12/site-packages/anyio-4.10.0.dist-info/METADATA`

- **Status:** added | **+0** / **-0**
- **Description:** Content changed.

### ➕ `agent/venv/lib/python3.12/site-packages/anyio-4.10.0.dist-info/RECORD`

- **Status:** added | **+0** / **-0**
- **Description:** Content changed.

### ➕ `agent/venv/lib/python3.12/site-packages/anyio-4.10.0.dist-info/WHEEL`

- **Status:** added | **+0** / **-0**
- **Description:** Content changed.

### ➕ `agent/venv/lib/python3.12/site-packages/anyio-4.10.0.dist-info/entry_points.txt`

- **Status:** added | **+0** / **-0**
- **Description:** Content changed.

### ➕ `agent/venv/lib/python3.12/site-packages/anyio-4.10.0.dist-info/licenses/LICENSE`

- **Status:** added | **+0** / **-0**
- **Description:** Content changed.

### ➕ `agent/venv/lib/python3.12/site-packages/anyio-4.10.0.dist-info/top_level.txt`

- **Status:** added | **+0** / **-0**
- **Description:** Content changed.

### ➕ `agent/venv/lib/python3.12/site-packages/anyio/__init__.py`

- **Status:** added | **+0** / **-0**
- **Description:** Content changed.

### ➕ `agent/venv/lib/python3.12/site-packages/anyio/_backends/__init__.py`

- **Status:** added | **+0** / **-0**
- **Description:** Content changed.

### ➕ `agent/venv/lib/python3.12/site-packages/anyio/_backends/_asyncio.py`

- **Status:** added | **+0** / **-0**
- **Description:** Content changed.

### ➕ `agent/venv/lib/python3.12/site-packages/anyio/_backends/_trio.py`

- **Status:** added | **+0** / **-0**
- **Description:** Content changed.

### ➕ `agent/venv/lib/python3.12/site-packages/anyio/_core/__init__.py`

- **Status:** added | **+0** / **-0**
- **Description:** Content changed.

### ➕ `agent/venv/lib/python3.12/site-packages/anyio/_core/_asyncio_selector_thread.py`

- **Status:** added | **+0** / **-0**
- **Description:** Content changed.

### ➕ `agent/venv/lib/python3.12/site-packages/anyio/_core/_contextmanagers.py`

- **Status:** added | **+0** / **-0**
- **Description:** Content changed.

### ➕ `agent/venv/lib/python3.12/site-packages/anyio/_core/_eventloop.py`

- **Status:** added | **+0** / **-0**
- **Description:** Content changed.

### ➕ `agent/venv/lib/python3.12/site-packages/anyio/_core/_exceptions.py`

- **Status:** added | **+0** / **-0**
- **Description:** Content changed.

### ➕ `agent/venv/lib/python3.12/site-packages/anyio/_core/_fileio.py`

- **Status:** added | **+0** / **-0**
- **Description:** Content changed.

### ➕ `agent/venv/lib/python3.12/site-packages/anyio/_core/_resources.py`

- **Status:** added | **+0** / **-0**
- **Description:** Content changed.

### ➕ `agent/venv/lib/python3.12/site-packages/anyio/_core/_signals.py`

- **Status:** added | **+0** / **-0**
- **Description:** Content changed.

### ➕ `agent/venv/lib/python3.12/site-packages/anyio/_core/_sockets.py`

- **Status:** added | **+0** / **-0**
- **Description:** Content changed.

### ➕ `agent/venv/lib/python3.12/site-packages/anyio/_core/_streams.py`

- **Status:** added | **+0** / **-0**
- **Description:** Content changed.

### ➕ `agent/venv/lib/python3.12/site-packages/anyio/_core/_subprocesses.py`

- **Status:** added | **+0** / **-0**
- **Description:** Content changed.

### ➕ `agent/venv/lib/python3.12/site-packages/anyio/_core/_synchronization.py`

- **Status:** added | **+0** / **-0**
- **Description:** Content changed.

### ➕ `agent/venv/lib/python3.12/site-packages/anyio/_core/_tasks.py`

- **Status:** added | **+0** / **-0**
- **Description:** Content changed.

### ➕ `agent/venv/lib/python3.12/site-packages/anyio/_core/_tempfile.py`

- **Status:** added | **+0** / **-0**
- **Description:** Content changed.

### ➕ `agent/venv/lib/python3.12/site-packages/anyio/_core/_testing.py`

- **Status:** added | **+0** / **-0**
- **Description:** Content changed.

### ➕ `agent/venv/lib/python3.12/site-packages/anyio/_core/_typedattr.py`

- **Status:** added | **+0** / **-0**
- **Description:** Content changed.

### ➕ `agent/venv/lib/python3.12/site-packages/anyio/abc/__init__.py`

- **Status:** added | **+0** / **-0**
- **Description:** Content changed.

### ➕ `agent/venv/lib/python3.12/site-packages/anyio/abc/_eventloop.py`

- **Status:** added | **+0** / **-0**
- **Description:** Content changed.

### ➕ `agent/venv/lib/python3.12/site-packages/anyio/abc/_resources.py`

- **Status:** added | **+0** / **-0**
- **Description:** Content changed.

### ➕ `agent/venv/lib/python3.12/site-packages/anyio/abc/_sockets.py`

- **Status:** added | **+0** / **-0**
- **Description:** Content changed.
