import { EmployeeWithPolicies } from '@/types/graph';

export const samplePolicyData: EmployeeWithPolicies[] = [
    {
        employeeId: "EMP001",
        employeeDetails: {
            name: "John Doe",
            department: "IT",
            email: "john.doe@company.com"
        },
        insurancePolicies: [
            {
                policyId: "POL001",
                policyNumber: "HLT-987654",
                policyType: "Health",
                provider: "ABC Health Insurance",
                coverageDetails: {
                    coverageType: "Family",
                    sumInsured: 1000000,
                    currency: "USD"
                },
                policyPeriod: {
                    startDate: "2024-01-01",
                    endDate: "2024-12-31"
                },
                claims: [
                    {
                        claimId: "CLM1001",
                        claimType: "Medical",
                        claimAmount: 5000,
                        approvedAmount: 4200,
                        status: "Approved",
                        claimDate: "2024-08-20"
                    },
                    {
                        claimId: "CLM1002",
                        claimType: "Dental",
                        claimAmount: 800,
                        approvedAmount: 800,
                        status: "Approved",
                        claimDate: "2024-09-15"
                    }
                ]
            },
            {
                policyId: "POL002",
                policyNumber: "LIF-456789",
                policyType: "Life",
                provider: "XYZ Life Insurance",
                coverageDetails: {
                    coverageType: "Individual",
                    sumInsured: 5000000,
                    currency: "USD"
                },
                policyPeriod: {
                    startDate: "2024-01-01",
                    endDate: "2029-12-31"
                },
                claims: []
            }
        ]
    },
    {
        employeeId: "EMP002",
        employeeDetails: {
            name: "Jane Smith",
            department: "HR",
            email: "jane.smith@company.com"
        },
        insurancePolicies: [
            {
                policyId: "POL003",
                policyNumber: "HLT-123456",
                policyType: "Health",
                provider: "ABC Health Insurance",
                coverageDetails: {
                    coverageType: "Individual",
                    sumInsured: 500000,
                    currency: "USD"
                },
                policyPeriod: {
                    startDate: "2024-01-01",
                    endDate: "2024-12-31"
                },
                claims: [
                    {
                        claimId: "CLM2001",
                        claimType: "Medical",
                        claimAmount: 3000,
                        approvedAmount: 2800,
                        status: "Approved",
                        claimDate: "2024-07-10"
                    }
                ]
            }
        ]
    },
    {
        employeeId: "EMP003",
        employeeDetails: {
            name: "Mike Johnson",
            department: "Finance",
            email: "mike.johnson@company.com"
        },
        insurancePolicies: [
            {
                policyId: "POL004",
                policyNumber: "HLT-789012",
                policyType: "Health",
                provider: "DEF Health Insurance",
                coverageDetails: {
                    coverageType: "Family",
                    sumInsured: 1500000,
                    currency: "USD"
                },
                policyPeriod: {
                    startDate: "2024-01-01",
                    endDate: "2024-12-31"
                },
                claims: [
                    {
                        claimId: "CLM3001",
                        claimType: "Medical",
                        claimAmount: 7500,
                        approvedAmount: 7000,
                        status: "Approved",
                        claimDate: "2024-06-25"
                    },
                    {
                        claimId: "CLM3002",
                        claimType: "Pharmacy",
                        claimAmount: 500,
                        approvedAmount: 450,
                        status: "Pending",
                        claimDate: "2024-10-01"
                    }
                ]
            }
        ]
    }
];
