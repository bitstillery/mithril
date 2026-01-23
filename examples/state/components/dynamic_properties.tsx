import {MithrilTsxComponent, Vnode} from '../../../index'
import m from '../../../index'
import {$s} from '../state'

// Component demonstrating dynamic property assignment
export class DynamicProperties extends MithrilTsxComponent {
	view(vnode: Vnode) {
		return (
			<div style="padding: 20px; border: 1px solid #ccc; margin: 10px;">
				<h2>Dynamic Properties</h2>
				<p>Demonstrates adding properties to stores dynamically:</p>
				<ul style="font-size: 12px; color: #666; margin-bottom: 15px;">
					<li>Properties can be added at runtime</li>
					<li>New properties automatically become reactive signals</li>
					<li>Useful for dynamic state management</li>
				</ul>

				<div style="margin-bottom: 15px;">
					<h3 style="font-size: 14px;">Current Dynamic Properties:</h3>
					<div style="background: #f5f5f5; padding: 10px; border-radius: 4px; font-family: monospace; font-size: 12px;">
						{($s as any).dynamicValue !== undefined && (
							<div>dynamicValue: {(($s as any).dynamicValue)}</div>
						)}
						{($s as any).timestamp !== undefined && (
							<div>timestamp: {(($s as any).timestamp)}</div>
						)}
						{($s as any).dynamicValue === undefined && ($s as any).timestamp === undefined && (
							<div style="color: #999;">No dynamic properties yet</div>
						)}
					</div>
				</div>

				<div style="display: flex; gap: 10px; flex-wrap: wrap;">
					<button
						onclick={() => {
							($s as any).dynamicValue = Math.floor(Math.random() * 1000)
						}}
					>
						Set Random Value
					</button>
					<button
						onclick={() => {
							($s as any).timestamp = new Date().toLocaleTimeString()
						}}
					>
						Set Timestamp
					</button>
					<button
						onclick={() => {
							delete (($s as any).dynamicValue)
							delete (($s as any).timestamp)
							m.redraw(this)
						}}
					>
						Clear Dynamic Properties
					</button>
				</div>

				<div style="margin-top: 15px; background: #e3f2fd; padding: 15px; border-radius: 4px; font-size: 11px;">
					<strong>💡 Note:</strong> Dynamic properties are automatically converted to signals when assigned.
					<br />
					Access them reactively: <code style="background: white; padding: 2px 4px;">($s as any).dynamicValue</code>
				</div>
			</div>
		)
	}
}
