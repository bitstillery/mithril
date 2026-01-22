import {MithrilTsxComponent, Vnode} from '../../../index'
import m from '../../../index'
import {$s} from '../store'

// User profile component demonstrating nested signals
export class UserProfile extends MithrilTsxComponent {
	view(vnode: Vnode) {
		return (
			<div style="padding: 20px; border: 1px solid #ccc; margin: 10px;">
				<h2>User Profile</h2>
				<div>
					<label>
						Name:{' '}
						<input
							type="text"
							value={$s.user.name}
							oninput={(e: Event) => {
								const target = e.target as HTMLInputElement
								$s.user.name = target.value
							}}
						/>
					</label>
				</div>
				<div>
					<label>
						Email:{' '}
						<input
							type="email"
							value={$s.user.email}
							oninput={(e: Event) => {
								const target = e.target as HTMLInputElement
								$s.user.email = target.value
							}}
						/>
					</label>
				</div>
				<p>Name: {$s.user.name}</p>
				<p>Email: {$s.user.email}</p>
			</div>
		)
	}
}
