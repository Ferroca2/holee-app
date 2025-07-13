import { QueryDocumentSnapshot } from 'firebase/firestore';
import { BaseRef } from '../domain';

export const convertDoc = <T>(doc: QueryDocumentSnapshot<T>): BaseRef<T> => ({
    ...doc.data(),
    id: doc.id,
    $ref: doc.ref,
});
