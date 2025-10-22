"use client";

import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Eye, EyeOff } from 'lucide-react';

interface Dlt645TcpConfig {
  host: string;
  port: number;
  address: string;
  password: string;
  timeout: number;
  retryCount: number;
}

interface Dlt645TcpNodeFormProps {
  config: Dlt645TcpConfig;
  onConfigChange: (config: Dlt645TcpConfig) => void;
}

const Dlt645TcpNodeForm: React.FC<Dlt645TcpNodeFormProps> = ({ config, onConfigChange }) => {
  const [showPassword, setShowPassword] = useState(false);

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
            onChange={(e) => onConfigChange({ ...config, port: parseInt(e.target.value) || 6450 })}
          />
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
      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label>超时(ms)</Label>
          <Input
            type="number"
            value={config.timeout}
            onChange={(e) => onConfigChange({ ...config, timeout: parseInt(e.target.value) || 5000 })}
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

export default Dlt645TcpNodeForm;