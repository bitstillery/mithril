/// <reference path="./jsx.d.ts" />

import m from '../../index'

import {App} from './components/app'

// Client-side hydration
// Mount the App component - it will read the pathname from window.location
m.mount(document.getElementById('app')!, App)
