"use client";

import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface Iec61850ServerConfig {
  bindAddress: string;
  mmsPort: number;
  goosePort: number;
  svPort: number;
  iedName: string;
  icdFile: string;
  maxConnections: number;
}

interface Iec61850ServerNodeFormProps {
  config: Iec61850ServerConfig;
  onConfigChange: (config: Iec61850ServerConfig) => void;
}

const Iec61850ServerNodeForm: React.FC<Iec61850ServerNodeFormProps> = ({ config, onConfigChange }) => {
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label>绑定地址 *</Label>
          <Input
            value={config.bindAddress}
            onChange={(e) => onConfigChange({ ...config, bindAddress: e.target.value })}
          />
        </div>
        <div>
          <Label>MMS端口 *</Label>
          <Input
            type="number"
            value={config.mmsPort}
            onChange={(e) => onConfigChange({ ...config, mmsPort: parseInt(e.target.value) || 102 })}
          />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label>GOOSE端口</Label>
          <Input
            type="number"
            value={config.goosePort}
            onChange={(e) => onConfigChange({ ...config, goosePort: parseInt(e.target.value) || 0 })}
          />
        </div>
        <div>
          <Label>SV端口</Label>
          <Input
            type="number"
            value={config.svPort}
            onChange={(e) => onConfigChange({ ...config, svPort: parseInt(e.target.value) || 0 })}
          />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label>IED名称 *</Label>
          <Input
            value={config.iedName}
            onChange={(e) => onConfigChange({ ...config, iedName: e.target.value })}
          />
        </div>
        <div>
          <Label>最大连接数</Label>
          <Input
            type="number"
            value={config.maxConnections}
            onChange={(e) => onConfigChange({ ...config, maxConnections: parseInt(e.target.value) || 10 })}
          />
        </div>
      </div>
      <div>
        <Label>ICD文件路径</Label>
        <Input
          value={config.icdFile}
          onChange={(e) => onConfigChange({ ...config, icdFile: e.target.value })}
        />
      </div>
    </div>
  );
};

export default Iec61850ServerNodeForm;