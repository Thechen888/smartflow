"use client";

import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';

interface Iec104ClientConfig {
  host: string;
  port: number;
  commonAddress: number;
  kValue: number;
  wValue: number;
  t0Timeout: number;
  t1Timeout: number;
  t2Timeout: number;
  t3Timeout: number;
  reconnectInterval: number;
  autoReconnect: boolean;
}

interface Iec104ClientNodeFormProps {
  config: Iec104ClientConfig;
  onConfigChange: (config: Iec104ClientConfig) => void;
}

const Iec104ClientNodeForm: React.FC<Iec104ClientNodeFormProps> = ({ config, onConfigChange }) => {
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
            onChange={(e) => onConfigChange({ ...config, port: parseInt(e.target.value) || 2404 })}
          />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label>公共地址</Label>
          <Input
            type="number"
            value={config.commonAddress}
            onChange={(e) => onConfigChange({ ...config, commonAddress: parseInt(e.target.value) || 1 })}
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
      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label>K值 (发送未确认帧)</Label>
          <Input
            type="number"
            value={config.kValue}
            onChange={(e) => onConfigChange({ ...config, kValue: parseInt(e.target.value) || 12 })}
          />
        </div>
        <div>
          <Label>W值 (接收未确认帧)</Label>
          <Input
            type="number"
            value={config.wValue}
            onChange={(e) => onConfigChange({ ...config, wValue: parseInt(e.target.value) || 8 })}
          />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label>T0 超时(ms)</Label>
          <Input
            type="number"
            value={config.t0Timeout}
            onChange={(e) => onConfigChange({ ...config, t0Timeout: parseInt(e.target.value) || 30000 })}
          />
        </div>
        <div>
          <Label>T1 超时(ms)</Label>
          <Input
            type="number"
            value={config.t1Timeout}
            onChange={(e) => onConfigChange({ ...config, t1Timeout: parseInt(e.target.value) || 15000 })}
          />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label>T2 超时(ms)</Label>
          <Input
            type="number"
            value={config.t2Timeout}
            onChange={(e) => onConfigChange({ ...config, t2Timeout: parseInt(e.target.value) || 10000 })}
          />
        </div>
        <div>
          <Label>T3 周期(ms)</Label>
          <Input
            type="number"
            value={config.t3Timeout}
            onChange={(e) => onConfigChange({ ...config, t3Timeout: parseInt(e.target.value) || 20000 })}
          />
        </div>
      </div>
      <div className="flex items-center space-x-2">
        <Switch
          id="auto-reconnect"
          checked={config.autoReconnect}
          onCheckedChange={(checked) => onConfigChange({ ...config, autoReconnect: checked })}
        />
        <Label htmlFor="auto-reconnect">自动重连</Label>
      </div>
    </div>
  );
};

export default Iec104ClientNodeForm;