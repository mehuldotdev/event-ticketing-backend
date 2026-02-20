export const SERVICES = {
    API_GATEWAY: 'api-gateway',
    AUTH_SERVICE: 'auth-service',
    USERS_SERVICE: 'users-service',
    EVENTS_SERVICE: 'events-service',
    TICKETS_SERVICE: 'tickets-service',
    PAYMENTS_SERVICE: 'payments-service',
    NOTIFICATION_SERVICE: 'notification-service',
} as const;

export const SERVICES_PORTS = {
    [SERVICES.API_GATEWAY]: 3000,
    [SERVICES.AUTH_SERVICE]: 3001,
    [SERVICES.USERS_SERVICE]: 3002,
    [SERVICES.EVENTS_SERVICE]: 3003,
    [SERVICES.TICKETS_SERVICE]: 3004,
    [SERVICES.PAYMENTS_SERVICE]: 3005,
    [SERVICES.NOTIFICATION_SERVICE]: 3006,      
} as const;