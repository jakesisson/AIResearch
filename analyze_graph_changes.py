#!/usr/bin/env python3
"""
Analyze differences between two repository commit states.

This script:
1. Compares two repository versions
2. Extracts graph structure (nodes, edges, functions)
3. Identifies changed functions
4. Maps changes to graph nodes
5. Generates a detailed comparison report
"""

import ast
import json
import re
import difflib
from pathlib import Path
from typing import Dict, List, Set, Tuple, Any
from dataclasses import dataclass, asdict
from datetime import datetime


@dataclass
class GraphNode:
    """Represents a graph node."""
    name: str
    function_name: str
    function_signature: str
    source_file: str
    line_number: int


@dataclass
class GraphEdge:
    """Represents a graph edge."""
    from_node: str
    to_node: str
    edge_type: str  # 'direct', 'conditional', etc.


@dataclass
class GraphStructure:
    """Represents the complete graph structure."""
    nodes: List[GraphNode]
    edges: List[GraphEdge]
    state_schema: Dict[str, Any]
    initialization_order: List[str]


@dataclass
class FunctionChange:
    """Represents a changed function."""
    function_name: str
    change_type: str  # 'modified', 'added', 'removed', 'signature_changed'
    node_mapping: List[str]  # Which graph nodes use this function
    old_signature: str | None
    new_signature: str | None
    lines_changed: int | None


