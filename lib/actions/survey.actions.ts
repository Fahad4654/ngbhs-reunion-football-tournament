'use server';

import prisma from '@/lib/prisma';
import { getServerUser } from '@/lib/server-auth';
import { revalidatePath } from 'next/cache';
import { sendSurveyAnnouncementEmail } from '@/lib/mail';

// ─────────────────────────────────────────
// Types
// ─────────────────────────────────────────

export type QuestionInput = {
  label: string;
  type: 'TEXT' | 'CHOICE' | 'CHECKBOX' | 'RATING';
  options?: string[];
  required?: boolean;
  order: number;
};

export type SurveyInput = {
  title: string;
  description?: string;
  closesAt?: string | null;
  requireUserDetails?: boolean;
  questions: QuestionInput[];
};

export type AnswerInput = {
  questionId: string;
  value: string;
};

// ─────────────────────────────────────────
// Manager Actions
// ─────────────────────────────────────────

export async function createSurvey(data: SurveyInput) {
  const user = await getServerUser();
  if (!user || user.role !== 'BATCH_MANAGER') return { success: false, error: 'Unauthorized' };

  const dbUser = await prisma.user.findUnique({ 
    where: { id: user.uid },
    include: { batch: true }
  });
  if (!dbUser?.batchId || !dbUser.batch) return { success: false, error: 'No batch assigned' };

  try {
    const survey = await prisma.survey.create({
      data: {
        title: data.title.trim(),
        description: data.description?.trim() || null,
        batchId: dbUser.batchId,
        createdById: user.uid,
        requireUserDetails: data.requireUserDetails ?? false,
        closesAt: data.closesAt ? new Date(data.closesAt) : null,
        questions: {
          create: data.questions.map((q) => ({
            label: q.label.trim(),
            type: q.type,
            options: q.options ?? [],
            required: q.required ?? true,
            order: q.order,
          })),
        },
      },
    });

    // Notify all approved batch members (except the creator)
    const members = await prisma.user.findMany({
      where: {
        batchId: dbUser.batchId,
        status: 'APPROVED',
        id: { not: user.uid },
      },
    });

    if (members.length > 0) {
      // 1. Create in-app notifications
      await prisma.notification.createMany({
        data: members.map((m) => ({
          userId: m.id,
          title: '📋 New Batch Survey',
          message: `A new survey "${survey.title}" has been created.`,
          link: '/dashboard/surveys',
        })),
      });

      // 2. Send emails
      const emails = members.map((m) => m.email).filter(Boolean) as string[];
      if (emails.length > 0) {
        // Fire and forget email sending
        sendSurveyAnnouncementEmail(emails, survey.title, dbUser.batch.name).catch(console.error);
      }
    }

    revalidatePath('/dashboard/surveys');
    revalidatePath('/dashboard/manage-batch');
    return { success: true, data: survey };
  } catch (error: any) {
    console.error('[createSurvey]', error);
    return { success: false, error: 'Failed to create survey' };
  }
}

export async function updateSurvey(
  id: string,
  data: { title?: string; description?: string; closesAt?: string | null; isOpen?: boolean }
) {
  const user = await getServerUser();
  if (!user || user.role !== 'BATCH_MANAGER') return { success: false, error: 'Unauthorized' };

  const dbUser = await prisma.user.findUnique({ where: { id: user.uid } });
  if (!dbUser?.batchId) return { success: false, error: 'No batch assigned' };

  // Verify ownership
  const survey = await prisma.survey.findUnique({ where: { id } });
  if (!survey || survey.batchId !== dbUser.batchId) return { success: false, error: 'Survey not found' };

  try {
    await prisma.survey.update({
      where: { id },
      data: {
        title: data.title?.trim(),
        description: data.description?.trim() ?? null,
        closesAt: data.closesAt !== undefined ? (data.closesAt ? new Date(data.closesAt) : null) : undefined,
        isOpen: data.isOpen,
      },
    });
    revalidatePath('/dashboard/surveys');
    revalidatePath('/dashboard/manage-batch');
    return { success: true };
  } catch (error: any) {
    console.error('[updateSurvey]', error);
    return { success: false, error: 'Failed to update survey' };
  }
}

export async function toggleSurveyOpen(id: string) {
  const user = await getServerUser();
  if (!user || user.role !== 'BATCH_MANAGER') return { success: false, error: 'Unauthorized' };

  const dbUser = await prisma.user.findUnique({ where: { id: user.uid } });
  if (!dbUser?.batchId) return { success: false, error: 'No batch assigned' };

  const survey = await prisma.survey.findUnique({ where: { id } });
  if (!survey || survey.batchId !== dbUser.batchId) return { success: false, error: 'Survey not found' };

  try {
    await prisma.survey.update({ where: { id }, data: { isOpen: !survey.isOpen } });
    revalidatePath('/dashboard/surveys');
    revalidatePath('/dashboard/manage-batch');
    return { success: true };
  } catch (error: any) {
    console.error('[toggleSurveyOpen]', error);
    return { success: false, error: 'Failed to toggle survey' };
  }
}

