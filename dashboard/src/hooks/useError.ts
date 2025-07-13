import { mdiAlertCircle } from '@quasar/extras/mdi-v6';
import { useQuasar } from 'quasar';

export default function useError() {
    const $q = useQuasar();

    function notifyError(err: unknown) {
        let message: string;

        if (typeof err === 'string') {
            message = err;
        }
        else if (err instanceof Error && err.code) {
            message = getFirebaseErrorMessage(err);
        }
        else {
            console.error(err);
            message = 'Um erro inesperado ocorreu.';
        }

        return $q.notify({
            message,
            icon: mdiAlertCircle,
            position: 'bottom',
            type: 'negative',
            closeBtn: true,
        });
    }

    return notifyError;
}

function getFirebaseErrorMessage(err: Error) {
    if (err.code?.startsWith('functions/')) {
        if (err.code === 'functions/internal') {
            return 'Um erro inesperado ocorreu.';
        }

        return err.message;
    }

    if (err.code?.startsWith('auth/')) {
        switch (err.code) {
            case 'auth/email-already-in-use':
                return 'Este e-mail já está em uso.';
            case 'auth/wrong-password':
            case 'auth/user-not-found':
                return 'Email ou senha incorretos.';
        }
    }

    console.error(err);

    return 'Um erro inesperado ocorreu.';
}
