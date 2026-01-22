import { Home } from './components/Home'
import { AsyncData } from './components/AsyncData'

export const routes: Record<string, { component: any }> = {
	'/': {
		component: Home,
	},
	'/async': {
		component: AsyncData,
	},
}
