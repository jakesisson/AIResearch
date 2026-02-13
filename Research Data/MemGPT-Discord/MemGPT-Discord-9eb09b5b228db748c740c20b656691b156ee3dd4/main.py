"""Discord bot that integrates with LangGraph for AI-assisted conversations.

This module sets up a Discord bot that can interact with users in Discord channels
and threads. It uses LangGraph to process messages and generate responses.
"""

import asyncio
import logging
import os

import discord
from aiohttp import web
from discord.ext import commands
from discord.message import Message
from dotenv import load_dotenv
from langchain_core.messages import HumanMessage, AIMessage
from langgraph_sdk.schema import Thread
from my_agent.agent import graph
from my_agent.utils.state import AgentState
from my_agent.utils.schemas import GraphConfig

from datetime import datetime, timezone, timedelta
from typing import List

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("discord")

# Load environment variables
load_dotenv()


TOKEN = os.getenv("DISCORD_TOKEN")
if not TOKEN:
    raise ValueError(
        "No Discord token found. Make sure DISCORD_TOKEN is set in your environment."
    )

INTENTS = discord.Intents.default()
INTENTS.message_content = True
BOT = commands.Bot(command_prefix="!", intents=INTENTS)

@BOT.event
async def on_ready():
    """Log a message when the bot has successfully connected to Discord."""
    logger.info(f"{BOT.user} has connected to Discord!")

async def _get_thread(message: Message) -> discord.Thread:
    """Get or create a Discord thread for the given message.

    If the message is already in a thread, return that thread.
    Otherwise, create a new thread in the channel where the message was sent.

    Args:
        message (Message): The Discord message to get or create a thread for.

    Returns:
        discord.Thread: The thread associated with the message.
    """
    channel = message.channel
    if isinstance(channel, discord.Thread):
        return channel
    else:
        return await channel.create_thread(name="Response", message=message)

async def _get_thread_messages(thread: discord.Thread, current_message: Message) -> List[Message]:
    start = datetime.now(tz=timezone.utc) - timedelta(days=1)
    end = datetime.now(tz=timezone.utc)
    
    formatted_messages = []
    async for message in thread.history(after=start, before=end):
        if message.type == discord.MessageType.thread_starter_message:
            continue
        if message.author == BOT.user:
            formatted_messages.append(AIMessage(content=message.content))
        else:
            formatted_messages.append(HumanMessage(content=message.content))
    return formatted_messages


def _format_inbound_message(message: Message) -> HumanMessage:
    """Format a Discord message into a HumanMessage for LangGraph processing."""
    guild_str = "" if message.guild is None else f"guild={message.guild}"
    content = f"""<discord {guild_str} channel={message.channel} author={repr(message.author)}>
    {message.content}
    </discord>"""
    
    # Sanitize the name to only include valid characters
    safe_name = str(message.author.global_name or message.author.name)
    safe_name = "".join(c for c in safe_name if c.isalnum() or c in "_-")
    
    return HumanMessage(
        content=content,
        name=safe_name,  # Use sanitized name
        id=str(message.id)
    )


@BOT.event
async def on_message(message: Message):
    """Event handler for incoming Discord messages.

    This function processes incoming messages, ignoring those sent by the bot itself.
    When the bot is mentioned, it creates or fetches the appropriate threads,
    processes the message through LangGraph, and sends the response.

    Args:
        message (Message): The incoming Discord message.
    """
    if message.author == BOT.user:
        return
    if BOT.user.mentioned_in(message):
        thread = await _get_thread(message)
        messages = await _get_thread_messages(thread, current_message=message)

        new_message = _format_inbound_message(message)
        messages.append(new_message)

        # Create initial state with empty memories
        initial_state = AgentState(
            messages=messages,
            core_memories=[], 
            recall_memories=[], 
        )

        # Create config with thread and user context
        config = GraphConfig(
            input=new_message.content,  # Changed to use new_message.content directly
            chat_history=[msg.content for msg in messages],  # Add full chat history
            context=[],
            thread_id=str(thread.id),  # Ensure thread_id is string
            user_id=str(message.author.id),  # Ensure user_id is string
        )

        run_result = await graph.ainvoke(initial_state, config)
        
        # Extract and send response
        bot_message = run_result["messages"][-1]
        response = bot_message.content
        if isinstance(response, list):
            response = "".join([r["text"] for r in response])
        await thread.send(response)


async def health_check(request):
    """Health check endpoint for the web server.

    This function responds to GET requests on the /health endpoint with an "OK" message.

    Args:
        request: The incoming web request.

    Returns:
        web.Response: A response indicating the service is healthy.
    """
    return web.Response(text="OK")


async def run_bot():
    """Run the Discord bot.

    This function starts the Discord bot and handles any exceptions that occur during its operation.
    """
    try:
        await BOT.start(TOKEN)
    except Exception as e:
        print(f"Error starting BOT: {e}")


async def run_web_server():
    """Run the web server for health checks.

    This function sets up and starts a simple web server that includes a health check endpoint.
    """
    app = web.Application()
    app.router.add_get("/health", health_check)
    runner = web.AppRunner(app)
    await runner.setup()
    site = web.TCPSite(runner, "0.0.0.0", 8080)
    await site.start()


async def main():
    """Main function to run both the Discord bot and the web server concurrently.

    This function uses asyncio.gather to run both the bot and the web server in parallel.
    """
    await asyncio.gather(run_bot(), run_web_server())


if __name__ == "__main__":
    asyncio.run(main())
