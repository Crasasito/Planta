// functions/index.mjs — Planificador de recordatorios (cada minuto) SOLO PUSH (FCM)
// Requiere habilitar Cloud Functions y programador (puede necesitar plan Blaze aunque el coste sea ~0 a bajo uso).
import { initializeApp, applicationDefault } from 'firebase-admin/app';
import { getFirestore, Timestamp } from 'firebase-admin/firestore';
import { getMessaging } from 'firebase-admin/messaging';
import { onSchedule } from 'firebase-functions/v2/scheduler';
import * as logger from 'firebase-functions/logger';

initializeApp({ credential: applicationDefault() });
const db = getFirestore();
const fcm = getMessaging();

export const dispatchDueReminders = onSchedule('every 1 minutes', async () => {
  const now = Timestamp.now();
  const due = await db.collectionGroup('scheduledReminders')
    .where('status', '==', 'pending')
    .where('reminderAt', '<=', now)
    .limit(200)
    .get();
  if (due.empty) return;

  const ops = [];
  for (const doc of due.docs) {
    const r = doc.data(); // { uid, taskId, text, reminderAt, ... }
    try {
      const userId = r.uid;
      const tokensSnap = await db.collection(`users/${userId}/tokens`).get();
      const tokens = tokensSnap.docs.map(d => d.id || d.data().token).filter(Boolean);
      if (tokens.length) {
        await fcm.sendEachForMulticast({
          tokens,
          notification: { title: 'Recordatorio de tarea', body: r.text || 'Tienes una tarea programada' },
          data: { url: '/' }
        });
      }
      ops.push(doc.ref.update({ status: 'sent', sentAt: Timestamp.now() }));
    } catch (e) {
      logger.error('Error enviando recordatorio', e);
      ops.push(doc.ref.update({ status: 'error', error: String(e) }));
    }
  }
  await Promise.all(ops);
});
