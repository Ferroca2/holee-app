import { onDocumentWritten } from 'firebase-functions/v2/firestore';

export const onMessageWrite = onDocumentWritten(
    {
        document: 'conversations/{conversationId}/messages/{messageId}',
    },
    event => import('./onMessageWrite').then(mod => mod.default(event))
);

export const onConversationWrite = onDocumentWritten(
    {
        document: 'conversations/{conversationId}',
    },
    event => import('./onConversationWrite').then(mod => mod.default(event))
);

export const onJobWrite = onDocumentWritten(
    {
        document: 'jobs/{jobId}',
    },
    event => import('./onJobWrite').then(mod => mod.default(event))
);
