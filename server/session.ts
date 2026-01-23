// Session management interfaces and default in-memory implementation

export interface SessionData {
	userId: string | null
	data: Record<string, any>
	createdAt: Date
	expiresAt: Date
}

export interface SessionStore {
	getSession(sessionId: string): SessionData | null
	updateSession(sessionId: string, data: Record<string, any>): void
	createSession(userId: string | null): string
}

// Default in-memory session store implementation
// In production, this would be replaced with Redis, database, etc.
export class MemorySessionStore implements SessionStore {
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

// Helper function to extract session ID from request cookies
export function extractSessionId(req: Request): string | null {
	const cookies = req.headers.get('cookie') || ''
	const sessionIdMatch = cookies.match(/sessionId=([^;]+)/)
	return sessionIdMatch ? sessionIdMatch[1] : null
}
