import { FieldValue, FieldPath, DocumentReference, DocumentData } from 'firebase-admin/firestore';

// Firestore FieldValue for atomic operations
export const fieldValue = FieldValue;
export const fieldPath = FieldPath;


/* SERVER */

export type AdminBaseRef<T> = T & {
    id: string;
    $ref: DocumentReference<T, DocumentData>;
};
