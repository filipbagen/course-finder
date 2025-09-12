import { Metadata } from 'next';
import AuthDiagnostics from './auth-diagnostics';
import DatabaseDiagnostics from './database-diagnostics';

export const metadata: Metadata = {
  title: 'Diagnostics',
  description: 'System diagnostics and health checks',
};

export default function DiagnosticsPage() {
  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-8">System Diagnostics</h1>

      <div className="space-y-8">
        <AuthDiagnostics />
        <DatabaseDiagnostics />
      </div>
    </div>
  );
}
