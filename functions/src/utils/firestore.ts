import * as admin from 'firebase-admin';

import { AdminBaseRef } from '../domain';

export const FIRESTORE_IN_OPERATOR_LIMIT = 30;
export const FIRESTORE_BATCH_OPERATIONS_LIMIT = 500;

export function isFirestoreValue(value: any): boolean {
    return value instanceof admin.firestore.FieldValue;
}

export const convertDoc = <T extends admin.firestore.DocumentData>(
    doc: admin.firestore.QueryDocumentSnapshot<T>
): AdminBaseRef<T> => {
    return {
        ...(doc.data() as T),
        id: doc.id,
        $ref: doc.ref as admin.firestore.DocumentReference<T, admin.firestore.DocumentData>,
    };
};
