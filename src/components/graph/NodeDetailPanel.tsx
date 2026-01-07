import { GraphNode } from '@/types/graph';
import { X, User, Building2, FileText, Briefcase, Mail, Phone, Calendar, DollarSign } from 'lucide-react';

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
        {node.type === 'entity' ? (
          <EntityDetails node={node} />
        ) : (
          <GenericDetails node={node} />
        )}
      </div>
    </div>
  );
}

function NodeIcon({ type }: { type: string }) {
  const iconClass = "w-5 h-5";

  // Map common entity types to icons
  const iconMap: Record<string, JSX.Element> = {
    entity: <Briefcase className={iconClass} />,
    employee: <User className={iconClass} />,
    hospital: <Building2 className={iconClass} />,
    department: <Building2 className={iconClass} />,
    claim: <FileText className={iconClass} />,
    policy: <FileText className={iconClass} />,
  };

  return iconMap[type.toLowerCase()] || <FileText className={iconClass} />;
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

function GenericDetails({ node }: { node: GraphNode }) {
  const data = node.data;

  // Skip these internal fields
  const skipFields = ['relationships', 'count'];

  // Get all fields from the data
  const fields = Object.entries(data).filter(([key]) => !skipFields.includes(key));

  // Group fields by category based on common patterns
  const categorizedFields = categorizeFields(fields);

  return (
    <div className="space-y-4">
      {Object.entries(categorizedFields).map(([category, categoryFields]) => (
        <Section key={category} title={category}>
          <div className="space-y-2">
            {categoryFields.map(([key, value]) => (
              <DetailRow
                key={key}
                icon={getIconForField(key)}
                label={formatLabel(key)}
                value={formatValue(value)}
                highlight={isHighlightField(key)}
              />
            ))}
          </div>
        </Section>
      ))}

      {node.childCount !== undefined && node.childCount > 0 && (
        <p className="text-xs text-muted-foreground border-t border-border/50 pt-3">
          Connected to {node.childCount} related item(s)
        </p>
      )}
    </div>
  );
}

// Categorize fields into logical groups
function categorizeFields(fields: [string, any][]): Record<string, [string, any][]> {
  const categories: Record<string, [string, any][]> = {};

  const personalFields = ['name', 'email', 'phone', 'gender', 'dateOfBirth', 'dob', 'age', 'address'];
  const employmentFields = ['designation', 'department', 'status', 'employmentType', 'type', 'salary', 'joinDate', 'hireDate'];
  const financialFields = ['amount', 'approvedAmount', 'sumInsured', 'currency', 'claimAmount', 'premium'];
  const dateFields = ['date', 'admissionDate', 'dischargeDate', 'submittedDate', 'approvedDate'];
  const policyFields = ['policyType', 'policyNumber', 'provider', 'coverageType'];
  const claimFields = ['claimType', 'claimId', 'treatmentType'];

  fields.forEach(([key, value]) => {
    const lowerKey = key.toLowerCase();

    if (personalFields.some(f => lowerKey.includes(f))) {
      if (!categories['Personal']) categories['Personal'] = [];
      categories['Personal'].push([key, value]);
    } else if (employmentFields.some(f => lowerKey.includes(f))) {
      if (!categories['Employment']) categories['Employment'] = [];
      categories['Employment'].push([key, value]);
    } else if (financialFields.some(f => lowerKey.includes(f))) {
      if (!categories['Financial']) categories['Financial'] = [];
      categories['Financial'].push([key, value]);
    } else if (dateFields.some(f => lowerKey.includes(f))) {
      if (!categories['Dates']) categories['Dates'] = [];
      categories['Dates'].push([key, value]);
    } else if (policyFields.some(f => lowerKey.includes(f))) {
      if (!categories['Policy Details']) categories['Policy Details'] = [];
      categories['Policy Details'].push([key, value]);
    } else if (claimFields.some(f => lowerKey.includes(f))) {
      if (!categories['Claim Details']) categories['Claim Details'] = [];
      categories['Claim Details'].push([key, value]);
    } else {
      if (!categories['Details']) categories['Details'] = [];
      categories['Details'].push([key, value]);
    }
  });

  return categories;
}

// Get appropriate icon for field
function getIconForField(key: string): JSX.Element | undefined {
  const lowerKey = key.toLowerCase();

  if (lowerKey.includes('email')) return <Mail className="w-3.5 h-3.5" />;
  if (lowerKey.includes('phone')) return <Phone className="w-3.5 h-3.5" />;
  if (lowerKey.includes('date') || lowerKey.includes('dob')) return <Calendar className="w-3.5 h-3.5" />;
  if (lowerKey.includes('amount') || lowerKey.includes('salary') || lowerKey.includes('premium')) {
    return <DollarSign className="w-3.5 h-3.5" />;
  }

  return undefined;
}

// Format field label from camelCase/snake_case to Title Case
function formatLabel(key: string): string {
  return key
    .replace(/([A-Z])/g, ' $1')
    .replace(/_/g, ' ')
    .replace(/^./, str => str.toUpperCase())
    .trim();
}

// Format value for display
function formatValue(value: any): string {
  if (value === null || value === undefined) return '-';
  if (typeof value === 'boolean') return value ? 'Yes' : 'No';
  if (typeof value === 'number') return value.toLocaleString();
  if (typeof value === 'object') return JSON.stringify(value);
  return String(value);
}

// Determine if field should be highlighted
function isHighlightField(key: string): boolean {
  const highlightFields = ['status', 'approvedAmount', 'active'];
  return highlightFields.some(f => key.toLowerCase().includes(f));
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
  if (!value || value === '-') return null;

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
