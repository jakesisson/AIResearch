"""
Test script for hikizan-emacs repository.

This file defines the test inputs that will be used for both
'previous' and 'updated' versions of the repository.

The test inputs must be defined as TEST_INPUTS - a list of scenarios.
"""

# Test scenarios for hikizan-emacs Emacs agent system
TEST_INPUTS = [
    {
        "scenario": "list_buffers",
        "messages": [
            "List all open buffers in Emacs.",
            "How many buffers are currently open?",
        ]
    },
    {
        "scenario": "read_file",
        "messages": [
            "Read the contents of init.el file.",
            "What is the first line of the file?",
        ]
    },
    {
        "scenario": "write_file",
        "messages": [
            "Create a new file called test.txt with the content 'Hello, World!'",
            "Verify that the file was created successfully.",
        ]
    },
    {
        "scenario": "find_files",
        "messages": [
            "Find all Python files in the current directory.",
            "How many Python files were found?",
        ]
    },
    {
        "scenario": "grep_search",
        "messages": [
            "Search for the pattern 'def ' in all Python files.",
            "What functions were found?",
        ]
    },
    {
        "scenario": "elisp_execution",
        "messages": [
            "Execute Emacs Lisp code to get the current buffer name.",
            "What is the name of the current buffer?",
        ]
    },
    {
        "scenario": "file_modification",
        "messages": [
            "Read the init.el file and add a comment at the top.",
            "Verify the comment was added.",
        ]
    },
    {
        "scenario": "directory_listing",
        "messages": [
            "List all files in the lisp directory.",
            "How many .el files are in the directory?",
        ]
    },
    {
        "scenario": "complex_task",
        "messages": [
            "Find all files containing 'defun' and create a summary file listing them.",
            "What is the content of the summary file?",
        ]
    },
    {
        "scenario": "buffer_operations",
        "messages": [
            "Execute Emacs Lisp to get a list of all buffer names.",
            "How many buffers are there?",
        ]
    },
    {
        "scenario": "file_search_pattern",
        "messages": [
            "Find all files matching the pattern '*.el' in the project.",
            "List the first 5 files found.",
        ]
    },
    {
        "scenario": "multi_step_task",
        "messages": [
            "Read the README.org file, then create a new file called summary.txt with a brief summary of its contents.",
            "What is in the summary.txt file?",
        ]
    },
]
