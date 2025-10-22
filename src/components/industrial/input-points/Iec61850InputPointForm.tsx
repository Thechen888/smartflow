"use client";

import React from 'react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';

interface Iec61850InputPointFormProps {
  address: string;
  dataType: string;
  scanRate: number;
  onAddressChange: (address: string) => void;
  onDataTypeChange: (dataType: string) => void;
  onScanRateChange: (scanRate: number) => void;
}

const Iec61850InputPointForm: React.FC<Iec61850InputPointFormProps> = ({
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
        <Label>逻辑节点路径 *</Label>
        <Input
          value={address}
          onChange={(e) => onAddressChange(e.target.value)}
          placeholder="LD1/LLN0.MX.Vol"
        />
      </div>
      <div>
        <Label>数据类型 *</Label>
        <Select value={dataType} onValueChange={onDataTypeChange}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="BOOLEAN">BOOLEAN</SelectItem>
            <SelectItem value="INT32">INT32</SelectItem>
            <SelectItem value="FLOAT32">FLOAT32</SelectItem>
            <SelectItem value="FLOAT64">FLOAT64</SelectItem>
            <SelectItem value="ENUM">ENUM</SelectItem>
            <SelectItem value="TIMESTAMP">TIMESTAMP</SelectItem>
            <SelectItem value="QUALITY">QUALITY</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div>
        <Label>扫描频率(ms)</Label>
        <Input
          type="number"
          value={scanRate}
          onChange={(e) => onScanRateChange(parseInt(e.target.value) || 1000)}
          placeholder="1000"
        />
      </div>
    </div>
  );
};

export default Iec61850InputPointForm;