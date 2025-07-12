import resolveWhen from 'utils/resolveWhen';
import { boot } from 'quasar/wrappers';
import { useSessionStore } from 'stores/session';
import { onboardingSteps, useOnboardingStore } from 'stores/onboarding';
import { useStoresStore } from 'stores/stores';

export default boot(({ router, store: pinia }) => {
    const stepToPath = {
        'store-configuration': '',
    };

    router.beforeEach(async to => {
        const session = useSessionStore();
        const onboarding = useOnboardingStore(pinia);
        const stores = useStoresStore(pinia);

        await resolveWhen(() => !session.loading);

        if (session.user) {
            const nextStep = await getNextRegistrationStep(onboarding);

            if (!nextStep && to.meta.access === 'guests-only') {
                await resolveWhen(() => Boolean(stores.currentStore));
            }

            if (nextStep) {
                const newPath = `/getting-started/${stepToPath[nextStep]}`;

                if (newPath === to.path) return;

                return {
                    path: newPath,
                };
            }
        }

        if (to.meta.access === 'auth-only' && !session.user) {
            return {
                path: '/',
            };
        }
    });

    async function getNextRegistrationStep(
        onboarding: ReturnType<typeof useOnboardingStore>
    ) {
        const steps = await onboarding.getSteps();

        const completed = new Set(Object.keys(steps));

        return onboardingSteps.find(step => !completed.has(step)) ?? null;
    }
});
