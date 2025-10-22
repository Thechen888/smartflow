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
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';

interface ModbusScanEntry {
  id: string;
  bias: number;
  start: number;
  count: number;
  input2Holding1Coil0: number; // 0=coil, 1=holding register, 2=input register, 3=discrete input
  frequency: number;
  frequencyStart: number;
  loop: string;
  slaveId: number;
}

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

interface ModbusTcpInputPointFormProps {
  scanEntries: ModbusScanEntry[];
  registers: ModbusRegister[];
  onScanEntriesChange: (entries: ModbusScanEntry[]) => void;
  onRegistersChange: (registers: ModbusRegister[]) => void;
}

const ModbusTcpInputPointForm: React.FC<ModbusTcpInputPointFormProps> = ({
  scanEntries,
  registers,
  onScanEntriesChange,
  onRegistersChange
}) => {
  const [activeTab, setActiveTab] = useState('scan');
  
  // 扫描表状态
  const [isAddingScan, setIsAddingScan] = useState(false);
  const [newScanEntry, setNewScanEntry] = useState<Omit<ModbusScanEntry, 'id'>>({
    bias: 0,
    start: 0,
    count: 1,
    input2Holding1Coil0: 1,
    frequency: 0,
    frequencyStart: 0,
    loop: '',
    slaveId: 1
  });

  // 寄存器表状态
  const [isAddingRegister, setIsAddingRegister] = useState(false);
  const [newRegister, setNewRegister] = useState<Omit<ModbusRegister, 'id'>>({
    offset: 0,
    address: 0,
    type: 'uint16',
    name: '',
    reverseByteOrder: false,
    slaveId: 1,
    comment: ''
  });

  // 扫描表操作
  const addScanEntry = () => {
    const entry: ModbusScanEntry = {
      ...newScanEntry,
      id: Date.now().toString()
    };
    onScanEntriesChange([...scanEntries, entry]);
    setNewScanEntry({ bias: 0, start: 0, count: 1, input2Holding1Coil0: 1, frequency: 0, frequencyStart: 0, loop: '', slaveId: 1 });
    setIsAddingScan(false);
  };

  const deleteScanEntry = (id: string) => {
    onScanEntriesChange(scanEntries.filter(entry => entry.id !== id));
  };

  // 寄存器表操作
  const addRegister = () => {
    if (newRegister.name) {
      const register: ModbusRegister = {
        ...newRegister,
        id: Date.now().toString()
      };
      onRegistersChange([...registers, register]);
      setNewRegister({ offset: 0, address: 0, type: 'uint16', name: '', reverseByteOrder: false, slaveId: 1, comment: '' });
      setIsAddingRegister(false);
    }
  };

  const deleteRegister = (id: string) => {
    onRegistersChange(registers.filter(register => register.id !== id));
  };

  const toggleByteOrder = (id: string) => {
    onRegistersChange(registers.map(reg => 
      reg.id === id ? { ...reg, reverseByteOrder: !reg.reverseByteOrder } : reg
    ));
  };

  const getRegisterTypeLabel = (type: number): string => {
    const types = ['线圈', '保持寄存器', '输入寄存器', '离散输入'];
    return types[type] || '未知';
  };

  return (
    <div className="space-y-4">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="scan">扫描表</TabsTrigger>
          <TabsTrigger value="register">寄存器表</TabsTrigger>
        </TabsList>
        
        <TabsContent value="scan">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>MODBUS 扫描表配置</CardTitle>
                <Button onClick={() => setIsAddingScan(!isAddingScan)} variant="outline" size="sm">
                  <Plus className="mr-1 h-3 w-3" />
                  {isAddingScan ? '取消' : '添加条目'}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {isAddingScan && (
                <div className="grid grid-cols-2 md:grid-cols-8 gap-2 mb-4 p-3 bg-gray-50 rounded">
                  <Input
                    type="number"
                    placeholder="Bias"
                    value={newScanEntry.bias}
                    onChange={(e) => setNewScanEntry({ ...newScanEntry, bias: parseInt(e.target.value) || 0 })}
                  />
                  <Input
                    type="number"
                    placeholder="Start"
                    value={newScanEntry.start}
                    onChange={(e) => setNewScanEntry({ ...newScanEntry, start: parseInt(e.target.value) || 0 })}
                  />
                  <Input
                    type="number"
                    placeholder="Count"
                    value={newScanEntry.count}
                    onChange={(e) => setNewScanEntry({ ...newScanEntry, count: parseInt(e.target.value) || 1 })}
                  />
                  <select
                    value={newScanEntry.input2Holding1Coil0}
                    onChange={(e) => setNewScanEntry({ ...newScanEntry, input2Holding1Coil0: parseInt(e.target.value) })}
                    className="border rounded px-2 py-1 text-sm"
                  >
                    <option value={0}>线圈</option>
                    <option value={1}>保持寄存器</option>
                    <option value={2}>输入寄存器</option>
                    <option value={3}>离散输入</option>
                  </select>
                  <Input
                    type="number"
                    placeholder="Frequency"
                    value={newScanEntry.frequency}
                    onChange={(e) => setNewScanEntry({ ...newScanEntry, frequency: parseInt(e.target.value) || 0 })}
                  />
                  <Input
                    type="number"
                    placeholder="Freq Start"
                    value={newScanEntry.frequencyStart}
                    onChange={(e) => setNewScanEntry({ ...newScanEntry, frequencyStart: parseInt(e.target.value) || 0 })}
                  />
                  <Input
                    placeholder="Loop"
                    value={newScanEntry.loop}
                    onChange={(e) => setNewScanEntry({ ...newScanEntry, loop: e.target.value })}
                  />
                  <Input
                    type="number"
                    placeholder="Slave ID"
                    value={newScanEntry.slaveId}
                    onChange={(e) => setNewScanEntry({ ...newScanEntry, slaveId: parseInt(e.target.value) || 1 })}
                  />
                  <div className="md:col-span-8 flex justify-end space-x-2">
                    <Button variant="outline" size="sm" onClick={() => setIsAddingScan(false)}>取消</Button>
                    <Button size="sm" onClick={addScanEntry}>添加</Button>
                  </div>
                </div>
              )}

              <div className="border rounded-lg overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Bias</TableHead>
                      <TableHead>Start</TableHead>
                      <TableHead>Count</TableHead>
                      <TableHead>类型</TableHead>
                      <TableHead>频率</TableHead>
                      <TableHead>频率起始</TableHead>
                      <TableHead>循环</TableHead>
                      <TableHead>从站ID</TableHead>
                      <TableHead>操作</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {scanEntries.map((entry) => (
                      <TableRow key={entry.id}>
                        <TableCell>{entry.bias}</TableCell>
                        <TableCell>{entry.start}</TableCell>
                        <TableCell>{entry.count}</TableCell>
                        <TableCell>{getRegisterTypeLabel(entry.input2Holding1Coil0)}</TableCell>
                        <TableCell>{entry.frequency}</TableCell>
                        <TableCell>{entry.frequencyStart}</TableCell>
                        <TableCell>{entry.loop}</TableCell>
                        <TableCell>{entry.slaveId}</TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => deleteScanEntry(entry.id)}
                          >
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {scanEntries.length === 0 && (
                <div className="text-center py-4 text-gray-500">
                  暂无扫描表条目
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="register">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>MODBUS 寄存器表配置</CardTitle>
                <Button onClick={() => setIsAddingRegister(!isAddingRegister)} variant="outline" size="sm">
                  <Plus className="mr-1 h-3 w-3" />
                  {isAddingRegister ? '取消' : '添加寄存器'}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {isAddingRegister && (
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
                    <Button variant="outline" size="sm" onClick={() => setIsAddingRegister(false)}>取消</Button>
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
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ModbusTcpInputPointForm;