import { EmployeeData } from '@/types/graph';

export const sampleEmployees: EmployeeData[] = [
  {
    employeeId: "EMP001",
    personalDetails: {
      firstName: "John",
      lastName: "Doe",
      dateOfBirth: "1990-05-15",
      gender: "Male",
      email: "john.doe@company.com",
      phone: "+1-555-123-4567"
    },
    employmentDetails: {
      designation: "Software Engineer",
      department: "IT",
      dateOfJoining: "2018-03-01",
      employmentType: "Full-Time",
      status: "Active"
    },
    address: {
      street: "123 Main Street",
      city: "San Francisco",
      state: "CA",
      postalCode: "94105",
      country: "USA"
    },
    insuranceDetails: {
      policyNumber: "POL-INS-987654",
      provider: "ABC Health Insurance",
      coverageType: "Family",
      policyStartDate: "2024-01-01",
      policyEndDate: "2024-12-31"
    },
    insuranceClaims: [
      {
        claimId: "CLM1001",
        claimType: "Medical",
        hospitalName: "City Care Hospital",
        treatmentType: "Surgery",
        admissionDate: "2024-08-10",
        dischargeDate: "2024-08-15",
        claimAmount: 5000,
        approvedAmount: 4200,
        currency: "USD",
        claimStatus: {
          status: "Approved",
          submittedDate: "2024-08-20",
          approvedDate: "2024-09-01",
          remarks: "Approved as per policy terms"
        },
        documents: [
          { documentType: "Hospital Bill", documentId: "DOC001", uploadedDate: "2024-08-20" },
          { documentType: "Discharge Summary", documentId: "DOC002", uploadedDate: "2024-08-20" }
        ]
      },
      {
        claimId: "CLM1002",
        claimType: "Medical",
        hospitalName: "Green Valley Clinic",
        treatmentType: "Consultation",
        admissionDate: "2024-10-05",
        dischargeDate: "2024-10-05",
        claimAmount: 300,
        approvedAmount: 250,
        currency: "USD",
        claimStatus: {
          status: "Approved",
          submittedDate: "2024-10-06",
          approvedDate: "2024-10-10",
          remarks: "Partial approval"
        },
        documents: [
          { documentType: "Consultation Bill", documentId: "DOC003", uploadedDate: "2024-10-06" }
        ]
      }
    ]
  },
  {
    employeeId: "EMP002",
    personalDetails: {
      firstName: "Sarah",
      lastName: "Chen",
      dateOfBirth: "1988-11-22",
      gender: "Female",
      email: "sarah.chen@company.com",
      phone: "+1-555-234-5678"
    },
    employmentDetails: {
      designation: "Product Manager",
      department: "Product",
      dateOfJoining: "2019-06-15",
      employmentType: "Full-Time",
      status: "Active"
    },
    address: {
      street: "456 Oak Avenue",
      city: "San Francisco",
      state: "CA",
      postalCode: "94102",
      country: "USA"
    },
    insuranceDetails: {
      policyNumber: "POL-INS-987655",
      provider: "ABC Health Insurance",
      coverageType: "Individual",
      policyStartDate: "2024-01-01",
      policyEndDate: "2024-12-31"
    },
    insuranceClaims: [
      {
        claimId: "CLM2001",
        claimType: "Medical",
        hospitalName: "City Care Hospital",
        treatmentType: "Emergency",
        admissionDate: "2024-07-20",
        dischargeDate: "2024-07-22",
        claimAmount: 3500,
        approvedAmount: 3500,
        currency: "USD",
        claimStatus: {
          status: "Approved",
          submittedDate: "2024-07-25",
          approvedDate: "2024-08-01",
          remarks: "Full coverage approved"
        },
        documents: [
          { documentType: "Hospital Bill", documentId: "DOC004", uploadedDate: "2024-07-25" }
        ]
      },
      {
        claimId: "CLM2002",
        claimType: "Dental",
        hospitalName: "Metro Dental Center",
        treatmentType: "Root Canal",
        admissionDate: "2024-09-15",
        dischargeDate: "2024-09-15",
        claimAmount: 800,
        approvedAmount: 600,
        currency: "USD",
        claimStatus: {
          status: "Partially Approved",
          submittedDate: "2024-09-16",
          approvedDate: "2024-09-25",
          remarks: "Partial coverage as per dental plan"
        },
        documents: [
          { documentType: "Treatment Bill", documentId: "DOC005", uploadedDate: "2024-09-16" }
        ]
      }
    ]
  },
  {
    employeeId: "EMP003",
    personalDetails: {
      firstName: "Michael",
      lastName: "Rodriguez",
      dateOfBirth: "1985-03-08",
      gender: "Male",
      email: "michael.r@company.com",
      phone: "+1-555-345-6789"
    },
    employmentDetails: {
      designation: "Senior Designer",
      department: "Design",
      dateOfJoining: "2017-01-10",
      employmentType: "Full-Time",
      status: "Active"
    },
    address: {
      street: "789 Pine Road",
      city: "Oakland",
      state: "CA",
      postalCode: "94612",
      country: "USA"
    },
    insuranceDetails: {
      policyNumber: "POL-INS-987656",
      provider: "ABC Health Insurance",
      coverageType: "Family",
      policyStartDate: "2024-01-01",
      policyEndDate: "2024-12-31"
    },
    insuranceClaims: [
      {
        claimId: "CLM3001",
        claimType: "Medical",
        hospitalName: "Green Valley Clinic",
        treatmentType: "Annual Checkup",
        admissionDate: "2024-06-10",
        dischargeDate: "2024-06-10",
        claimAmount: 200,
        approvedAmount: 200,
        currency: "USD",
        claimStatus: {
          status: "Approved",
          submittedDate: "2024-06-11",
          approvedDate: "2024-06-15",
          remarks: "Preventive care fully covered"
        },
        documents: [
          { documentType: "Medical Report", documentId: "DOC006", uploadedDate: "2024-06-11" }
        ]
      },
      {
        claimId: "CLM3002",
        claimType: "Medical",
        hospitalName: "City Care Hospital",
        treatmentType: "Physiotherapy",
        admissionDate: "2024-11-01",
        dischargeDate: "2024-11-15",
        claimAmount: 1500,
        approvedAmount: 1200,
        currency: "USD",
        claimStatus: {
          status: "Approved",
          submittedDate: "2024-11-16",
          approvedDate: "2024-11-25",
          remarks: "10 sessions covered"
        },
        documents: [
          { documentType: "Treatment Plan", documentId: "DOC007", uploadedDate: "2024-11-16" },
          { documentType: "Session Records", documentId: "DOC008", uploadedDate: "2024-11-16" }
        ]
      }
    ]
  },
  {
    employeeId: "EMP004",
    personalDetails: {
      firstName: "Emily",
      lastName: "Watson",
      dateOfBirth: "1992-07-30",
      gender: "Female",
      email: "emily.watson@company.com",
      phone: "+1-555-456-7890"
    },
    employmentDetails: {
      designation: "Data Analyst",
      department: "Analytics",
      dateOfJoining: "2020-09-01",
      employmentType: "Full-Time",
      status: "Active"
    },
    address: {
      street: "321 Cedar Lane",
      city: "Berkeley",
      state: "CA",
      postalCode: "94704",
      country: "USA"
    },
    insuranceDetails: {
      policyNumber: "POL-INS-987657",
      provider: "ABC Health Insurance",
      coverageType: "Individual",
      policyStartDate: "2024-01-01",
      policyEndDate: "2024-12-31"
    },
    insuranceClaims: [
      {
        claimId: "CLM4001",
        claimType: "Vision",
        hospitalName: "Vision Plus Center",
        treatmentType: "Eye Exam",
        admissionDate: "2024-05-20",
        dischargeDate: "2024-05-20",
        claimAmount: 150,
        approvedAmount: 150,
        currency: "USD",
        claimStatus: {
          status: "Approved",
          submittedDate: "2024-05-21",
          approvedDate: "2024-05-25",
          remarks: "Annual vision check covered"
        },
        documents: [
          { documentType: "Exam Report", documentId: "DOC009", uploadedDate: "2024-05-21" }
        ]
      }
    ]
  }
];
