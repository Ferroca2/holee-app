import { useQuasar } from 'quasar';

interface ConfirmOptions {
    title?: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    confirmColor?: string;
    cancelColor?: string;
}

export default function useConfirm() {
    const $q = useQuasar();

    function show(options: ConfirmOptions): Promise<boolean> {
        return new Promise(resolve => {
            $q.dialog({
                title: options.title || 'Confirmação',
                message: options.message,
                ok: {
                    label: options.confirmText || 'OK',
                    color: options.confirmColor || 'primary',
                    flat: true,
                },
                cancel: {
                    label: options.cancelText || 'Cancelar',
                    color: options.cancelColor || 'grey',
                    flat: true,
                },
                persistent: true,
            }).onOk(() => {
                resolve(true);
            }).onCancel(() => {
                resolve(false);
            });
        });
    }

    return {
        show,
    };
}
