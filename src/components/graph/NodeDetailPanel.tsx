import { GraphNode, EmployeeData, InsuranceClaim } from '@/types/graph';
import { X, User, Building2, FileText, Calendar, DollarSign, Briefcase, Mail, Phone } from 'lucide-react';

interface NodeDetailPanelProps {
  node: GraphNode | null;
  onClose: () => void;
}

export function NodeDetailPanel({ node, onClose }: NodeDetailPanelProps) {
  if (!node) return null;

  return (
    <div className="glass-panel absolute right-4 top-4 w-80 max-h-[calc(100vh-8rem)] overflow-y-auto animate-fade-in">
      <div className="sticky top-0 flex items-center justify-between p-4 border-b border-border/50 bg-card/90 backdrop-blur-xl">
        <div className="flex items-center gap-2">
          <NodeIcon type={node.type} />
          <h3 className="font-semibold text-foreground">{node.label}</h3>
        </div>
        <button 
          onClick={onClose}
          className="p-1.5 rounded-md hover:bg-muted transition-colors"
        >
          <X className="w-4 h-4 text-muted-foreground" />
        </button>
      </div>

      <div className="p-4 space-y-4">
        {node.type === 'entity' && <EntityDetails node={node} />}
        {node.type === 'employee' && <EmployeeDetails node={node} />}
        {node.type === 'hospital' && <HospitalDetails node={node} />}
        {node.type === 'claim' && <ClaimDetails node={node} />}
      </div>
    </div>
  );
}

function NodeIcon({ type }: { type: string }) {
  const iconClass = "w-5 h-5";
  const colors: Record<string, string> = {
    entity: 'text-primary',
    employee: 'text-graph-employee',
    hospital: 'text-graph-hospital',
    claim: 'text-graph-claim',
  };

  switch (type) {
    case 'entity':
      return <Briefcase className={`${iconClass} ${colors[type]}`} />;
    case 'employee':
      return <User className={`${iconClass} ${colors[type]}`} />;
    case 'hospital':
      return <Building2 className={`${iconClass} ${colors[type]}`} />;
    case 'claim':
      return <FileText className={`${iconClass} ${colors[type]}`} />;
    default:
      return null;
  }
}

function EntityDetails({ node }: { node: GraphNode }) {
  return (
    <div className="space-y-2">
      <DetailRow label="Total Count" value={String(node.data.count)} />
      <p className="text-sm text-muted-foreground mt-4">
        Click to expand and explore individual items.
      </p>
    </div>
  );
}

function EmployeeDetails({ node }: { node: GraphNode }) {
  const data = node.data as unknown as EmployeeData;
  const personal = data.personalDetails;
  const employment = data.employmentDetails;

  return (
    <div className="space-y-4">
      <Section title="Personal">
        <div className="space-y-2">
          <DetailRow 
            icon={<Mail className="w-3.5 h-3.5" />}
            label="Email" 
            value={personal?.email} 
          />
          <DetailRow 
            icon={<Phone className="w-3.5 h-3.5" />}
            label="Phone" 
            value={personal?.phone} 
          />
          <DetailRow label="Gender" value={personal?.gender} />
          <DetailRow label="DOB" value={personal?.dateOfBirth} />
        </div>
      </Section>

      <Section title="Employment">
        <div className="space-y-2">
          <DetailRow label="Designation" value={employment?.designation} />
          <DetailRow label="Department" value={employment?.department} />
          <DetailRow label="Status" value={employment?.status} highlight />
          <DetailRow label="Type" value={employment?.employmentType} />
        </div>
      </Section>

      {data.insuranceDetails && (
        <Section title="Insurance">
          <div className="space-y-2">
            <DetailRow label="Policy" value={data.insuranceDetails.policyNumber} mono />
            <DetailRow label="Coverage" value={data.insuranceDetails.coverageType} />
            <DetailRow label="Provider" value={data.insuranceDetails.provider} />
          </div>
        </Section>
      )}

      {node.childCount !== undefined && (
        <p className="text-xs text-muted-foreground border-t border-border/50 pt-3">
          Connected to {node.childCount} hospital(s)
        </p>
      )}
    </div>
  );
}

