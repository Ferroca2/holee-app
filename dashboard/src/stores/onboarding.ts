import { defineStore } from 'pinia';
import { computed, ref, watch } from 'vue';
import {
    getFirestore,
    doc,
    setDoc,
    getDoc,
    Transaction,
    WriteBatch,
} from 'firebase/firestore';
import { useSessionStore } from './session';
import resolveWhen from 'src/utils/resolveWhen';

export const onboardingSteps = [
    'store-configuration',
] as const;

export type OnboardingStage = typeof onboardingSteps[number];

interface OnboardingStageData {
    'store-configuration'?: string;
}

type OnboardingStageItem<S extends OnboardingStage> = Required<OnboardingStageData>[S];

type UpdateStageOptions = { update: false; } | {
    update?: true;
} & ({
    transaction?: Transaction;
} | {
    batch?: WriteBatch;
});

export const useOnboardingStore = defineStore('onboarding', () => {
    const session = useSessionStore();

    const uid = computed(() => session.user?.uid ?? null);

    const steps = ref<OnboardingStageData | null>(null);

    watch(uid, async (uid, _, cleanup) => {
        if (!uid) {
            steps.value = null;
            return;
        }

        let update = true;

        cleanup(() => update = false);

        steps.value = null;

        const snap = await getDoc(
            doc(db, 'onboarding', uid)
        );

        if (update) {
            steps.value = snap.data() ?? {};
        }
    });

    const db = getFirestore();

    return {
        steps,
        async getSteps() {
            if (!uid.value) {
                throw new Error('User not logged in');
            }

            await resolveWhen(() => steps.value !== null);

            return steps.value!;
        },
        async updateStage<S extends OnboardingStage>(
            stage: S,
            data: OnboardingStageItem<S>,
            options = {} as UpdateStageOptions
        ) {
            const { update = true } = options;

            if (!steps.value) {
                throw new Error('User not logged in');
            }

            try {
                steps.value[stage] = data;

                if (!update) return;

                const args = [
                    doc(db, `onboarding/${uid.value}`),
                    { [stage]: data },
                    { merge: true },
                ] as const;

                if ('transaction' in options && options.transaction) {
                    options.transaction.set(...args);
                    return;
                }

                if ('batch' in options && options.batch) {
                    options.batch.set(...args);
                    return;
                }

                await setDoc(...args);
            }
            catch (err) {
                delete steps.value[stage];
                throw err;
            }
        },
    };
});
