import { computed } from 'vue';
import { useRoute } from 'vue-router';
import {
    mdiAccountGroupOutline,
    mdiHelpCircleOutline,
    mdiAccountVoice,
} from '@quasar/extras/mdi-v6';

export interface MenuItem {
    label: string;
    route: string;
    icon: string;
}

export function useSidebarMenu() {
    const route = useRoute();

    const menuItems = computed(() => {
        const items: MenuItem[] = [
            {
                label: 'Vagas',
                icon: mdiAccountGroupOutline,
                route: '/dashboard',
            },
            {
                label: 'Agente de Voz',
                icon: mdiAccountVoice,
                route: '/voice-agent',
            },
            {
                label: 'FAQ',
                icon: mdiHelpCircleOutline,
                route: '/faq',
            },
        ];

        return items;
    });

    function isChildSelected(item: MenuItem): boolean {
        return route.path === item.route;
    }

    function handleMenuClick(item: MenuItem) {
        // Navigation is handled by the router-link/to property
        console.log('Menu clicked:', item.label);
    }

    return {
        menuItems,
        isChildSelected,
        handleMenuClick,
    };
}
