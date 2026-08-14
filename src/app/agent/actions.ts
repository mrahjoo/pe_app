'use server'

import prisma from '@/lib/prisma';
import { auth } from '@clerk/nextjs/server';
import { revalidatePath } from 'next/cache';

export async function deleteConversation(id: string) {
  const { userId } = await auth();

  if (!userId) {
    return { success: false, error: 'Unauthorized' };
  }

  const conversation = await prisma.conversation.findUnique({
    where: { id },
    select: { id: true, userId: true },
  });

  if (!conversation || conversation.userId !== userId) {
    return { success: false, error: 'Conversation not found' };
  }

  await prisma.$transaction(async (tx) => {
    await tx.message.deleteMany({ where: { conversationId: id } });
    await tx.conversation.delete({ where: { id } });
  });

  revalidatePath('/agent');
  revalidatePath('/agent/[id]', 'page');

  return { success: true };
}
