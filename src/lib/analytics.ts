'use server'

import prisma from './prisma';
import { auth } from '@clerk/nextjs/server';
import { headers } from 'next/headers';

export interface AnalyticsEventPayload {
  eventType: string;
  resource?: string;
  data?: any;
  sessionId?: string;
}

export async function trackEvent({ eventType, resource, data, sessionId }: AnalyticsEventPayload) {
  try {
    const { userId } = await auth();
    const headersList = await headers();
    
    // In Next.js App Router, headers can be used to extract IP and user agent
    const ipAddress = headersList.get('x-forwarded-for') || headersList.get('x-real-ip') || undefined;
    const userAgent = headersList.get('user-agent') || undefined;

    await prisma.analyticsEvent.create({
      data: {
        userId: userId || null,
        sessionId,
        eventType,
        resource,
        data: data ? JSON.stringify(data) : null,
        ipAddress,
        userAgent,
      }
    });
  } catch (error) {
    console.error('Failed to track analytics event:', error);
    // We intentionally swallow the error so it doesn't break the user flow.
  }
}
