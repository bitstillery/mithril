/// <reference path="./jsx.d.ts" />

import m from '@bitstillery/mithril'
import {App} from './components/App'

// Client-side hydration
// Mount the App component - it will read the pathname from window.location
m.mount(document.getElementById('app')!, App)
