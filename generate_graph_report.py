#!/usr/bin/env python3
"""Generate a human-readable report from graph comparison JSON."""

import json
from pathlib import Path

def main():
    with open('Research Data/HypochondriAI/graph_comparison.json') as f:
        data = json.load(f)
    
    report = f"""# Graph Comparison Analysis Report

## Commit Comparison
- **Prior Commit**: {data['prior_commit']['sha'][:12]}... ({data['prior_commit']['sha']})
- **Updated Commit**: {data['updated_commit']['sha'][:12]}... ({data['updated_commit']['sha']})
- **Analysis Date**: {data['analysis_date']}

## Graph Structure

### Nodes
- **Prior**: {data['comparison']['summary']['total_nodes_prior']} node(s)
- **Updated**: {data['comparison']['summary']['total_nodes_updated']} node(s)
- **Changes**: {data['comparison']['summary']['nodes_added']} added, {data['comparison']['summary']['nodes_removed']} removed, {data['comparison']['summary']['nodes_modified']} modified

### Edges
- **Prior**: {data['comparison']['summary']['total_edges_prior']} edge(s)
- **Updated**: {data['comparison']['summary']['total_edges_updated']} edge(s)
- **Changes**: {data['comparison']['summary']['edges_added']} added, {data['comparison']['summary']['edges_removed']} removed

### Graph Structure Changed?
**{'Yes' if data['comparison']['summary']['graph_structure_changed'] else 'No'}** - The graph structure (nodes and edges) remained the same.

## Graph Nodes Details

### Prior Commit Nodes:
"""
    
    for node in data['prior_commit']['graph_structure']['nodes']:
        report += f"""
- **{node['name']}**
  - Function: `{node['function_name']}`
  - Signature: `{node['function_signature']}`
  - Line: {node['line_number']}
"""
    
    report += """
### Updated Commit Nodes:
"""
    
    for node in data['updated_commit']['graph_structure']['nodes']:
        report += f"""
- **{node['name']}**
  - Function: `{node['function_name']}`
  - Signature: `{node['function_signature']}`
  - Line: {node['line_number']}
"""
    
    report += """
## Graph Edges Details

### Prior Commit Edges:
"""
    
    for edge in data['prior_commit']['graph_structure']['edges']:
        report += f"- {edge['from_node']} → {edge['to_node']} ({edge['edge_type']})\n"
    
    report += """
### Updated Commit Edges:
"""
    
    for edge in data['updated_commit']['graph_structure']['edges']:
        report += f"- {edge['from_node']} → {edge['to_node']} ({edge['edge_type']})\n"
    
    report += """
## Affected Graph Nodes

The following graph nodes are affected by code changes:
"""
    
    for node, reason in data['affected_nodes'].items():
        report += f"""
- **{node}**: {reason}
"""
    
    report += """
## Function Changes

### Functions with Code Changes:
"""
    
    for func in data['file_differences'].get('functions_with_changes', []):
        report += f"- `{func}()`\n"
    
    report += """
### Functions Modified (may include formatting/docstring changes):
"""
    
    for func in data['file_differences'].get('functions_modified', []):
        report += f"- `{func}()`\n"
    
    report += """
## Function-to-Node Mapping

This shows which functions are used by graph nodes:
"""
    
    for func, nodes in data['function_to_node_mapping'].items():
        report += f"""
- `{func}()` → Used by nodes: {', '.join(nodes)}
"""
    
    report += f"""
## File Statistics

- **Prior Commit**: {data['file_differences']['total_lines_prior']} lines
- **Updated Commit**: {data['file_differences']['total_lines_updated']} lines
- **Lines Added**: {data['file_differences']['lines_added']}
- **Lines Removed**: {data['file_differences']['lines_removed']}

## Summary

The commit refactored the LangchainService following clean code practices (top-down organization).
While the **graph structure remained unchanged** (same nodes and edges), the **"model" node is affected**
because its underlying function `call_model` was modified. Additionally, several initialization and
helper functions were refactored, but these do not directly affect graph node execution.
"""
    
    output_file = Path('Research Data/HypochondriAI/GRAPH_COMPARISON_REPORT.md')
    output_file.write_text(report)
    print(f"✅ Report generated: {output_file}")
    print("\n" + "="*60)
    print(report)

if __name__ == "__main__":
    main()
