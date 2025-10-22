"use client";

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Trash2 } from 'lucide-react';
import { Label } from '@/components/ui/label';

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

const ModbusScanTable = () => {
  const [scanEntries, setScanEntries] = useState<ModbusScanEntry[]>([
    { id: '1', bias: 0, start: 0, count: 27, input2Holding1Coil0: 1, frequency: 0, frequencyStart: 0, loop: '', slaveId: 1 },
    { id: '2', bias: 101, start: 0, count: 1, input2Holding1Coil0: 1, frequency: 0, frequencyStart: 0, loop: '', slaveId: 1 },
    { id: '3', bias: 14000, start: 2, count: 18, input2Holding1Coil0: 1, frequency: 0, frequencyStart: 0, loop: '', slaveId: 1 },
    { id: '4', bias: 0, start: 0, count: 62, input2Holding1Coil0: 3, frequency: 0, frequencyStart: 0, loop: '', slaveId: 1 }
  ]);

  const [isAdding, setIsAdding] = useState(false);
  const [newEntry, setNewEntry] = useState<Omit<ModbusScanEntry, 'id'>>({
    bias: 0,
    start: 0,
    count: 1,
    input2Holding1Coil0: 1,
    frequency: 0,
    frequencyStart: 0,
    loop: '',
    slaveId: 1
  });

  const addScanEntry = () => {
    const entry: ModbusScanEntry = {
      ...newEntry,
      id: Date.now().toString()
    };
    setScanEntries([...scanEntries, entry]);
    setNewEntry({ bias: 0, start: 0, count: 1, input2Holding1Coil0: 1, frequency: 0, frequencyStart: 0, loop: '', slaveId: 1 });
    setIsAdding(false);
  };

  const deleteScanEntry = (id: string) => {
    setScanEntries(scanEntries.filter(entry => entry.id !== id));
  };

  const getRegisterTypeLabel = (type: number): string => {
    const types = ['线圈', '保持寄存器', '输入寄存器', '离散输入'];
    return types[type] || '未知';
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>MODBUS 扫描表配置</CardTitle>
          <Button onClick={() => setIsAdding(!isAdding)} variant="outline" size="sm">
            <Plus className="mr-1 h-3 w-3" />
            {isAdding ? '取消' : '添加条目'}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {isAdding && (
          <div className="grid grid-cols-2 md:grid-cols-8 gap-2 mb-4 p-3 bg-gray-50 rounded">
            <Input
              type="number"
              placeholder="Bias"
              value={newEntry.bias}
              onChange={(e) => setNewEntry({ ...newEntry, bias: parseInt(e.target.value) || 0 })}
            />
            <Input
              type="number"
              placeholder="Start"
              value={newEntry.start}
              onChange={(e) => setNewEntry({ ...newEntry, start: parseInt(e.target.value) || 0 })}
            />
            <Input
              type="number"
              placeholder="Count"
              value={newEntry.count}
              onChange={(e) => setNewEntry({ ...newEntry, count: parseInt(e.target.value) || 1 })}
            />
            <select
              value={newEntry.input2Holding1Coil0}
              onChange={(e) => setNewEntry({ ...newEntry, input2Holding1Coil0: parseInt(e.target.value) })}
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
              value={newEntry.frequency}
              onChange={(e) => setNewEntry({ ...newEntry, frequency: parseInt(e.target.value) || 0 })}
            />
            <Input
              type="number"
              placeholder="Freq Start"
              value={newEntry.frequencyStart}
              onChange={(e) => setNewEntry({ ...newEntry, frequencyStart: parseInt(e.target.value) || 0 })}
            />
            <Input
              placeholder="Loop"
              value={newEntry.loop}
              onChange={(e) => setNewEntry({ ...newEntry, loop: e.target.value })}
            />
            <Input
              type="number"
              placeholder="Slave ID"
              value={newEntry.slaveId}
              onChange={(e) => setNewEntry({ ...newEntry, slaveId: parseInt(e.target.value) || 1 })}
            />
            <div className="md:col-span-8 flex justify-end space-x-2">
              <Button variant="outline" size="sm" onClick={() => setIsAdding(false)}>取消</Button>
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
  );
};

export default ModbusScanTable;