class GraphAnalyzer:
    """Analyzes Python code to extract graph structure."""
    
    def __init__(self, file_path: Path):
        self.file_path = file_path
        self.source_code = file_path.read_text()
        self.tree = ast.parse(self.source_code)
        self.nodes: List[GraphNode] = []
        self.edges: List[GraphEdge] = []
        self.functions: Dict[str, Dict[str, Any]] = {}
        
    def extract_graph_structure(self) -> GraphStructure:
        """Extract graph structure from the code."""
        # Find StateGraph initialization
        self._extract_nodes_and_edges()
        self._extract_functions()
        self._extract_state_schema()
        
        return GraphStructure(
            nodes=self.nodes,
            edges=self.edges,
            state_schema=self._extract_state_schema(),
            initialization_order=self._extract_initialization_order()
        )
    
    def _extract_nodes_and_edges(self):
        """Extract graph nodes and edges from StateGraph code using regex (more reliable)."""
        # Use regex to find graph structure in _initialize_graph method
        graph_method_match = re.search(
            r'def _initialize_graph.*?workflow\.compile',
            self.source_code,
            re.DOTALL
        )
        
        if not graph_method_match:
            return
        
        graph_code = graph_method_match.group(0)
        
        # Extract nodes: workflow.add_node("node_name", cls.function_name)
        node_matches = re.findall(
            r'workflow\.add_node\([\"\'"]([\w]+)[\"\'"],\s*(\w+\.\w+)',
            graph_code
        )
        for node_name, func_ref in node_matches:
            # Extract function name from cls.function_name or self.function_name
            func_name = func_ref.split('.')[-1] if '.' in func_ref else func_ref
            line_num = self.source_code[:self.source_code.find(f'workflow.add_node("{node_name}"')].count('\n') + 1
            
            self.nodes.append(GraphNode(
                name=node_name,
                function_name=func_name,
                function_signature=self._get_function_signature(func_name),
                source_file=str(self.file_path),
                line_number=line_num
            ))
        
        # Extract edges: workflow.add_edge(START, "node") or workflow.add_edge("node", END)
        # Need to handle both string literals and constants (START, END)
        edge_patterns = [
            r'workflow\.add_edge\((\w+),\s*[\"\'"]([\w]+)[\"\'"]\)',  # START, "model" or "model", END
            r'workflow\.add_edge\([\"\'"]([\w]+)[\"\'"],\s*(\w+)\)',  # "model", END
            r'workflow\.add_edge\((\w+),\s*(\w+)\)',  # START, END (both constants)
        ]
        
        for pattern in edge_patterns:
            edge_matches = re.findall(pattern, graph_code)
            for match in edge_matches:
                if len(match) == 2:
                    from_node, to_node = match
                    # Normalize START and END
                    from_node = "START" if from_node == "START" else from_node
                    to_node = "END" if to_node == "END" else to_node
                    
                    # Avoid duplicates
                    if not any(e.from_node == from_node and e.to_node == to_node for e in self.edges):
                        self.edges.append(GraphEdge(
                            from_node=from_node,
                            to_node=to_node,
                            edge_type="direct"
                        ))
    
    def _extract_string_literal(self, node: ast.AST) -> str | None:
        """Extract string literal from AST node."""
        if isinstance(node, ast.Constant) and isinstance(node.value, str):
            return node.value
        elif isinstance(node, ast.Str):  # Python < 3.8
            return node.s
        elif isinstance(node, ast.Name):
            # Check if it's START or END constant
            if node.id == "START":
                return "START"
            elif node.id == "END":
                return "END"
        return None
    
    def _extract_function_reference(self, node: ast.AST) -> str | None:
        """Extract function reference from AST node."""
        if isinstance(node, ast.Attribute):
            # cls.call_model or self.call_model
            if isinstance(node.value, ast.Name) and node.value.id in ["cls", "self"]:
                return node.attr
        return None
    
    def _get_function_signature(self, func_name: str) -> str:
        """Get function signature for a given function name."""
        for node in ast.walk(self.tree):
            if isinstance(node, ast.FunctionDef) and node.name == func_name:
                args = [arg.arg for arg in node.args.args]
                return f"{func_name}({', '.join(args)})"
        return f"{func_name}(...)"
    
    def _extract_functions(self):
        """Extract all function definitions."""
        for node in ast.walk(self.tree):
            if isinstance(node, ast.FunctionDef):
                args = [arg.arg for arg in node.args.args]
                decorators = [self._get_decorator_name(d) for d in node.decorator_list]
                
                self.functions[node.name] = {
                    "name": node.name,
                    "signature": f"{node.name}({', '.join(args)})",
                    "line_number": node.lineno,
                    "decorators": decorators,
                    "is_method": any("cls" in args or "self" in args for args in [arg.arg for arg in node.args.args]),
                    "is_classmethod": "classmethod" in decorators,
                    "is_staticmethod": "staticmethod" in decorators,
                    "is_async": isinstance(node, ast.AsyncFunctionDef),
                    "source_lines": self._get_function_source_lines(node)
                }
    
    def _get_decorator_name(self, node: ast.AST) -> str:
        """Get decorator name from AST node."""
        if isinstance(node, ast.Name):
            return node.id
        elif isinstance(node, ast.Attribute):
            return node.attr
        return ""
    
    def _get_function_source_lines(self, func_node: ast.FunctionDef) -> List[str]:
        """Get source code lines for a function."""
        lines = self.source_code.split('\n')
        start_line = func_node.lineno - 1
        end_line = func_node.end_lineno if hasattr(func_node, 'end_lineno') else start_line + 10
        return lines[start_line:end_line]
    
    def _extract_state_schema(self) -> Dict[str, Any]:
        """Extract State schema definition."""
        state_info = {}
        for node in ast.walk(self.tree):
            if isinstance(node, ast.ClassDef) and node.name == "State":
                # Extract TypedDict fields
                for item in node.body:
                    if isinstance(item, ast.AnnAssign) and isinstance(item.target, ast.Name):
                        field_name = item.target.id
                        state_info[field_name] = {
                            "name": field_name,
                            "annotation": ast.unparse(item.annotation) if hasattr(ast, 'unparse') else str(item.annotation)
                        }
        return state_info
    
    def _extract_initialization_order(self) -> List[str]:
        """Extract the order of initialization methods."""
        order = []
        for node in ast.walk(self.tree):
            if isinstance(node, ast.FunctionDef):
                if "initialize" in node.name.lower():
                    order.append(node.name)
        return order


