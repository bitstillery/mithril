// Simple in-memory session store
// In production, this would be replaced with Redis, database, etc.

interface SessionData {
	userId: string | null
	data: Record<string, any>
	createdAt: Date
	expiresAt: Date
}

class SessionStore {
	private sessions = new Map<string, SessionData>()

	createSession(userId: string | null): string {
		const sessionId = `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
		const now = Date.now()
		this.sessions.set(sessionId, {
			userId,
			data: {},
			createdAt: new Date(now),
			expiresAt: new Date(now + 1000 * 60 * 60 * 24), // 24 hours
		})
		return sessionId
	}

	getSession(sessionId: string): SessionData | null {
		const session = this.sessions.get(sessionId)
		if (!session) return null
		
		// Check expiration
		if (session.expiresAt.getTime() < Date.now()) {
			this.sessions.delete(sessionId)
			return null
		}
		
		return session
	}

	getSessionByUserId(userId: string): string | null {
		for (const [sessionId, session] of this.sessions.entries()) {
			if (session.userId === userId) {
				// Check expiration
				if (session.expiresAt.getTime() >= Date.now()) {
					return sessionId
				}
			}
		}
		return null
	}

	updateSession(sessionId: string, data: Record<string, any>): void {
		const session = this.sessions.get(sessionId)
		if (session) {
			// Merge data with existing session data
			// Handle nested structures like session_data
			session.data = {...session.data, ...data}
		}
	}

	deleteSession(sessionId: string): void {
		this.sessions.delete(sessionId)
	}

	// Clean up expired sessions
	cleanup(): void {
		const now = Date.now()
		for (const [sessionId, session] of this.sessions.entries()) {
			if (session.expiresAt.getTime() < now) {
				this.sessions.delete(sessionId)
			}
		}
	}
}

export const sessionStore = new SessionStore()

// Clean up expired sessions every 5 minutes
if (typeof setInterval !== 'undefined') {
	setInterval(() => {
		sessionStore.cleanup()
	}, 1000 * 60 * 5)
}
