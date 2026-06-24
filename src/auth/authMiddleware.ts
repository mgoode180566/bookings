import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export interface User {
	id: string;
	name: string;
	email?: string;
	picture?: string;
	sub?: string;
}

interface AuthTokenPayload extends User {
	csrfToken: string;
	iat?: number;
	exp?: number;
}

export interface AuthenticatedRequest extends Request {
	user?: User;
	csrfToken?: string;
}

export function requireAuth(
	req: AuthenticatedRequest,
	res: Response,
	next: NextFunction,
): void {
	const token = req.cookies.auth_token;

	if (!token) {
		res.status(401).json({ error: 'Missing authentication token' });
		return;
	}

	try {
		const payload = jwt.verify(token, process.env.JWT_SECRET!) as AuthTokenPayload;

		if (!payload.csrfToken) {
			res.status(401).json({ error: 'Invalid authentication token' });
			return;
		}

		req.user = {
			id: payload.id,
			name: payload.name,
			email: payload.email,
			picture: payload.picture,
			sub: payload.id,
		};
		req.csrfToken = payload.csrfToken;
		next();
	} catch (err) {
		res.status(401).json({ error: 'Invalid or expired token' });
	}
}

export function requireCsrf(
	req: AuthenticatedRequest,
	res: Response,
	next: NextFunction,
): void {
	const csrfHeader = req.get('x-csrf-token');

	if (!csrfHeader || csrfHeader !== req.csrfToken) {
		res.status(403).json({ error: 'Invalid CSRF token' });
		return;
	}

	next();
}
