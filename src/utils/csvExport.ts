import { format } from 'date-fns';

export interface UserExportData {
  user_id: string;
  name: string | null;
  email: string | null;
  user_type: string | null;
  title: string | null;
  location: string | null;
  color_admin: string | null;
  color_auto: string | null;
  intent: string | null;
  certified: boolean | null;
  created_at: string | null;
  last_active_at: string | null;
  onboarding_completed: boolean | null;
  visible_to_employers: boolean | null;
  skills: string[] | null;
}

/**
 * Convert user data to CSV format
 */
export function convertToCSV(users: UserExportData[]): string {
  if (users.length === 0) return '';

  // Define headers
  const headers = [
    'User ID',
    'Name',
    'Email',
    'User Type',
    'Title',
    'Location',
    'Admin Color',
    'Auto Color',
    'Intent Stage',
    'Certified',
    'Skills',
    'Onboarding Complete',
    'Visible to Employers',
    'Created At',
    'Last Active',
  ];

  // Create CSV rows
  const rows = users.map(user => [
    user.user_id,
    user.name || '',
    user.email || '',
    user.user_type || '',
    user.title || '',
    user.location || '',
    user.color_admin || '',
    user.color_auto || '',
    user.intent || '',
    user.certified ? 'Yes' : 'No',
    user.skills?.join('; ') || '',
    user.onboarding_completed ? 'Yes' : 'No',
    user.visible_to_employers ? 'Yes' : 'No',
    user.created_at ? format(new Date(user.created_at), 'yyyy-MM-dd HH:mm:ss') : '',
    user.last_active_at ? format(new Date(user.last_active_at), 'yyyy-MM-dd HH:mm:ss') : '',
  ]);

  // Escape and format CSV
  const escapeCsvValue = (value: string) => {
    if (value.includes(',') || value.includes('"') || value.includes('\n')) {
      return `"${value.replace(/"/g, '""')}"`;
    }
    return value;
  };

  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.map(escapeCsvValue).join(','))
  ].join('\n');

  return csvContent;
}

/**
 * Download CSV file
 */
export function downloadCSV(csvContent: string, filename: string = 'users_export.csv') {
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  URL.revokeObjectURL(url);
}

/**
 * Export users to CSV and trigger download
 */
export function exportUsersToCSV(
  users: UserExportData[],
  filename?: string
): void {
  const timestamp = format(new Date(), 'yyyy-MM-dd_HHmmss');
  const defaultFilename = `lansa_users_${timestamp}.csv`;
  
  const csvContent = convertToCSV(users);
  downloadCSV(csvContent, filename || defaultFilename);
}
