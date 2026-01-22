import type {ComponentType} from '../../index'
import {Home} from './components/home'
import {AsyncData} from './components/async_data'

export const routes: Record<string, {component: ComponentType}> = {
	// eslint-disable-next-line @typescript-eslint/naming-convention
	'/': {
		component: Home,
	},
	// eslint-disable-next-line @typescript-eslint/naming-convention
	'/async': {
		component: AsyncData,
	},
}
