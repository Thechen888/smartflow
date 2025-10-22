"use client";

import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';

interface Iec61850ClientConfig {
  host: string;
  mmsPort: number;
  iedName: string;
  icdFile: string;
  reconnectInterval: number;
  autoReconnect: boolean;
}

interface Iec61850ClientNodeFormProps {
  config: Iec61850ClientConfig;
  onConfigChange: (config: Iec61850ClientConfig) => void;
}

const Iec61850ClientNodeForm: React.FC<Iec61850ClientNodeFormProps> = ({ config, onConfigChange }) => {
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label>主机地址 *</Label>
          <Input
            value={config.host}
            onChange={(e) => onConfigChange({ ...config, host: e.target.value })}
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
          <Label>IED名称 *</Label>
          <Input
            value={config.iedName}
            onChange={(e) => onConfigChange({ ...config, iedName: e.target.value })}
          />
        </div>
        <div>
          <Label>重连间隔(ms)</Label>
          <Input
            type="number"
            value={config.reconnectInterval}
            onChange={(e) => onConfigChange({ ...config, reconnectInterval: parseInt(e.target.value) || 5000 })}
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
      <div className="flex items-center space-x-2">
        <Switch
          id="auto-reconnect-61850"
          checked={config.autoReconnect}
          onCheckedChange={(checked) => onConfigChange({ ...config, autoReconnect: checked })}
        />
        <Label htmlFor="auto-reconnect-61850">自动重连</Label>
      </div>
    </div>
  );
};

export default Iec61850ClientNodeForm;