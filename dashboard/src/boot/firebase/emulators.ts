import { emulators } from '../../../../firebase.json';
import { boot } from 'quasar/wrappers';
import { connectFunctionsEmulator, getFunctions } from 'firebase/functions';
import { connectFirestoreEmulator, getFirestore } from 'firebase/firestore';
import { connectAuthEmulator, getAuth } from 'firebase/auth';
import { connectStorageEmulator, getStorage } from 'firebase/storage';

let run = true;

export default boot(() => {
    if (!run) return;

    connectAuthEmulator(
        getAuth(),
        `http://127.0.0.1:${emulators.auth.port}`,
        { disableWarnings: true }
    );

    connectFirestoreEmulator(
        getFirestore(),
        '127.0.0.1',
        emulators.firestore.port
    );

    connectFunctionsEmulator(
        getFunctions(),
        '127.0.0.1',
        emulators.functions.port
    );

    connectStorageEmulator(
        getStorage(),
        '127.0.0.1',
        emulators.storage.port
    );

    console.log('Run emulators...');

    run = false;
});
