"use client";

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Trash2, Settings } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';

interface ModbusRegister {
  id: string;
  offset: number;
  address: number;
  type: 'uint16' | 'int16' | 'uint32' | 'int32' | 'ascii' | 'ascii8';
  name: string;
  reverseByteOrder: boolean;
  slaveId: number;
  comment: string;
}

const ModbusRegisterTable = () => {
  const [registers, setRegisters] = useState<ModbusRegister[]>([
    { id: '1', offset: 0, address: 0, type: 'uint16', name: 'voltage', reverseByteOrder: false, slaveId: 1, comment: '' },
    { id: '2', offset: 0, address: 1, type: 'uint16', name: 'current', reverseByteOrder: false, slaveId: 1, comment: '' },
    { id: '3', offset: 0, address: 2, type: 'uint16', name: 'soc', reverseByteOrder: false, slaveId: 1, comment: '0-100' }
  ]);

  const [isAdding, setIsAdding] = useState(false);
  const [newRegister, setNewRegister] = useState<Omit<ModbusRegister, 'id'>>({
    offset: 0,
    address: 0,
    type: 'uint16',
    name: '',
    reverseByteOrder: false,
    slaveId: 1,
    comment: ''
  });

  const addRegister = () => {
    if (newRegister.name) {
      const register: ModbusRegister = {
        ...newRegister,
        id: Date.now().toString()
      };
      setRegisters([...registers, register]);
      setNewRegister({ offset: 0, address: 0, type: 'uint16', name: '', reverseByteOrder: false, slaveId: 1, comment: '' });
      setIsAdding(false);
    }
  };

  const deleteRegister = (id: string) => {
    setRegisters(registers.filter(register => register.id !== id));
  };

  const toggleByteOrder = (id: string) => {
    setRegisters(registers.map(reg => 
      reg.id === id ? { ...reg, reverseByteOrder: !reg.reverseByteOrder } : reg
    ));
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>MODBUS 寄存器表配置</CardTitle>
          <Button onClick={() => setIsAdding(!isAdding)} variant="outline" size="sm">
            <Plus className="mr-1 h-3 w-3" />
            {isAdding ? '取消' : '添加寄存器'}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {isAdding && (
          <div className="grid grid-cols-2 md:grid-cols-7 gap-2 mb-4 p-3 bg-gray-50 rounded">
            <Input
              type="number"
              placeholder="Offset"
              value={newRegister.offset}
              onChange={(e) => setNewRegister({ ...newRegister, offset: parseInt(e.target.value) || 0 })}
            />
            <Input
              type="number"
              placeholder="Address"
              value={newRegister.address}
              onChange={(e) => setNewRegister({ ...newRegister, address: parseInt(e.target.value) || 0 })}
            />
            <Select
              value={newRegister.type}
              onValueChange={(value) => setNewRegister({ ...newRegister, type: value as any })}
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="uint16">uint16</SelectItem>
                <SelectItem value="int16">int16</SelectItem>
                <SelectItem value="uint32">uint32</SelectItem>
                <SelectItem value="int32">int32</SelectItem>
                <SelectItem value="ascii">ascii</SelectItem>
                <SelectItem value="ascii8">ascii8</SelectItem>
              </SelectContent>
            </Select>
            <Input
              placeholder="Name"
              value={newRegister.name}
              onChange={(e) => setNewRegister({ ...newRegister, name: e.target.value })}
            />
            <div className="flex items-center space-x-2">
              <Checkbox
                checked={newRegister.reverseByteOrder}
                onCheckedChange={(checked) => setNewRegister({ ...newRegister, reverseByteOrder: checked as boolean })}
              />
              <Label className="text-sm">反转字节序</Label>
            </div>
            <Input
              type="number"
              placeholder="Slave ID"
              value={newRegister.slaveId}
              onChange={(e) => setNewRegister({ ...newRegister, slaveId: parseInt(e.target.value) || 1 })}
            />
            <Input
              placeholder="Comment"
              value={newRegister.comment}
              onChange={(e) => setNewRegister({ ...newRegister, comment: e.target.value })}
            />
            <div className="md:col-span-7 flex justify-end space-x-2">
              <Button variant="outline" size="sm" onClick={() => setIsAdding(false)}>取消</Button>
              <Button size="sm" onClick={addRegister} disabled={!newRegister.name}>添加</Button>
            </div>
          </div>
        )}

        <div className="border rounded-lg overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Offset</TableHead>
                <TableHead>Address</TableHead>
                <TableHead>类型</TableHead>
                <TableHead>名称</TableHead>
                <TableHead>字节序</TableHead>
                <TableHead>从站ID</TableHead>
                <TableHead>注释</TableHead>
                <TableHead>操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {registers.map((register) => (
                <TableRow key={register.id}>
                  <TableCell>{register.offset}</TableCell>
                  <TableCell>{register.address}</TableCell>
                  <TableCell>
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                      {register.type}
                    </span>
                  </TableCell>
                  <TableCell className="font-medium">{register.name}</TableCell>
                  <TableCell>
                    <Button
                      variant={register.reverseByteOrder ? "default" : "outline"}
                      size="sm"
                      onClick={() => toggleByteOrder(register.id)}
                    >
                      <Settings className="h-3 w-3 mr-1" />
                      {register.reverseByteOrder ? '已反转' : '正常'}
                    </Button>
                  </TableCell>
                  <TableCell>{register.slaveId}</TableCell>
                  <TableCell>{register.comment}</TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteRegister(register.id)}
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {registers.length === 0 && (
          <div className="text-center py-4 text-gray-500">
            暂无寄存器配置
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ModbusRegisterTable;