class GraphComparator:
    """Compares two graph structures."""
    
    def __init__(self, prior_structure: GraphStructure, updated_structure: GraphStructure):
        self.prior = prior_structure
        self.updated = updated_structure
    
    def compare(self) -> Dict[str, Any]:
        """Compare the two graph structures."""
        return {
            "nodes": self._compare_nodes(),
            "edges": self._compare_edges(),
            "functions": self._compare_functions(),
            "state_schema": self._compare_state_schema(),
            "summary": self._generate_summary()
        }
    
    def _compare_nodes(self) -> Dict[str, Any]:
        """Compare graph nodes."""
        prior_nodes = {n.name: n for n in self.prior.nodes}
        updated_nodes = {n.name: n for n in self.updated.nodes}
        
        added = [asdict(n) for name, n in updated_nodes.items() if name not in prior_nodes]
        removed = [asdict(n) for name, n in prior_nodes.items() if name not in updated_nodes]
        modified = []
        
        for name in set(prior_nodes.keys()) & set(updated_nodes.keys()):
            prior_node = prior_nodes[name]
            updated_node = updated_nodes[name]
            if prior_node.function_name != updated_node.function_name:
                modified.append({
                    "node_name": name,
                    "prior_function": prior_node.function_name,
                    "updated_function": updated_node.function_name,
                    "change": "function_changed"
                })
        
        return {
            "added": added,
            "removed": removed,
            "modified": modified,
            "unchanged": [n.name for n in self.prior.nodes if n.name in updated_nodes]
        }
    
    def _compare_edges(self) -> Dict[str, Any]:
        """Compare graph edges."""
        prior_edges = {(e.from_node, e.to_node): e for e in self.prior.edges}
        updated_edges = {(e.from_node, e.to_node): e for e in self.updated.edges}
        
        added = [asdict(e) for key, e in updated_edges.items() if key not in prior_edges]
        removed = [asdict(e) for key, e in prior_edges.items() if key not in updated_edges]
        
        return {
            "added": added,
            "removed": removed,
            "unchanged": [f"{e.from_node}->{e.to_node}" for e in self.prior.edges if (e.from_node, e.to_node) in updated_edges]
        }
    
    def _compare_functions(self) -> Dict[str, Any]:
        """Compare function definitions."""
        # This would need access to the full function source code
        # For now, return structure
        return {
            "note": "Function comparison requires full source code analysis",
            "prior_functions": len(self.prior.nodes),
            "updated_functions": len(self.updated.nodes)
        }
    
    def _compare_state_schema(self) -> Dict[str, Any]:
        """Compare state schemas."""
        prior_fields = set(self.prior.state_schema.keys())
        updated_fields = set(self.updated.state_schema.keys())
        
        return {
            "added_fields": list(updated_fields - prior_fields),
            "removed_fields": list(prior_fields - updated_fields),
            "unchanged_fields": list(prior_fields & updated_fields)
        }
    
    def _generate_summary(self) -> Dict[str, Any]:
        """Generate comparison summary."""
        node_comparison = self._compare_nodes()
        edge_comparison = self._compare_edges()
        
        return {
            "total_nodes_prior": len(self.prior.nodes),
            "total_nodes_updated": len(self.updated.nodes),
            "nodes_added": len(node_comparison["added"]),
            "nodes_removed": len(node_comparison["removed"]),
            "nodes_modified": len(node_comparison["modified"]),
            "total_edges_prior": len(self.prior.edges),
            "total_edges_updated": len(self.updated.edges),
            "edges_added": len(edge_comparison["added"]),
            "edges_removed": len(edge_comparison["removed"]),
            "graph_structure_changed": (
                len(node_comparison["added"]) > 0 or
                len(node_comparison["removed"]) > 0 or
                len(node_comparison["modified"]) > 0 or
                len(edge_comparison["added"]) > 0 or
                len(edge_comparison["removed"]) > 0
            )
        }


