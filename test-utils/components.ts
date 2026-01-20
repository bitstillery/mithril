import m from "../render/hyperscript.js"
import type { Component } from "../index.js"

interface ComponentFactory {
	kind: string
	create: (methods?: Record<string, any>) => Component | (() => Component)
}

const components: ComponentFactory[] = [
	{
		kind: "POJO",
		create: function(methods?: Record<string, any>) {
			const res: Component = {view: function() {return m("div")}}
			Object.keys(methods || {}).forEach(function(method){res[method as keyof Component] = methods![method] as any})
			return res
		}
	}, {
		kind: "constructible",
		create: function(methods?: Record<string, any>) {
			function Res(){}
			Res.prototype.view = function() {return m("div")}
			Object.keys(methods || {}).forEach(function(method){(Res.prototype as any)[method] = methods![method]})
			return Res as any
		}
	}, {
		kind: "closure",
		create: function(methods?: Record<string, any>) {
			return function() {
				const res: Component = {view: function() {return m("div")}}
				Object.keys(methods || {}).forEach(function(method){res[method as keyof Component] = methods![method] as any})
				return res
			}
		}
	}
]

export default components
