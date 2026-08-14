'use server'

import prisma from '@/lib/prisma';
import { auth } from '@clerk/nextjs/server';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

export async function deleteConversation(id: string) {
  const { userId } = await auth();
  if (!userId) return;
  
  const conv = await prisma.conversation.findUnique({ where: { id } });
  if (conv && conv.userId === userId) {
    // Prisma will cascade delete messages if configured, 
    // but to be safe we can manually delete them first or just rely on the schema.
    await prisma.message.deleteMany({ where: { conversationId: id } });
    await prisma.conversation.delete({ where: { id } });
    revalidatePath('/agent');
  }
  
  return { success: true };
}
