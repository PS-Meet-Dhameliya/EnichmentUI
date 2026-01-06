
import { GraphNode, GraphLink } from '@/types/graph';

// Mock data helpers
const DEPARTMENTS = ['Engineering', 'Sales', 'Marketing', 'HR', 'Legal', 'Finance', 'Operations', 'R&D'];
const HOSPITALS = ['General Hospital', 'City Medical', 'Saint Marys', 'Health Plus', 'Emergency Care', 'Wellness Center'];
const CLAIM_TYPES = ['Surgery', 'Consultation', 'Pharmacy', 'Emergency', 'Dental', 'Vision'];

function randomInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomItem<T>(arr: T[]): T {
  return arr[randomInt(0, arr.length - 1)];
}

export function generateLargeDataset(employeeCount = 2000): { nodes: GraphNode[]; links: GraphLink[] } {
  const nodes: GraphNode[] = [];
  const links: GraphLink[] = [];

  // 1. Create Root Entities
  const rootNode: GraphNode = {
    id: 'entity-root',
    type: 'entity',
    label: 'Organization',
    childCount: DEPARTMENTS.length,
    data: {},
    x: 0,
    y: 0
  };
  nodes.push(rootNode);

  // 2. Create Departments (as "hubs" for employees)
  const deptNodes: GraphNode[] = DEPARTMENTS.map(dept => ({
    id: `dept-${dept}`,
    type: 'entity', // Reusing entity type for clustering demo
    label: dept,
    parentId: 'entity-root',
    childCount: 0, // Will update later
    data: { category: 'Department' },
  }));
  
  nodes.push(...deptNodes);
  deptNodes.forEach(d => {
    links.push({ source: 'entity-root', target: d.id });
  });

  // 3. Create Hospitals (Secondary Hubs)
  const hospitalNodes: GraphNode[] = HOSPITALS.map(h => ({
    id: `hospital-${h.replace(/\s+/g, '-')}`,
    type: 'hospital',
    label: h,
    data: {},
    childCount: 0
  }));
  nodes.push(...hospitalNodes);

  // 4. Generate Employees
  for (let i = 0; i < employeeCount; i++) {
    const dept = randomItem(deptNodes);
    const empId = `emp-${i}`;
    
    const employeeNode: GraphNode = {
      id: empId,
      type: 'employee',
      label: `Employee ${i}`,
      parentId: dept.id,
      data: {
        department: dept.label,
        designation: `Associate ${randomInt(1, 4)}`,
        salary: randomInt(50000, 150000)
      }
    };
    
    nodes.push(employeeNode);
    links.push({ source: dept.id, target: empId });
    
    // Update dept counts
    dept.childCount = (dept.childCount || 0) + 1;

    // 5. Generate Claims (Randomly link employees to hospitals)
    if (Math.random() > 0.7) { // 30% chance of having a claim
      const hospital = randomItem(hospitalNodes);
      const claimId = `claim-${i}-${randomInt(1000, 9999)}`;
      
      const claimNode: GraphNode = {
        id: claimId,
        type: 'claim',
        label: `${randomItem(CLAIM_TYPES)} Claim`,
        parentId: empId,
        data: {
          amount: randomInt(100, 5000),
          status: Math.random() > 0.8 ? 'Pending' : 'Approved'
        }
      };
      
      nodes.push(claimNode);
      links.push({ source: empId, target: claimId });
      
      // Also link claim to hospital (optional, but good for connectivity)
      // links.push({ source: claimId, target: hospital.id }); 
      // OR link Employee directly to Hospital to show relationship
      links.push({ source: empId, target: hospital.id, label: 'Visited' });
      
      hospital.childCount = (hospital.childCount || 0) + 1;
    }
  }

  return { nodes, links };
}
