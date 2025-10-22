"use client";

import React from 'react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';

interface Iec104InputPointFormProps {
  address: string;
  dataType: string;
  scanRate: number;
  onAddressChange: (address: string) => void;
  onDataTypeChange: (dataType: string) => void;
  onScanRateChange: (scanRate: number) => void;
}

const Iec104InputPointForm: React.FC<Iec104InputPointFormProps> = ({
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
        <Label>信息对象地址 *</Label>
        <Input
          value={address}
          onChange={(e) => onAddressChange(e.target.value)}
          placeholder="1001"
        />
      </div>
      <div>
        <Label>数据类型 *</Label>
        <Select value={dataType} onValueChange={onDataTypeChange}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="M_SP_NA_1">单点信息 (M_SP_NA_1)</SelectItem>
            <SelectItem value="M_DP_NA_1">双点信息 (M_DP_NA_1)</SelectItem>
            <SelectItem value="M_ST_NA_1">步位置信息 (M_ST_NA_1)</SelectItem>
            <SelectItem value="M_ME_NA_1">测量值-归一化值 (M_ME_NA_1)</SelectItem>
            <SelectItem value="M_ME_NB_1">测量值-标度化值 (M_ME_NB_1)</SelectItem>
            <SelectItem value="M_ME_NC_1">测量值-短浮点数 (M_ME_NC_1)</SelectItem>
            <SelectItem value="M_IT_NA_1">累计量 (M_IT_NA_1)</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div>
        <Label>扫描频率(ms)</Label>
        <Input
          type="number"
          value={scanRate}
          onChange={(e) => onScanRateChange(parseInt(e.target.value) || 500)}
          placeholder="500"
        />
      </div>
    </div>
  );
};

export default Iec104InputPointForm;