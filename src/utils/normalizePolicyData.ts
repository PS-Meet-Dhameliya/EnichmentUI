import { EmployeeWithPolicies, InsurancePolicy, PolicyClaim } from '@/types/graph';

export interface NormalizedPolicyData {
    employees: Map<string, EmployeeWithPolicies>;
    policies: Map<string, InsurancePolicy & { employeeId: string }>;
    claims: Map<string, PolicyClaim & { employeeId: string; policyId: string }>;
}

export function normalizePolicyData(data: EmployeeWithPolicies[]): NormalizedPolicyData {
    const employees = new Map<string, EmployeeWithPolicies>();
    const policies = new Map<string, InsurancePolicy & { employeeId: string }>();
    const claims = new Map<string, PolicyClaim & { employeeId: string; policyId: string }>();

    data.forEach(employee => {
        employees.set(employee.employeeId, employee);

        employee.insurancePolicies.forEach(policy => {
            policies.set(policy.policyId, {
                ...policy,
                employeeId: employee.employeeId
            });

            policy.claims.forEach(claim => {
                claims.set(claim.claimId, {
                    ...claim,
                    employeeId: employee.employeeId,
                    policyId: policy.policyId
                });
            });
        });
    });

    return { employees, policies, claims };
}

export function getPoliciesByEmployee(data: NormalizedPolicyData, employeeId: string): InsurancePolicy[] {
    const employee = data.employees.get(employeeId);
    return employee?.insurancePolicies || [];
}

export function getClaimsByPolicy(data: NormalizedPolicyData, policyId: string): PolicyClaim[] {
    const policy = data.policies.get(policyId);
    return policy?.claims || [];
}

export function getEmployeesByPolicy(data: NormalizedPolicyData, policyId: string): string[] {
    const policy = data.policies.get(policyId);
    return policy ? [policy.employeeId] : [];
}
