import {MithrilTsxComponent, Vnode} from '../../../index'
import m from '../../../index'
import {$s} from '../store'

interface DisplayValueAttrs {
	signal: {value: any}
}

// Example component that receives a signal as a prop
class DisplayValue extends MithrilTsxComponent<DisplayValueAttrs> {
	view(vnode: Vnode<DisplayValueAttrs>): any {
		// vnode.attrs.signal is a Signal object
		const signal = vnode.attrs?.signal
		if (!signal) return null
		return (
			<div style="padding: 10px; background: #e3f2fd; border-radius: 4px; margin: 5px 0;">
				Value: {signal.value}
			</div>
		)
	}
}

// Component demonstrating $ prefix convention for accessing raw signals
export class SignalPropExample extends MithrilTsxComponent {
	view(vnode: Vnode): any {
		return (
			<div style="padding: 20px; border: 1px solid #ccc; margin: 10px;">
				<h2>Signal Props Example</h2>
				<p>Demonstrates passing raw signals as props using the $ prefix convention:</p>
				<ul style="font-size: 12px; color: #666;">
					<li><code>$s.count</code> returns the value (number)</li>
					<li><code>$s.$count</code> returns the raw Signal object</li>
				</ul>
				
				<div style="margin-top: 15px;">
					<h3 style="font-size: 14px;">Passing raw signal as prop:</h3>
					<DisplayValue signal={$s.$count} />
					<button onclick={() => $s.count++}>Increment (updates component)</button>
				</div>
				
				<div style="margin-top: 15px;">
					<h3 style="font-size: 14px;">Current value (direct access):</h3>
					<div style="padding: 10px; background: #fff3e0; border-radius: 4px;">
						Count: {$s.count}
					</div>
				</div>
			</div>
		)
	}
}
