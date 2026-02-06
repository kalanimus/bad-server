import { Request, Response, NextFunction } from 'express'

const sanitize = (obj: any): any => {
    if (typeof obj !== 'object' || obj === null) return obj

    if (Array.isArray(obj)) {
        return obj.map((item) => sanitize(item))
    }

    const sanitized: any = {}
    for (const key in obj) {
        if (key.startsWith('$') || key.includes('.')) {
            continue
        }
        sanitized[key] = sanitize(obj[key])
    }
    return sanitized
}

export const sanitizeMiddleware = (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    req.body = sanitize(req.body)
    req.query = sanitize(req.query)
    req.params = sanitize(req.params)
    next()
}
