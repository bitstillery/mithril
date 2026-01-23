import {MithrilTsxComponent, Vnode, Signal} from '../../../index'
import m from '../../../index'
import {$s} from '../state'

// Component demonstrating nested store property access
export class NestedAccess extends MithrilTsxComponent {
	view(vnode: Vnode) {
		// Access nested store signals
		const userNameSignal = $s.user.$name as Signal<string>
		const userEmailSignal = $s.user.$email as Signal<string>

		return (
			<div style="padding: 20px; border: 1px solid #ccc; margin: 10px;">
				<h2>Nested Store Access</h2>
				<p>Demonstrates accessing nested store properties and their signals:</p>
				<ul style="font-size: 12px; color: #666; margin-bottom: 15px;">
					<li><code>$s.user.name</code> - Access nested property value</li>
					<li><code>$s.user.$name</code> - Access raw signal for nested property</li>
					<li>Nested stores maintain reactivity independently</li>
				</ul>

				<div style="margin-bottom: 15px;">
					<h3 style="font-size: 14px;">User Properties:</h3>
					<div style="background: #f5f5f5; padding: 15px; border-radius: 4px;">
						<div style="margin-bottom: 10px;">
							<strong>Name:</strong> {$s.user.name}
							<br />
							<small style="color: #666;">
								Signal value: {userNameSignal.peek()}
							</small>
						</div>
						<div>
							<strong>Email:</strong> {$s.user.email}
							<br />
							<small style="color: #666;">
								Signal value: {userEmailSignal.peek()}
							</small>
						</div>
					</div>
				</div>

				<div style="display: flex; gap: 10px; flex-wrap: wrap; margin-bottom: 15px;">
					<button
						onclick={() => {
							$s.user.name = 'Jane Doe'
						}}
					>
						Change Name
					</button>
					<button
						onclick={() => {
							$s.user.email = 'jane@example.com'
						}}
					>
						Change Email
					</button>
					<button
						onclick={() => {
							$s.user = {
								name: 'Bob Smith',
								email: 'bob@example.com',
							}
						}}
					>
						Replace Entire User Object
					</button>
				</div>

				<div style="background: #fff3e0; padding: 15px; border-radius: 4px; font-size: 11px;">
					<strong>💡 Key Point:</strong> Nested stores are independent reactive units.
					<br />
					Changing <code style="background: white; padding: 2px 4px;">$s.user.name</code> only triggers
					components that access that specific property, not components accessing other user properties.
				</div>
			</div>
		)
	}
}
