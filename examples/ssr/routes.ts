import {Home} from './components/Home'
import {AsyncData} from './components/AsyncData'

export const routes: Record<string, {component: any}> = {
	// eslint-disable-next-line @typescript-eslint/naming-convention
	'/': {
		component: Home,
	},
	// eslint-disable-next-line @typescript-eslint/naming-convention
	'/async': {
		component: AsyncData,
	},
}
