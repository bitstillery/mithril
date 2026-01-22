// @ts-nocheck
import m from './index'

if (typeof module !== 'undefined') {
	(module as any)['exports'] = m
} else {
	(window as any).m = m
}

export default m
