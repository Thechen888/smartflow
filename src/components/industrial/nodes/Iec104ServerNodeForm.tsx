"use client";

import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface Iec104ServerConfig {
  bindAddress: string;
  port: number;
  maxConnections: number;
  commonAddress: number;
  kValue: number;
  wValue: number;
  t0Timeout: number;
  t1Timeout: number;
  t2Timeout: number;
  t3Timeout: number;
}

interface Iec104ServerNodeFormProps {
  config: Iec104ServerConfig;
  onConfigChange: (config: Iec104ServerConfig) => void;
}

const Iec104ServerNodeForm: React.FC<Iec104ServerNodeFormProps> = ({ config, onConfigChange }) => {
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
          <Label>最大连接数</Label>
          <Input
            type="number"
            value={config.maxConnections}
            onChange={(e) => onConfigChange({ ...config, maxConnections: parseInt(e.target.value) || 10 })}
          />
        </div>
        <div>
          <Label>公共地址</Label>
          <Input
            type="number"
            value={config.commonAddress}
            onChange={(e) => onConfigChange({ ...config, commonAddress: parseInt(e.target.value) || 1 })}
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
    </div>
  );
};

export default Iec104ServerNodeForm;