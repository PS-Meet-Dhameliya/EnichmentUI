/**
 * Utility functions for formatting node properties
 */

export interface FormattedProperty {
  key: string
  value: string | number | boolean | null
  displayValue: string
  type: 'text' | 'number' | 'boolean' | 'date' | 'email' | 'url' | 'json'
}

/**
 * Format a property value for display
 */
export function formatPropertyValue(key: string, value: unknown): FormattedProperty {
  const lowerKey = key.toLowerCase()
  
  // Handle null/undefined
  if (value === null || value === undefined) {
    return {
      key,
      value: null,
      displayValue: '—',
      type: 'text'
    }
  }

  // Handle dates
  if (lowerKey.includes('date') || lowerKey.includes('deadline') || lowerKey.includes('created') || lowerKey.includes('updated')) {
    if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}/.test(value)) {
      try {
        const date = new Date(value)
        return {
          key,
          value: value as string,
          displayValue: date.toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          }),
          type: 'date'
        }
      } catch {
        // Fall through to default
      }
    }
  }

  // Handle emails
  if (lowerKey.includes('email') && typeof value === 'string' && value.includes('@')) {
    return {
      key,
      value: value,
      displayValue: value,
      type: 'email'
    }
  }

  // Handle URLs
  if (lowerKey.includes('url') || lowerKey.includes('link') || (typeof value === 'string' && value.startsWith('http'))) {
    return {
      key,
      value: value as string,
      displayValue: value as string,
      type: 'url'
    }
  }

  // Handle numbers
  if (typeof value === 'number') {
    // Format currency
    if (lowerKey.includes('price') || lowerKey.includes('amount') || lowerKey.includes('cost') || lowerKey.includes('salary')) {
      return {
        key,
        value,
        displayValue: new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: 'USD'
        }).format(value),
        type: 'number'
      }
    }
    // Format regular numbers with commas
    return {
      key,
      value,
      displayValue: new Intl.NumberFormat('en-US').format(value),
      type: 'number'
    }
  }

  // Handle booleans
  if (typeof value === 'boolean') {
    return {
      key,
      value,
      displayValue: value ? 'Yes' : 'No',
      type: 'boolean'
    }
  }

  // Handle objects/arrays
  if (typeof value === 'object') {
    return {
      key,
      value: JSON.stringify(value),
      displayValue: JSON.stringify(value, null, 2),
      type: 'json'
    }
  }

  // Default: string
  return {
    key,
    value: String(value),
    displayValue: String(value),
    type: 'text'
  }
}

/**
 * Group properties into logical sections
 */
export function groupProperties(data: Record<string, unknown>): Record<string, Record<string, unknown>> {
  const groups: Record<string, Record<string, unknown>> = {
    'Basic Information': {},
    'Details': {},
    'Relationships': {},
    'Metadata': {}
  }

  Object.entries(data).forEach(([key, value]) => {
    const lowerKey = key.toLowerCase()
    
    // Skip internal fields
    if (lowerKey === 'id' || lowerKey === 'type' || lowerKey === 'name' || lowerKey === 'label') {
      groups['Basic Information'][key] = value
    } else if (lowerKey.includes('relationship') || lowerKey.includes('related') || lowerKey === 'childcount') {
      groups['Relationships'][key] = value
    } else if (lowerKey.includes('date') || lowerKey.includes('time') || lowerKey.includes('created') || lowerKey.includes('updated')) {
      groups['Metadata'][key] = value
    } else {
      groups['Details'][key] = value
    }
  })

  // Remove empty groups
  Object.keys(groups).forEach(key => {
    if (Object.keys(groups[key]).length === 0) {
      delete groups[key]
    }
  })

  return groups
}