export async function deleteSurvey(id: string) {
  const user = await getServerUser();
  if (!user || user.role !== 'BATCH_MANAGER') return { success: false, error: 'Unauthorized' };

  const dbUser = await prisma.user.findUnique({ where: { id: user.uid } });
  if (!dbUser?.batchId) return { success: false, error: 'No batch assigned' };

  const survey = await prisma.survey.findUnique({ where: { id } });
  if (!survey || survey.batchId !== dbUser.batchId) return { success: false, error: 'Survey not found' };

  try {
    await prisma.survey.delete({ where: { id } });
    revalidatePath('/dashboard/surveys');
    revalidatePath('/dashboard/manage-batch');
    return { success: true };
  } catch (error: any) {
    console.error('[deleteSurvey]', error);
    return { success: false, error: 'Failed to delete survey' };
  }
}

export async function getSurveysForManager() {
  const user = await getServerUser();
  if (!user || user.role !== 'BATCH_MANAGER') return [];

  const dbUser = await prisma.user.findUnique({ where: { id: user.uid } });
  if (!dbUser?.batchId) return [];

  try {
    return await prisma.survey.findMany({
      where: { batchId: dbUser.batchId },
      orderBy: { createdAt: 'desc' },
      include: {
        questions: { orderBy: { order: 'asc' } },
        responses: {
          include: {
            responder: { select: { id: true, name: true, image: true, email: true, phone: true } },
            answers: true,
          },
          orderBy: { submittedAt: 'desc' },
        },
        _count: { select: { responses: true } },
      },
    });
  } catch (error) {
    console.error('[getSurveysForManager]', error);
    return [];
  }
}

// ─────────────────────────────────────────
// Member Actions
// ─────────────────────────────────────────

export async function getOpenSurveysForMember() {
  const user = await getServerUser();
  if (!user || user.status !== 'APPROVED') return { open: [], submitted: [] };

  const dbUser = await prisma.user.findUnique({ where: { id: user.uid } });
  if (!dbUser?.batchId) return { open: [], submitted: [] };

  try {
    const now = new Date();

    // IDs of surveys already submitted by this user
    const alreadySubmitted = await prisma.surveyResponse.findMany({
      where: { responderId: user.uid },
      select: { surveyId: true, survey: { select: { id: true, title: true } } },
    });
    const submittedIds = alreadySubmitted.map((r) => r.surveyId);

    const openSurveys = await prisma.survey.findMany({
      where: {
        batchId: dbUser.batchId,
        isOpen: true,
        id: { notIn: submittedIds },
        OR: [{ closesAt: null }, { closesAt: { gt: now } }],
      },
      orderBy: { createdAt: 'desc' },
      include: { questions: { orderBy: { order: 'asc' } }, _count: { select: { responses: true } } },
    });

    const submittedSurveys = await prisma.survey.findMany({
      where: { batchId: dbUser.batchId, id: { in: submittedIds } },
      orderBy: { createdAt: 'desc' },
      include: { _count: { select: { responses: true } } },
    });

    return { open: openSurveys, submitted: submittedSurveys };
  } catch (error) {
    console.error('[getOpenSurveysForMember]', error);
    return { open: [], submitted: [] };
  }
}

export async function submitSurveyResponse(surveyId: string, answers: AnswerInput[]) {
  const user = await getServerUser();
  if (!user || user.status !== 'APPROVED') return { success: false, error: 'Unauthorized' };

  try {
    // Check survey is open and member's batch
    const survey = await prisma.survey.findUnique({
      where: { id: surveyId },
      include: { createdBy: { select: { id: true } } },
    });
    if (!survey || !survey.isOpen) return { success: false, error: 'Survey is not accepting responses' };

    const dbUser = await prisma.user.findUnique({ where: { id: user.uid } });
    if (!dbUser?.batchId || dbUser.batchId !== survey.batchId) {
      return { success: false, error: 'You are not a member of this batch' };
    }

    // Check deadline
    if (survey.closesAt && new Date() > survey.closesAt) {
      return { success: false, error: 'Survey has closed' };
    }

    // Create response + answers
    await prisma.surveyResponse.create({
      data: {
        surveyId,
        responderId: user.uid,
        answers: {
          create: answers.map((a) => ({ questionId: a.questionId, value: a.value })),
        },
      },
    });

    // Notify the manager
    await prisma.notification.create({
      data: {
        userId: survey.createdById,
        title: '📋 New Survey Response',
        message: `${user.name || 'A member'} submitted your survey: "${survey.title}"`,
        link: '/dashboard/manage-batch?tab=surveys',
      },
    });

    revalidatePath('/dashboard/surveys');
    return { success: true };
  } catch (error: any) {
    console.error('[submitSurveyResponse]', error);
    if (error.code === 'P2002') return { success: false, error: 'You have already submitted this survey' };
    return { success: false, error: 'Failed to submit response' };
  }
}
