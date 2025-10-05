// src/types/express.d.ts

/// <reference types="express" />

import type { User } from "@prisma/client";

declare global {
    namespace Express {
        interface AuthProps {
            userId: string | null;
            sessionId: string | null;
            orgId?: string | null;
            isAdmin?: boolean;
        }

        interface Request {
            auth: AuthProps;
            user?: User; // your added user property
        }
    }
}
