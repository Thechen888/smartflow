"use client";

import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface EmsIoConfig {
  diStartAddress: string;
  diCount: number;
  doStartAddress: string;
  doCount: number;
}

interface EmsIoNodeFormProps {
  config: EmsIoConfig;
  onConfigChange: (config: EmsIoConfig) => void;
}

const EmsIoNodeForm: React.FC<EmsIoNodeFormProps> = ({ config, onConfigChange }) => {
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label>DI起始地址 *</Label>
          <Input
            value={config.diStartAddress}
            onChange={(e) => onConfigChange({ ...config, diStartAddress: e.target.value })}
            placeholder="例如: DI001"
          />
        </div>
        <div>
          <Label>计数（DI）*</Label>
          <Input
            type="number"
            value={config.diCount}
            onChange={(e) => onConfigChange({ ...config, diCount: parseInt(e.target.value) || 0 })}
            placeholder="DI点位数量"
          />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label>DO起始地址 *</Label>
          <Input
            value={config.doStartAddress}
            onChange={(e) => onConfigChange({ ...config, doStartAddress: e.target.value })}
            placeholder="例如: DO001"
          />
        </div>
        <div>
          <Label>计数（DO）*</Label>
          <Input
            type="number"
            value={config.doCount}
            onChange={(e) => onConfigChange({ ...config, doCount: parseInt(e.target.value) || 0 })}
            placeholder="DO点位数量"
          />
        </div>
      </div>
    </div>
  );
};

export default EmsIoNodeForm;