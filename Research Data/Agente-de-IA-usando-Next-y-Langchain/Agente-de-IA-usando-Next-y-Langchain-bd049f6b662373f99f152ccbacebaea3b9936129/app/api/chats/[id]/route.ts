import { NextResponse } from 'next/server';
import { pool } from '@/lib/db';

// DELETE /api/chats/[id] - Delete a specific chat
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json({ error: 'Chat ID is required' }, { status: 400 });
    }

    // Delete messages first (CASCADE should handle this, but being explicit)
    await pool.query('DELETE FROM messages WHERE chat_id = $1', [id]);
    
    // Delete the chat
    await pool.query('DELETE FROM chats WHERE id = $1', [id]);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting chat:', error);
    return NextResponse.json({ error: 'Failed to delete chat' }, { status: 500 });
  }
}
