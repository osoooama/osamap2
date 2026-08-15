/**
 * Auth stub — all middleware is a no-op (auth disabled per project requirement)
 */
function requireAuth(req, res, next) { next(); }
function requireAdmin(req, res, next) { next(); }
function requireRole(_role) {
    return (req, res, next) => { next(); };
}

module.exports = {
    passport: { authenticate: () => (req, res, next) => next() },
    requireAuth,
    requireAdmin,
    requireRole,
    hashPassword: async (pw) => pw,
    verifyPassword: async () => true,
    generateToken: () => '',
    verifyToken: () => ({}),
    configureLocalStrategy: () => {},
    configureJwtStrategy: () => {},
    configureSessionSerialization: () => {},
    configureOidcStrategy: () => {},
};
