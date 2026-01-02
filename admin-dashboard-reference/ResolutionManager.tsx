import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Scale } from 'lucide-react';

const ResolutionManager: React.FC = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Scale className="h-5 w-5" />
          Resolution Manager
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground">Resolution management coming soon...</p>
      </CardContent>
    </Card>
  );
};

export default ResolutionManager;
