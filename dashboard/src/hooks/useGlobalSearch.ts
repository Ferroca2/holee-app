import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import {
    mdiHome,
    mdiRobotHappy,
    mdiHelpCircleOutline,
    mdiCog,
} from '@quasar/extras/mdi-v6';

export interface SearchResult {
    id: string;
    title: string;
    description: string;
    route: string;
    icon: string;
    category: string;
    keywords: string[];
}

export function useGlobalSearch() {
    const router = useRouter();
    const searchQuery = ref('');
    const isSearchFocused = ref(false);

    // Define all searchable pages based on current routes
    const searchablePages = computed((): SearchResult[] => [
        {
            id: 'dashboard',
            title: 'Dashboard',
            description: 'Página principal com visão geral do sistema',
            route: '/dashboard',
            icon: mdiHome,
            category: 'Principal',
            keywords: ['dashboard', 'home', 'início', 'principal', 'visão geral'],
        },
        {
            id: 'voice-agent',
            title: 'Agente de Voz',
            description: 'Configuração e gerenciamento do agente de voz',
            route: '/voice-agent',
            icon: mdiRobotHappy,
            category: 'IA',
            keywords: ['voz', 'agente', 'ia', 'inteligência artificial', 'bot', 'assistente'],
        },
        {
            id: 'faq',
            title: 'FAQ',
            description: 'Perguntas frequentes e ajuda',
            route: '/faq',
            icon: mdiHelpCircleOutline,
            category: 'Ajuda',
            keywords: ['faq', 'ajuda', 'perguntas', 'dúvidas', 'suporte', 'frequentes'],
        },
        {
            id: 'getting-started',
            title: 'Configuração da Loja',
            description: 'Configuração inicial do estabelecimento',
            route: '/getting-started',
            icon: mdiCog,
            category: 'Configuração',
            keywords: ['configuração', 'loja', 'estabelecimento', 'inicial', 'setup'],
        },
    ]);

    // Filter pages based on search query
    const filteredResults = computed(() => {
        if (!searchQuery.value.trim()) return [];

        const query = searchQuery.value.toLowerCase().trim();

        return searchablePages.value
            .filter(page => {
                // Check if query matches title, description, or keywords
                const titleMatch = page.title.toLowerCase().includes(query);
                const descriptionMatch = page.description.toLowerCase().includes(query);
                const keywordMatch = page.keywords.some(keyword =>
                    keyword.toLowerCase().includes(query)
                );

                return titleMatch || descriptionMatch || keywordMatch;
            })
            .slice(0, 6); // Limit to 6 results
    });

    // Navigate to selected page
    const navigateToPage = (result: SearchResult) => {
        router.push(result.route);
        searchQuery.value = '';
        isSearchFocused.value = false;
    };

    // Clear search
    const clearSearch = () => {
        searchQuery.value = '';
        isSearchFocused.value = false;
    };

    return {
        searchQuery,
        isSearchFocused,
        filteredResults,
        navigateToPage,
        clearSearch,
    };
}
