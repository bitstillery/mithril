import m from '../../index'
import {getRoutes} from './routes'

// Initialize routes on client
const routes = getRoutes()

// Start client-side routing
m.route(document.getElementById('app')!, '/', routes)