def analyze_file_differences(prior_file: Path, updated_file: Path) -> Dict[str, Any]:
    """Analyze differences between two files using difflib."""
    prior_lines = prior_file.read_text().splitlines()
    updated_lines = updated_file.read_text().splitlines()
    
    # Use difflib to get detailed differences
    diff = list(difflib.unified_diff(prior_lines, updated_lines, lineterm='', n=0))
    
    changes = {
        "lines_added": 0,
        "lines_removed": 0,
        "total_lines_prior": len(prior_lines),
        "total_lines_updated": len(updated_lines),
        "changed_functions": []
    }
    
    # Count added/removed lines
    for line in diff:
        if line.startswith('+') and not line.startswith('+++'):
            changes["lines_added"] += 1
        elif line.startswith('-') and not line.startswith('---'):
            changes["lines_removed"] += 1
    
    # Extract function names that changed
    prior_code = prior_file.read_text()
    updated_code = updated_file.read_text()
    
    prior_functions = set(re.findall(r'^\s*(?:@\w+\s+)*def (\w+)\(', prior_code, re.MULTILINE))
    updated_functions = set(re.findall(r'^\s*(?:@\w+\s+)*def (\w+)\(', updated_code, re.MULTILINE))
    
    changes["functions_added"] = list(updated_functions - prior_functions)
    changes["functions_removed"] = list(prior_functions - updated_functions)
    changes["functions_modified"] = list(prior_functions & updated_functions)
    
    # Analyze which functions actually changed by comparing their bodies
    changes["functions_with_changes"] = []
    for func_name in changes["functions_modified"]:
        prior_func = _extract_function_body(prior_code, func_name)
        updated_func = _extract_function_body(updated_code, func_name)
        if prior_func != updated_func:
            changes["functions_with_changes"].append(func_name)
    
    return changes


def _extract_function_body(code: str, func_name: str) -> str:
    """Extract the body of a function from source code."""
    pattern = rf'def {func_name}\(.*?\):(.*?)(?=\n\s+def |\n\s+@|\Z)'
    match = re.search(pattern, code, re.DOTALL)
    if match:
        return match.group(1).strip()
    return ""


