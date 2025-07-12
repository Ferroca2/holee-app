import { onDocumentWritten } from 'firebase-functions/v2/firestore';

export const onMessageWrite = onDocumentWritten(
    {
        document: 'conversations/{conversationId}/messages/{messageId}',
    },
    event => import('./onMessageWrite').then(mod => mod.default(event))
);
