"""
Test script for HEDit repository.

This file defines the test inputs that will be used for both
'previous' and 'updated' versions of the repository.

The test inputs must be defined as TEST_INPUTS - a list of scenarios.
"""

# Test scenarios for HEDit HED annotation system
TEST_INPUTS = [
    {
        "scenario": "simple_annotation",
        "messages": [
            "Annotate: A loud beep sound plays",
            "What HED tags were generated?",
        ]
    },
    {
        "scenario": "image_annotation",
        "messages": [
            "Annotate this image: [image description: A person walking in a park]",
            "Extract all visual event descriptors",
        ]
    },
    {
        "scenario": "complex_event",
        "messages": [
            "Annotate: A red circle appears on screen, followed by a beep sound, then disappears",
            "Break down the temporal sequence of events",
        ]
    },
    {
        "scenario": "validation_check",
        "messages": [
            "Validate these HED tags: Event/Stimulus, Sensory-presentation/Visual, Attribute/Color/Red",
            "Are there any validation errors?",
        ]
    },
    {
        "scenario": "assessment_request",
        "messages": [
            "Assess the completeness of this annotation: Event/Stimulus, Sensory-presentation/Auditory",
            "What additional tags might be needed?",
        ]
    },
    {
        "scenario": "feedback_processing",
        "messages": [
            "Process feedback: The annotation is missing temporal information",
            "Generate an improved annotation",
        ]
    },
    {
        "scenario": "multi_sensory",
        "messages": [
            "Annotate: A visual flash appears simultaneously with an auditory tone",
            "How are the visual and auditory components tagged?",
        ]
    },
    {
        "scenario": "temporal_sequence",
        "messages": [
            "Annotate: First a warning sound, then a visual cue appears, then a response is required",
            "Show the temporal structure of events",
        ]
    },
    {
        "scenario": "attribute_specification",
        "messages": [
            "Annotate: A high-pitched beep sound at 1000Hz",
            "What attributes are captured?",
        ]
    },
    {
        "scenario": "context_inquiry",
        "messages": [
            "Annotate: A stimulus appears in a laboratory setting",
            "How is the experimental context represented?",
        ]
    },
    {
        "scenario": "error_correction",
        "messages": [
            "The annotation has an error: Event/Stimulus/Incorrect",
            "Correct the annotation and explain the fix",
        ]
    },
    {
        "scenario": "comprehensive_annotation",
        "messages": [
            "Annotate: In a cognitive experiment, a red square visual stimulus appears on a gray background for 500ms, followed by a 1000Hz tone for 200ms, then the participant presses a button",
            "Provide a complete HED annotation with all relevant tags",
        ]
    },
]
