import { createRouter, createWebHistory  } from 'vue-router';
import RegisterPage from '../pages/auth/RegisterPage.vue';
import LoginPage from '../pages/auth/LoginPage.vue';
import InvitationPage from '../pages/auth/InvitationPage.vue';
import RestorePasswordPage from '../pages/auth/RestorePasswordPage.vue';

import OverviewPage from '../pages/OverviewPage.vue';
import SitesPage from '../pages/SitesPage.vue';
import AlertPage from '../pages/AlertPage.vue';
import MetricsPage from '../pages/MetricsPage.vue';
import MetricsByHostPage from '../pages/MetricsByHostPage.vue';
import ProfilePage from '../pages/ProfilePage.vue';
import OrganizationPage from '../pages/OrganizationPage.vue';
import EventsPage from '../pages/EventsPage.vue';

import { useSession } from '../stores/user';

const router = createRouter({
    history: createWebHistory(),
    routes: [
        {
            path: '/register',
            name: 'register',
            component: RegisterPage
        },
        {
            path: '/login',
            name: 'login',
            component: LoginPage
        },
        {
            path: '/invitation',
            name: 'invitation',
            component: InvitationPage
        },
        {
            path: '/restore',
            name: 'restore',
            component: RestorePasswordPage
        },
        {
            path: '/',
            name: 'Overview',
            component: OverviewPage,
            meta: { requiresAuth: true }
        },
        {
            path: '/sites',
            name: 'Sites',
            component: SitesPage,
            meta: { requiresAuth: true }
        },
        {
            path: '/alerts',
            name: 'Alerts',
            component: AlertPage,
            meta: { requiresAuth: true }
        },
        {
            path: '/metrics',
            name: 'Metrics',
            component: MetricsPage,
            meta: { requiresAuth: true }
        },
        {
            path: '/metrics/:url/:id',
            name: 'Metrics-url',
            component: MetricsByHostPage,
            meta: { requiresAuth: true }
        },
        {
            path: '/profile',
            name: 'Profile',
            component: ProfilePage,
            meta: { requiresAuth: true }
        },
        {
            path: '/organization',
            name: 'Organization',
            component: OrganizationPage,
            meta: { requiresAuth: true }
        },
        {
            path: '/events',
            name: 'Events',
            component: EventsPage,
            meta: { requiresAuth: true }
        }
    ]
});

router.beforeEach(async (to, from, next) => {
    const session = useSession();
    const isAuthenticated = session.logged;

    // Authenticated and public route
    if (isAuthenticated && !to.meta.requiresAuth) {
        return next();
    }

    // Private route
    if (to.meta.requiresAuth) {
        // Check autentication
        if (!isAuthenticated) {
            try {
                await getLocalStorageSession();
                return next();
            } catch (error) {
                return next('/login');
            }
        }
        return next();
    }
    next();
});

export default router;