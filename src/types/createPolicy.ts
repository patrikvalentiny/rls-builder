export const POLICY_TYPES = ['PERMISSIVE', 'RESTRICTIVE'] as const;
export const COMMAND_TYPES = ['ALL', 'SELECT', 'INSERT', 'UPDATE', 'DELETE'] as const;

export interface CreatePolicy {
    name: string;
    schema: string;
    table: string;
    as: typeof POLICY_TYPES[number];
    for: typeof COMMAND_TYPES[number];
    to: string;
    using: string;
    withCheck: string;
}
