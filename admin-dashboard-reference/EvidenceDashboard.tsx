import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText } from 'lucide-react';

interface EvidenceDashboardProps {
  walletAddress: string;
}

const EvidenceDashboard: React.FC<EvidenceDashboardProps> = ({ walletAddress }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Evidence Review
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground text-center py-8">
          No evidence submissions to review
        </p>
      </CardContent>
    </Card>
  );
};

export default EvidenceDashboard;