function HospitalDetails({ node }: { node: GraphNode }) {
  const claimCount = node.data.claimCount as number | undefined;
  const claims = node.data.claims as InsuranceClaim[] | undefined;

  return (
    <div className="space-y-4">
      <Section title="Overview">
        <div className="space-y-2">
          <DetailRow label="Name" value={node.label} />
          {claimCount !== undefined && (
            <DetailRow label="Claims" value={String(claimCount)} />
          )}
          {node.childCount !== undefined && !claimCount && (
            <DetailRow label="Employees" value={String(node.childCount)} />
          )}
        </div>
      </Section>

      {claims && claims.length > 0 && (
        <Section title="Claims Summary">
          <div className="space-y-2">
            <DetailRow 
              label="Total Amount" 
              value={`$${claims.reduce((sum, c) => sum + c.claimAmount, 0).toLocaleString()}`}
              highlight
            />
            <DetailRow 
              label="Approved" 
              value={`$${claims.reduce((sum, c) => sum + c.approvedAmount, 0).toLocaleString()}`}
            />
          </div>
        </Section>
      )}

      <p className="text-xs text-muted-foreground border-t border-border/50 pt-3">
        Click to expand and view details
      </p>
    </div>
  );
}

function ClaimDetails({ node }: { node: GraphNode }) {
  const claim = node.data as unknown as InsuranceClaim;

  return (
    <div className="space-y-4">
      <Section title="Claim Info">
        <div className="space-y-2">
          <DetailRow label="Claim ID" value={claim.claimId} mono />
          <DetailRow label="Type" value={claim.claimType} />
          <DetailRow label="Treatment" value={claim.treatmentType} />
        </div>
      </Section>

      <Section title="Dates">
        <div className="space-y-2">
          <DetailRow 
            icon={<Calendar className="w-3.5 h-3.5" />}
            label="Admission" 
            value={claim.admissionDate} 
          />
          <DetailRow 
            icon={<Calendar className="w-3.5 h-3.5" />}
            label="Discharge" 
            value={claim.dischargeDate} 
          />
        </div>
      </Section>

      <Section title="Amount">
        <div className="space-y-2">
          <DetailRow 
            icon={<DollarSign className="w-3.5 h-3.5" />}
            label="Claimed" 
            value={`${claim.currency} ${claim.claimAmount.toLocaleString()}`}
          />
          <DetailRow 
            icon={<DollarSign className="w-3.5 h-3.5" />}
            label="Approved" 
            value={`${claim.currency} ${claim.approvedAmount.toLocaleString()}`}
            highlight
          />
        </div>
      </Section>

      <Section title="Status">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <StatusBadge status={claim.claimStatus.status} />
          </div>
          <DetailRow label="Submitted" value={claim.claimStatus.submittedDate} />
          {claim.claimStatus.approvedDate && (
            <DetailRow label="Approved" value={claim.claimStatus.approvedDate} />
          )}
          {claim.claimStatus.remarks && (
            <p className="text-xs text-muted-foreground italic">
              "{claim.claimStatus.remarks}"
            </p>
          )}
        </div>
      </Section>

      {claim.documents && claim.documents.length > 0 && (
        <Section title="Documents">
          <div className="space-y-1">
            {claim.documents.map((doc, i) => (
              <div key={i} className="text-xs flex items-center gap-2 text-muted-foreground">
                <FileText className="w-3 h-3" />
                <span>{doc.documentType}</span>
              </div>
            ))}
          </div>
        </Section>
      )}
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">
        {title}
      </h4>
      {children}
    </div>
  );
}

interface DetailRowProps {
  icon?: React.ReactNode;
  label: string;
  value?: string;
  mono?: boolean;
  highlight?: boolean;
}

function DetailRow({ icon, label, value, mono, highlight }: DetailRowProps) {
  if (!value) return null;
  
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="flex items-center gap-1.5 text-muted-foreground">
        {icon}
        {label}
      </span>
      <span className={`${mono ? 'font-mono text-xs' : ''} ${highlight ? 'text-primary font-medium' : 'text-foreground'}`}>
        {value}
      </span>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'approved':
        return 'bg-secondary/20 text-secondary border-secondary/30';
      case 'pending':
        return 'bg-accent/20 text-accent border-accent/30';
      case 'rejected':
        return 'bg-destructive/20 text-destructive border-destructive/30';
      default:
        return 'bg-muted text-muted-foreground border-border';
    }
  };

  return (
    <span className={`px-2 py-0.5 text-xs font-medium rounded-full border ${getStatusColor(status)}`}>
      {status}
    </span>
  );
}
