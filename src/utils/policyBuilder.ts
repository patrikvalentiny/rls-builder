import type { CreatePolicy } from '../types/createPolicy';

export function buildCreatePolicySql(policy: CreatePolicy): string {
    let sql = `CREATE POLICY "${policy.name}" ON ${policy.schema ? `${policy.schema}.` : ''}${policy.table}`;

    if (policy.as !== 'PERMISSIVE') sql += ` AS ${policy.as}`;
    if (policy.for !== 'ALL') sql += ` FOR ${policy.for}`;

    const toValue = policy.to.trim();
    if (toValue && toValue.toUpperCase() !== 'PUBLIC') sql += ` TO ${toValue}`;

    if (policy.using.trim()) sql += ` USING (${policy.using})`;
    if (policy.withCheck.trim()) sql += ` WITH CHECK (${policy.withCheck})`;

    return sql;
}
