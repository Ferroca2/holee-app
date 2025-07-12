import { initializeApp } from 'firebase/app';
import { initializeFirestore } from 'firebase/firestore';
import { boot } from 'quasar/wrappers';

let run = true;

const firebaseConfigs = {
    apiKey: 'AIzaSyDDDhVU59DWiX1haxU__Dbr1sveTcC9tkQ',
    authDomain: 'holee-app.firebaseapp.com',
    projectId: 'holee-app',
    storageBucket: 'holee-app.firebasestorage.app',
    messagingSenderId: '401457448419',
    appId: '1:401457448419:web:9190b4e31ee7785bba8cd6',
};


// "async" is optional;
// more info on params: https://v2.quasar.dev/quasar-cli/boot-files
export default boot(async () => {
    if (!run) {
        return;
    }

    run = false;

    const app = initializeApp(firebaseConfigs);

    initializeFirestore(app, {
        ignoreUndefinedProperties: true,
    });

});
