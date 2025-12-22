import type { CreatePolicy } from "./createPolicy";

export interface BuilderPolicy extends CreatePolicy {
    documentation: string;
    collection: string;
}

export const DEFAULT_POLICY: BuilderPolicy = {
    name: '',
    schema: 'public',
    table: '',
    as: 'PERMISSIVE',
    for: 'ALL',
    to: '',
    using: '',
    withCheck: '',
    documentation: '',
    collection: ''
};
