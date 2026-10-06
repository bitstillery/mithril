import m from './index'

if (typeof module !== 'undefined') {
    module['exports'] = m
} else {
    ;(window as Window & {m?: typeof m}).m = m
}

export default m
