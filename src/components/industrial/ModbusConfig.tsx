"use client";

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ModbusScanTable from './ModbusScanTable';
import ModbusRegisterTable from './ModbusRegisterTable';

const ModbusConfig = () => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">MODBUS 配置</h3>
      </div>

      <Tabs defaultValue="scan" className="space-y-4">
        <TabsList>
          <TabsTrigger value="scan">扫描表</TabsTrigger>
          <TabsTrigger value="register">寄存器表</TabsTrigger>
        </TabsList>
        <TabsContent value="scan">
          <ModbusScanTable />
        </TabsContent>
        <TabsContent value="register">
          <ModbusRegisterTable />
        </TabsContent>
      </Tabs>

      <Card>
        <CardHeader>
          <CardTitle>配置说明</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-gray-600 space-y-2">
          <p><strong>扫描表字段说明:</strong></p>
          <ul className="list-disc list-inside space-y-1">
            <li><strong>Bias:</strong> 地址偏移量</li>
            <li><strong>Start:</strong> 起始地址</li>
            <li><strong>Count:</strong> 读取数量</li>
            <li><strong>类型:</strong> 0=线圈, 1=保持寄存器, 2=输入寄存器, 3=离散输入</li>
            <li><strong>频率:</strong> 扫描频率</li>
            <li><strong>从站ID:</strong> MODBUS从站地址</li>
          </ul>
          
          <p className="mt-3"><strong>寄存器表字段说明:</strong></p>
          <ul className="list-disc list-inside space-y-1">
            <li><strong>类型:</strong> 支持 uint16, int16, uint32, int32, ascii, ascii8</li>
            <li><strong>反转字节序:</strong> 启用后会反转多字节数据的字节顺序</li>
            <li><strong>Offset:</strong> 在扫描块中的偏移位置</li>
            <li><strong>Address:</strong> 寄存器地址</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
};

export default ModbusConfig;