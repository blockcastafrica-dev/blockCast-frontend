import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Timer } from 'lucide-react';

const PendingResolutionManager: React.FC = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Timer className="h-5 w-5" />
          Pending Resolutions
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground">Pending resolution management coming soon...</p>
      </CardContent>
    </Card>
  );
};

export default PendingResolutionManager;
