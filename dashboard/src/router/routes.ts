import { RouteRecordRaw } from 'vue-router';

const routes: RouteRecordRaw[] = [
    {
        path: '/',
        component: () => import('layouts/login-layout.vue'),
        children: [{ path: '', component: () => import('pages/index.vue') }],
    },

    {
        path: '/voice-agent-public',
        component: () => import('layouts/login-layout.vue'),
        children: [{ path: '', component: () => import('pages/voice-agent.vue') }],
    },

    {
        path: '/getting-started',
        component: () => import('layouts/login-layout.vue'),
        children: [{ path: '', component: () => import('pages/getting-started/store-configuration.vue') }],
        meta: {
            access: 'auth-only',
        },
    },

    {
        path: '/dashboard',
        component: () => import('layouts/main-layout.vue'),
        children: [{ path: '', component: () => import('pages/home.vue') }],
        meta: {
            access: 'auth-only',
        },
    },

    {
        path: '/job/:jobId',
        component: () => import('layouts/main-layout.vue'),
        children: [{ path: '', component: () => import('pages/job-details.vue') }],
        meta: {
            access: 'auth-only',
        },
    },

    {
        path: '/voice-agent',
        component: () => import('layouts/main-layout.vue'),
        children: [{ path: '', component: () => import('pages/voice-agent.vue') }],
        meta: {
            access: 'auth-only',
        },
    },

    {
        path: '/faq',
        component: () => import('layouts/main-layout.vue'),
        children: [{ path: '', component: () => import('pages/faq.vue') }],
        meta: {
            access: 'auth-only',
        },
    },

    // Always leave this as last one,
    // but you can also remove it
    {
        path: '/:catchAll(.*)*',
        component: () => import('pages/ErrorNotFound.vue'),
    },
];

export default routes;
