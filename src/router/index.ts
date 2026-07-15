import { createRouter, createWebHistory } from 'vue-router'
import AuthView from '@/view/Auth/index.vue'
import CommunityView from '@/view/Community/index.vue'
import CreationView from '@/view/Creation/index.vue'
import FeaturesView from '@/view/Features/index.vue'
import HomeView from '@/view/Home/index.vue'
import HowItWorksView from '@/view/HowItWorks/index.vue'
import PricingView from '@/view/Pricing/index.vue'

const router = createRouter({
	history: createWebHistory(import.meta.env.BASE_URL),
	routes: [
		{
			path: '/',
			name: 'home',
			component: HomeView,
		},
		{
			path: '/login',
			name: 'auth',
			component: AuthView,
		},
		{
			path: '/creation',
			name: 'creation',
			component: CreationView,
		},
		{ path: '/how-it-works', name: 'how-it-works', component: HowItWorksView },
		{ path: '/features', name: 'features', component: FeaturesView },
		{ path: '/pricing', name: 'pricing', component: PricingView },
		{ path: '/community', name: 'community', component: CommunityView },
	],
})

export default router
