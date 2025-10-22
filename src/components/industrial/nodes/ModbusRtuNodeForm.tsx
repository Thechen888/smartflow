"use client";

import React from 'react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';

interface ModbusRtuConfig {
  serialPort: string;
  baudRate: number;
  dataBits: 7 | 8;
  stopBits: 1 | 2;
  parity: 'NONE' | 'EVEN' | 'ODD';
  slaveId: number;
  timeout: number;
  retryCount: number;
}

interface ModbusRtuNodeFormProps {
  config: ModbusRtuConfig;
  onConfigChange: (config: ModbusRtuConfig) => void;
}

const ModbusRtuNodeForm: React.FC<ModbusRtuNodeFormProps> = ({ config, onConfigChange }) => {
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label>串口 *</Label>
          <Input
            value={config.serialPort}
            onChange={(e) => onConfigChange({ ...config, serialPort: e.target.value })}
          />
        </div>
        <div>
          <Label>波特率 *</Label>
          <Select
            value={config.baudRate.toString()}
            onValueChange={(value) => onConfigChange({ ...config, baudRate: parseInt(value) })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {[1200, 2400, 4800, 9600, 19200, 38400, 57600, 115200].map(rate => (
                <SelectItem key={rate} value={rate.toString()}>{rate}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="grid grid-cols-4 gap-3">
        <div>
          <Label>数据位</Label>
          <Select
            value={config.dataBits.toString()}
            onValueChange={(value) => onConfigChange({ ...config, dataBits: parseInt(value) as 7 | 8 })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">7位</SelectItem>
              <SelectItem value="8">8位</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label>停止位</Label>
          <Select
            value={config.stopBits.toString()}
            onValueChange={(value) => onConfigChange({ ...config, stopBits: parseInt(value) as 1 | 2 })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1">1位</SelectItem>
              <SelectItem value="2">2位</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label>校验位</Label>
          <Select
            value={config.parity}
            onValueChange={(value) => onConfigChange({ ...config, parity: value as any })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="NONE">无校验</SelectItem>
              <SelectItem value="EVEN">偶校验</SelectItem>
              <SelectItem value="ODD">奇校验</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label>从站ID *</Label>
          <Input
            type="number"
            value={config.slaveId}
            onChange={(e) => onConfigChange({ ...config, slaveId: parseInt(e.target.value) || 1 })}
          />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
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
    </div>
  );
};

export default ModbusRtuNodeForm;