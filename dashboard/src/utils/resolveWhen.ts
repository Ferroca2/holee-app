import { watchEffect } from 'vue';

export default async function resolveWhen(
    condition: () => boolean
) {
    let unwatch: () => void;

    try {
        await new Promise<void>((resolve, reject) => {
            // unwatch está definido aqui
            unwatch = watchEffect(() => {
                try {
                    if (condition()) resolve();
                }
                catch (err) {
                    reject(err);
                }
            });
        });
    }
    finally {
        // @ts-expect-error unwatch está definido
        unwatch();
    }
}