def main():
    """Main analysis function."""
    base_path = Path("/Users/jsisson/Research/Research Data/HypochondriAI")
    
    prior_commit = "3b23faa83b3007490569ac2951887fe622c0cdcc"
    updated_commit = "c24b8d2c2fc40913415a7883c87a5c8185a17a37"
    
    prior_path = base_path / f"HypochondriAI-{prior_commit}/backend/app/services/llm.py"
    updated_path = base_path / f"HypochondriAI-{updated_commit}/backend/app/services/llm.py"
    
    if not prior_path.exists():
        print(f"❌ Prior commit file not found: {prior_path}")
        return
    
    if not updated_path.exists():
        print(f"❌ Updated commit file not found: {updated_path}")
        return
    
    print("🔍 Analyzing graph structures...")
    
    # Analyze both versions
    prior_analyzer = GraphAnalyzer(prior_path)
    updated_analyzer = GraphAnalyzer(updated_path)
    
    prior_structure = prior_analyzer.extract_graph_structure()
    updated_structure = updated_analyzer.extract_graph_structure()
    
    # Compare structures
    comparator = GraphComparator(prior_structure, updated_structure)
    comparison = comparator.compare()
    
    # Analyze file differences
    file_diff = analyze_file_differences(prior_path, updated_path)
    
    # Map functions to nodes
    function_to_node_mapping = {}
    for node in prior_structure.nodes + updated_structure.nodes:
        if node.function_name not in function_to_node_mapping:
            function_to_node_mapping[node.function_name] = []
        if node.name not in function_to_node_mapping[node.function_name]:
            function_to_node_mapping[node.function_name].append(node.name)
    
    # Build final report
    report = {
        "analysis_date": datetime.now().isoformat(),
        "prior_commit": {
            "sha": prior_commit,
            "file": str(prior_path),
            "graph_structure": {
                "nodes": [asdict(n) for n in prior_structure.nodes],
                "edges": [asdict(e) for e in prior_structure.edges],
                "state_schema": prior_structure.state_schema
            },
            "functions": prior_analyzer.functions
        },
        "updated_commit": {
            "sha": updated_commit,
            "file": str(updated_path),
            "graph_structure": {
                "nodes": [asdict(n) for n in updated_structure.nodes],
                "edges": [asdict(e) for e in updated_structure.edges],
                "state_schema": updated_structure.state_schema
            },
            "functions": updated_analyzer.functions
        },
        "comparison": comparison,
        "file_differences": file_diff,
        "function_to_node_mapping": function_to_node_mapping,
        "affected_nodes": _identify_affected_nodes(comparison, file_diff, function_to_node_mapping)
    }
    
    # Save report
    output_file = Path("/Users/jsisson/Research/Research Data/HypochondriAI/graph_comparison.json")
    with open(output_file, "w") as f:
        json.dump(report, f, indent=2)
    
    print(f"✅ Analysis complete. Report saved to: {output_file}")
    
    # Print summary
    print("\n" + "="*60)
    print("SUMMARY")
    print("="*60)
    print(f"Prior commit: {prior_commit[:12]}...")
    print(f"Updated commit: {updated_commit[:12]}...")
    print(f"\nGraph Structure:")
    print(f"  Nodes: {comparison['summary']['total_nodes_prior']} → {comparison['summary']['total_nodes_updated']}")
    print(f"  Edges: {comparison['summary']['total_edges_prior']} → {comparison['summary']['total_edges_updated']}")
    print(f"\nChanges:")
    print(f"  Nodes added: {comparison['summary']['nodes_added']}")
    print(f"  Nodes removed: {comparison['summary']['nodes_removed']}")
    print(f"  Nodes modified: {comparison['summary']['nodes_modified']}")
    print(f"  Edges added: {comparison['summary']['edges_added']}")
    print(f"  Edges removed: {comparison['summary']['edges_removed']}")
    print(f"\nFunctions:")
    print(f"  Added: {len(file_diff['functions_added'])}")
    print(f"  Removed: {len(file_diff['functions_removed'])}")
    print(f"  Potentially modified: {len(file_diff['functions_modified'])}")
    print(f"\nAffected Graph Nodes:")
    for node_name, reason in report['affected_nodes'].items():
        print(f"  - {node_name}: {reason}")


def _identify_affected_nodes(comparison: Dict, file_diff: Dict, function_mapping: Dict) -> Dict[str, str]:
    """Identify which graph nodes are affected by changes."""
    affected = {}
    
    # Nodes that were added/removed/modified
    for node in comparison['nodes']['added']:
        affected[node['name']] = "Node added in updated version"
    
    for node in comparison['nodes']['removed']:
        affected[node['name']] = "Node removed in updated version"
    
    for node in comparison['nodes']['modified']:
        affected[node['node_name']] = f"Node function changed: {node['prior_function']} → {node['updated_function']}"
    
    # Nodes whose functions were modified (with actual code changes)
    for func_name in file_diff.get('functions_with_changes', []):
        if func_name in function_mapping:
            for node_name in function_mapping[func_name]:
                if node_name not in affected:
                    affected[node_name] = f"Function '{func_name}' was modified (code changed)"
    
    # Also check all modified functions (may have docstring/formatting changes)
    for func_name in file_diff.get('functions_modified', []):
        if func_name in function_mapping and func_name not in file_diff.get('functions_with_changes', []):
            for node_name in function_mapping[func_name]:
                if node_name not in affected:
                    affected[node_name] = f"Function '{func_name}' may have been modified (signature/formatting)"
    
    # Nodes whose functions were removed
    for func_name in file_diff.get('functions_removed', []):
        if func_name in function_mapping:
            for node_name in function_mapping[func_name]:
                if node_name not in affected:
                    affected[node_name] = f"Function '{func_name}' was removed"
    
    return affected


if __name__ == "__main__":
    main()
