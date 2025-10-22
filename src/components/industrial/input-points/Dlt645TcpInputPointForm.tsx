"use client";

import React from 'react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';

interface Dlt645TcpInputPointFormProps {
  address: string;
  dataType: string;
  scanRate: number;
  onAddressChange: (address: string) => void;
  onDataTypeChange: (dataType: string) => void;
  onScanRateChange: (scanRate: number) => void;
}

const Dlt645TcpInputPointForm: React.FC<Dlt645TcpInputPointFormProps> = ({
  address,
  dataType,
  scanRate,
  onAddressChange,
  onDataTypeChange,
  onScanRateChange
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div>
        <Label>电表地址 *</Label>
        <Input
          value={address}
          onChange={(e) => onAddressChange(e.target.value)}
          placeholder="000000000002"
        />
      </div>
      <div>
        <Label>数据类型 *</Label>
        <Select value={dataType} onValueChange={onDataTypeChange}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ENERGY">电能 (kWh)</SelectItem>
            <SelectItem value="POWER">功率 (kW)</SelectItem>
            <SelectItem value="VOLTAGE">电压 (V)</SelectItem>
            <SelectItem value="CURRENT">电流 (A)</SelectItem>
            <SelectItem value="FREQUENCY">频率 (Hz)</SelectItem>
            <SelectItem value="POWER_FACTOR">功率因数</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div>
        <Label>扫描频率(ms)</Label>
        <Input
          type="number"
          value={scanRate}
          onChange={(e) => onScanRateChange(parseInt(e.target.value) || 10000)}
          placeholder="10000"
        />
      </div>
    </div>
  );
};

export default Dlt645TcpInputPointForm;