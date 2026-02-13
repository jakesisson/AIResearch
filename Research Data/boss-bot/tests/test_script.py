"""
Test script for boss-bot repository.

This file defines the test inputs that will be used for both
'previous' and 'updated' versions of the repository.

The test inputs must be defined as TEST_INPUTS - a list of scenarios.
"""

# Test scenarios for Discord media download bot
TEST_INPUTS = [
    {
        "scenario": "twitter_download_simple",
        "messages": [
            "$download https://twitter.com/user/status/1234567890",
            "What is the status of this download?",
        ]
    },
    {
        "scenario": "youtube_download_with_upload",
        "messages": [
            "$download https://www.youtube.com/watch?v=dQw4w9WgXcQ upload=true",
            "Show me the download queue",
        ]
    },
    {
        "scenario": "reddit_download",
        "messages": [
            "$download https://www.reddit.com/r/videos/comments/abc123/example_post/",
            "Get metadata for this URL without downloading",
        ]
    },
    {
        "scenario": "instagram_download",
        "messages": [
            "$download https://www.instagram.com/p/ABC123xyz/",
            "What download strategy is being used?",
        ]
    },
    {
        "scenario": "queue_management",
        "messages": [
            "$queue",
            "Remove the first item from the queue",
            "Show queue status again",
        ]
    },
    {
        "scenario": "multiple_downloads",
        "messages": [
            "$download https://twitter.com/user/status/111",
            "$download https://www.youtube.com/watch?v=video1",
            "$download https://www.reddit.com/r/pics/comments/xyz/",
            "What is the current queue size?",
        ]
    },
    {
        "scenario": "metadata_extraction",
        "messages": [
            "$metadata https://twitter.com/user/status/1234567890",
            "What information can you extract from this URL?",
        ]
    },
    {
        "scenario": "queue_control",
        "messages": [
            "$pause",
            "Check download status",
            "$resume",
            "Verify queue is active again",
        ]
    },
    {
        "scenario": "bot_information",
        "messages": [
            "$info",
            "What platforms are supported?",
            "Show me all available commands",
        ]
    },
    {
        "scenario": "strategy_configuration",
        "messages": [
            "$strategies",
            "Validate Instagram configuration",
            "Show configuration summary for Twitter",
        ]
    },
    {
        "scenario": "queue_clear_and_status",
        "messages": [
            "$queue",
            "Clear the entire queue",
            "Verify queue is empty",
            "$status",
        ]
    },
    {
        "scenario": "download_without_upload",
        "messages": [
            "$download https://www.youtube.com/watch?v=example upload=false",
            "Why would I download without uploading?",
            "Check the download status",
        ]
    },
]
