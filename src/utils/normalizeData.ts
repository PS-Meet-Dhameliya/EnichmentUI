import { EmployeeData, NormalizedData, InsuranceClaim } from '@/types/graph';

export function normalizeEmployeeData(employees: EmployeeData[]): NormalizedData {
  const employeesMap = new Map<string, EmployeeData>();
  const hospitalsMap = new Map<string, { name: string; claims: InsuranceClaim[]; employeeIds: string[] }>();
  const claimsMap = new Map<string, InsuranceClaim & { employeeId: string }>();

  employees.forEach(employee => {
    employeesMap.set(employee.employeeId, employee);

    employee.insuranceClaims.forEach(claim => {
      // Add to claims map
      claimsMap.set(claim.claimId, { ...claim, employeeId: employee.employeeId });

      // Add to hospitals map
      const hospitalKey = claim.hospitalName;
      if (!hospitalsMap.has(hospitalKey)) {
        hospitalsMap.set(hospitalKey, { name: hospitalKey, claims: [], employeeIds: [] });
      }
      const hospital = hospitalsMap.get(hospitalKey)!;
      hospital.claims.push(claim);
      if (!hospital.employeeIds.includes(employee.employeeId)) {
        hospital.employeeIds.push(employee.employeeId);
      }
    });
  });

  return { employees: employeesMap, hospitals: hospitalsMap, claims: claimsMap };
}

export function getEmployeesByHospital(data: NormalizedData, hospitalName: string): EmployeeData[] {
  const hospital = data.hospitals.get(hospitalName);
  if (!hospital) return [];
  return hospital.employeeIds
    .map(id => data.employees.get(id))
    .filter((e): e is EmployeeData => e !== undefined);
}

export function getHospitalsByEmployee(data: NormalizedData, employeeId: string): string[] {
  const employee = data.employees.get(employeeId);
  if (!employee) return [];
  return [...new Set(employee.insuranceClaims.map(c => c.hospitalName))];
}

export function getClaimsByEmployeeAndHospital(
  data: NormalizedData,
  employeeId: string,
  hospitalName: string
): InsuranceClaim[] {
  const employee = data.employees.get(employeeId);
  if (!employee) return [];
  return employee.insuranceClaims.filter(c => c.hospitalName === hospitalName);
}

export function getClaimsByHospitalAndEmployee(
  data: NormalizedData,
  hospitalName: string,
  employeeId: string
): InsuranceClaim[] {
  return getClaimsByEmployeeAndHospital(data, employeeId, hospitalName);
}
