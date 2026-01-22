/// <reference path="./jsx.d.ts" />

import m from '../../index'

import {routes} from './routes'

// Set prefix to empty string for pathname-based routing (not hash-based)
m.route.prefix = ''

// Client-side routing with isomorphic router
m.route(document.getElementById('app')!, '/', routes)
