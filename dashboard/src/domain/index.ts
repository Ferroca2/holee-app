import { DocumentReference, DocumentData } from 'firebase/firestore';

/* CLIENT */

export type BaseRef<T> = T & {
    id: string;
    $ref: DocumentReference<T, DocumentData>;
};

export type BaseRefMap<T> = Record<
BaseRef<T>['$ref']['path'],
BaseRef<T>
>;
