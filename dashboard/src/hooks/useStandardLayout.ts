import { computed } from 'vue';
import { useQuasar } from 'quasar';

export function useStandardLayout() {
    const $q = useQuasar();

    const isMobile = computed(() => $q.screen.lt.md);

    const pageClasses = computed(() => 'q-pa-md');

    const headerClasses = computed(() => 'row items-center justify-between q-mb-lg');

    const titleClasses = computed(() => 'text-h4 text-weight-bold text-grey-8');

    const searchSectionClasses = computed(() => 'row items-center justify-between q-mb-lg q-gutter-md');

    const searchInputClasses = computed(() => isMobile.value ? 'col-12' : 'col-8');

    const filterButtonsClasses = computed(() => 'row items-center q-gutter-sm');

    const emptyStateClasses = computed(() => 'column items-center justify-center q-pa-xl text-center');

    const cardGridClasses = computed(() => 'row q-gutter-md');

    const paginationSectionClasses = computed(() => 'row items-center justify-center q-mt-lg');

    return {
        pageClasses,
        headerClasses,
        titleClasses,
        searchSectionClasses,
        emptyStateClasses,
        cardGridClasses,
        paginationSectionClasses,
        isMobile,
        searchInputClasses,
        filterButtonsClasses,
    };
}
