"use client";

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';

interface ModbusTcpConfig {
  host: string;
  port: number;
  slaveId: number;
  timeout: number;
  retryCount: number;
  connectionMode: 'TCP' | 'TCP_RTU_OVER_TCP';
}

interface ModbusTcpNodeFormProps {
  config: ModbusTcpConfig;
  onConfigChange: (config: ModbusTcpConfig) => void;
}

const ModbusTcpNodeForm: React.FC<ModbusTcpNodeFormProps> = ({ config, onConfigChange }) => {
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
          <Label>端口 *</Label>
          <Input
            type="number"
            value={config.port}
            onChange={(e) => onConfigChange({ ...config, port: parseInt(e.target.value) || 502 })}
          />
        </div>
      </div>
      <div className="grid grid-cols-3 gap-3">
        <div>
          <Label>从站ID *</Label>
          <Input
            type="number"
            value={config.slaveId}
            onChange={(e) => onConfigChange({ ...config, slaveId: parseInt(e.target.value) || 1 })}
          />
        </div>
        <div>
          <Label>超时(ms)</Label>
          <Input
            type="number"
            value={config.timeout}
            onChange={(e) => onConfigChange({ ...config, timeout: parseInt(e.target.value) || 3000 })}
          />
        </div>
        <div>
          <Label>重试次数</Label>
          <Input
            type="number"
            value={config.retryCount}
            onChange={(e) => onConfigChange({ ...config, retryCount: parseInt(e.target.value) || 3 })}
          />
        </div>
      </div>
      <div>
        <Label>连接模式</Label>
        <Select
          value={config.connectionMode}
          onValueChange={(value) => onConfigChange({ ...config, connectionMode: value as any })}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="TCP">标准TCP</SelectItem>
            <SelectItem value="TCP_RTU_OVER_TCP">RTU over TCP</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};

export default ModbusTcpNodeForm;