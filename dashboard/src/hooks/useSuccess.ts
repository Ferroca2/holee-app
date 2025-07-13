import { mdiCheckCircle } from '@quasar/extras/mdi-v6';
import { useQuasar } from 'quasar';

export default function useSuccess() {
    const $q = useQuasar();

    function notifySuccess(message: string) {
        return $q.notify({
            message,
            icon: mdiCheckCircle,
            position: 'bottom',
            type: 'positive',
            closeBtn: true,
        });
    }

    return notifySuccess;
}
