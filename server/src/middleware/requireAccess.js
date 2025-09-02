import passport from "passport";

/**
 * requireAccess({ roles, allowSelfParam })
 *
 * - roles: array of allowed roles (e.g., ["ADMIN"] or ["USER","ADMIN","GUEST"])
 *   If omitted/empty, any authenticated user (any role) is allowed.
 * - allowSelfParam: name of a route param that, if equals req.user.id, grants access
 *   (useful for routes like GET /users/:id or PUT /scores/:userId)
 *
 * Usage:
 *   app.post("/admin/...", requireAccess({ roles: ["ADMIN"] }), handler)
 *   app.get("/me/:id", requireAccess({ allowSelfParam: "id" }), handler)
 *   app.post("/scores", requireAccess({ roles: ["USER","ADMIN","GUEST"] }), handler)
 */
export function requireAccess({ roles = [], allowSelfParam } = {}) {
  return [
    passport.authenticate("jwt", { session: false }),
    (req, res, next) => {
      const user = req.user; // { id, roles, ... } — set by JWT strategy
      if (!user) return res.status(401).json({ error: "Unauthorized" });

      // 1) Owner check (optional)
      if (allowSelfParam) {
        const paramVal = req.params?.[allowSelfParam];
        if (paramVal != null && String(paramVal) === String(user.id)) {
          return next();
        }
      }

      // 2) Role check
      if (roles.length === 0) {
        // No roles specified → any authenticated user allowed
        return next();
      }

      if (roles.includes(user.roles)) {
        return next();
      }

      return res.status(403).json({ error: "Forbidden" });
    },
  ];
}

/** Convenience helpers */
export const requireAuth = requireAccess(); // any authenticated role
export const requireAdmin = requireAccess({ roles: ["ADMIN"] });
export const requireUserOrAdmin = requireAccess({ roles: ["USER", "ADMIN"] });
export const requireAnyPlayer = requireAccess({ roles: ["USER", "ADMIN", "GUEST"] });
