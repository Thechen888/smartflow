"use client";

import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Eye, EyeOff } from 'lucide-react';

interface Dlt645RtuConfig {
  serialPort: string;
  baudRate: number;
  dataBits: 7 | 8;
  stopBits: 1 | 2;
  parity: 'NONE' | 'EVEN' | 'ODD';
  address: string;
  password: string;
  timeout: number;
}

interface Dlt645RtuNodeFormProps {
  config: Dlt645RtuConfig;
  onConfigChange: (config: Dlt645RtuConfig) => void;
}

const Dlt645RtuNodeForm: React.FC<Dlt645RtuNodeFormProps> = ({ config, onConfigChange }) => {
  const [showPassword, setShowPassword] = useState(false);

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
              {[1200, 2400, 4800, 9600].map(rate => (
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
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label>电表地址 (12位) *</Label>
          <Input
            value={config.address}
            onChange={(e) => onConfigChange({ ...config, address: e.target.value })}
          />
        </div>
        <div>
          <Label>密码 (6位)</Label>
          <div className="relative">
            <Input
              type={showPassword ? "text" : "password"}
              value={config.password}
              onChange={(e) => onConfigChange({ ...config, password: e.target.value })}
            />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="absolute right-0 top-0 h-full px-3"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </Button>
          </div>
        </div>
      </div>
      <div>
        <Label>超时(ms)</Label>
        <Input
          type="number"
          value={config.timeout}
          onChange={(e) => onConfigChange({ ...config, timeout: parseInt(e.target.value) || 5000 })}
        />
      </div>
    </div>
  );
};

export default Dlt645RtuNodeForm;