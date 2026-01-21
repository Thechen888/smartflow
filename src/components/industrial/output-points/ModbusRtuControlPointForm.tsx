"use client";

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Trash2, Download, Upload, Pencil } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from "sonner";

interface ModbusControlPoint {
  id: string;
  slaveId: number;
  address: number;
  type: 'uint16' | 'int16' | 'uint32' | 'int32' | 'ascii' | 'ascii8';
  name: string;
  reverseByteOrder: boolean;
  comment: string;
  min?: number;
  max?: number;
  asciiInvalid?: string;
  a?: number;
  b?: number;
  hint?: string;
}

interface ModbusRtuControlPointFormProps {
  points: ModbusControlPoint[];
  onPointsChange: (points: ModbusControlPoint[]) => void;
}

const ModbusRtuControlPointForm: React.FC<ModbusRtuControlPointFormProps> = ({
  points,
  onPointsChange
}) => {
  const [isAdding, setIsAdding] = useState(false);
  const [editingPoint, setEditingPoint] = useState<ModbusControlPoint | null>(null);
  const [newPoint, setNewPoint] = useState<Omit<ModbusControlPoint, 'id'>>({
    slaveId: 1,
    address: 0,
    type: 'uint16',
    name: '',
    reverseByteOrder: false,
    comment: '',
    min: undefined,
    max: undefined,
    asciiInvalid: '',
    a: 1,
    b: 0,
    hint: ''
  });

  const addPoint = () => {
    if (newPoint.name) {
      const point: ModbusControlPoint = {
        ...newPoint,
        id: Date.now().toString()
      };
      onPointsChange([...points, point]);
      setNewPoint({ 
        slaveId: 1, 
        address: 0, 
        type: 'uint16', 
        name: '', 
        reverseByteOrder: false, 
        comment: '',
        min: undefined,
        max: undefined,
        asciiInvalid: '',
        a: 1,
        b: 0,
        hint: ''
      });
      setIsAdding(false);
    }
  };

  const updatePoint = () => {
    if (editingPoint) {
      onPointsChange(points.map(point => 
        point.id === editingPoint.id ? editingPoint : point
      ));
      setEditingPoint(null);
    }
  };

  const deletePoint = (id: string) => {
    onPointsChange(points.filter(point => point.id !== id));
  };

  const startEditingPoint = (point: ModbusControlPoint) => {
    setEditingPoint({ ...point });
    setIsAdding(false);
  };

  const exportConfig = () => {
    const config = { points };
    const dataStr = JSON.stringify(config, null,2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'modbus_rtu_control_config.json';
    link.click();
    URL.revokeObjectURL(url);
    toast.success('MODBUS RTU控制点位配置已导出');
  };

  const importConfig = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const config = JSON.parse(e.target?.result as string);
        if (config.points) {
          onPointsChange(config.points);
          toast.success('MODBUS RTU控制点位配置已导入');
        } else {
          toast.error('配置文件格式不正确');
        }
      } catch (error) {
        toast.error('导入配置文件失败，请检查文件格式');
      }
    };
    reader.readAsText(file);
    event.target.value = '';
  };

  const getLinearFormula = (a: number, b: number) => {
    return `实际值 = ${a} × 寄存器值 + ${b}`;
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <CardTitle>MODBUS RTU 控制点位配置</CardTitle>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" asChild>
            <label className="cursor-pointer flex items-center">
              <Upload className="mr-1 h-3 w-3" />
              导入
              <input
                type="file"
                accept=".json"
                onChange={importConfig}
                className="hidden"
              />
            </label>
          </Button>
          <Button onClick={exportConfig} variant="outline" size="sm">
            <Download className="mr-1 h-3 w-3" />
            导出
          </Button>
          <Button onClick={() => setIsAdding(!isAdding)} variant="outline" size="sm">
            <Plus className="mr-1 h-3 w-3" />
            {isAdding ? '取消' : '添加点位'}
          </Button>
        </div>
      </div>

      <Card>
        <CardContent>
          {(isAdding || editingPoint) && (
            <div className="space-y-4 mb-4 p-3 bg-gray-50 rounded">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
                <div className="space-y-1">
                  <Label className="text-xs">从站ID</Label>
                  <Input
                    type="number"
                    placeholder="从站ID (1-247)"
                    title="MODBUS从站ID，范围1-247"
                    value={editingPoint ? editingPoint.slaveId : newPoint.slaveId}
                    onChange={(e) => editingPoint 
                      ? setEditingPoint({ ...editingPoint, slaveId: parseInt(e.target.value) || 1 })
                      : setNewPoint({ ...newPoint, slaveId: parseInt(e.target.value) || 1 })
                    }
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">地址</Label>
                  <Input
                    type="number"
                    placeholder="寄存器地址"
                    title="寄存器地址"
                    value={editingPoint ? editingPoint.address : newPoint.address}
                    onChange={(e) => editingPoint 
                      ? setEditingPoint({ ...editingPoint, address: parseInt(e.target.value) || 0 })
                      : setNewPoint({ ...newPoint, address: parseInt(e.target.value) || 0 })
                    }
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">数据类型</Label>
                  <Select
                    value={editingPoint ? editingPoint.type : newPoint.type}
                    onValueChange={(value) => editingPoint 
                      ? setEditingPoint({ ...editingPoint, type: value as any })
                      : setNewPoint({ ...newPoint, type: value as any })
                    }
                  >
                    <SelectTrigger className="w-full" title="寄存器数据类型">
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
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">名称</Label>
                  <Input
                    placeholder="寄存器名称"
                    title="寄存器变量名称"
                    value={editingPoint ? editingPoint.name : newPoint.name}
                    onChange={(e) => editingPoint 
                      ? setEditingPoint({ ...editingPoint, name: e.target.value })
                      : setNewPoint({ ...newPoint, name: e.target.value })
                    }
                  />
                </div>
              </div>              
              <div className="grid grid-cols-1 md:grid-cols-6 gap-2">
                <div className="flex items-center space-x-2" title="是否反转多字节数据的字节顺序">
                  <Checkbox
                    checked={editingPoint ? editingPoint.reverseByteOrder : newPoint.reverseByteOrder}
                    onCheckedChange={(checked) => editingPoint 
                      ? setEditingPoint({ ...editingPoint, reverseByteOrder: checked as boolean })
                      : setNewPoint({ ...newPoint, reverseByteOrder: checked as boolean })
                    }
                  />
                  <Label className="text-sm">反转字节序</Label>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">注释</Label>
                  <Input
                    placeholder="寄存器注释"
                    title="寄存器描述或注释"
                    value={editingPoint ? editingPoint.comment : newPoint.comment}
                    onChange={(e) => editingPoint 
                      ? setEditingPoint({ ...editingPoint, comment: e.target.value })
                      : setNewPoint({ ...newPoint, comment: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">最小值(实际值)</Label>
                  <Input
                    type="number"
                    placeholder="最小实际值"
                    title="实际工程值的最小有效范围"
                    value={editingPoint ? (editingPoint.min ?? '') : (newPoint.min ?? '')}
                    onChange={(e) => editingPoint 
                      ? setEditingPoint({ ...editingPoint, min: e.target.value ? parseFloat(e.target.value) : undefined })
                      : setNewPoint({ ...newPoint, min: e.target.value ? parseFloat(e.target.value) : undefined })
                    }
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">最大值(实际值)</Label>
                  <Input
                    type="number"
                    placeholder="最大实际值"
                    title="实际工程值的最大有效范围"
                    value={editingPoint ? (editingPoint.max ?? '') : (newPoint.max ?? '')}
                    onChange={(e) => editingPoint 
                      ? setEditingPoint({ ...editingPoint, max: e.target.value ? parseFloat(e.target.value) : undefined })
                      : setNewPoint({ ...newPoint, max: e.target.value ? parseFloat(e.target.value) : undefined })
                    }
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">比例系数(A)</Label>
                  <Input
                    placeholder="A系数"
                    title="线性变换比例系数 A (实际值 = A × 寄存器值 + B)"
                    value={editingPoint ? (editingPoint.a ?? '') : (newPoint.a ?? '')}
                    onChange={(e) => editingPoint 
                      ? setEditingPoint({ ...editingPoint, a: e.target.value ? parseFloat(e.target.value) : 1 })
                      : setNewPoint({ ...newPoint, a: e.target.value ? parseFloat(e.target.value) : 1 })
                    }
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">偏移量(B)</Label>
                  <Input
                    placeholder="B系数"
                    title="线性变换偏移量 B (实际值 = A × 寄存器值 + B)"
                    value={editingPoint ? (editingPoint.b ?? '') : (newPoint.b ?? '')}
                    onChange={(e) => editingPoint 
                      ? setEditingPoint({ ...editingPoint, b: e.target.value ? parseFloat(e.target.value) : 0 })
                      : setNewPoint({ ...newPoint, b: e.target.value ? parseFloat(e.target.value) : 0 })
                    }
                  />
                </div>
              </div>              
              {editingPoint 
                ? (editingPoint.type === 'ascii' || editingPoint.type === 'ascii8') 
                : (newPoint.type === 'ascii' || newPoint.type === 'ascii8') ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <Label className="text-xs">ASCII无效值</Label>
                    <Input
                      placeholder="无效值 (如: INVALID)"
                      title="当ASCII数据无效时显示的值"
                      value={editingPoint ? editingPoint.asciiInvalid : newPoint.asciiInvalid}
                      onChange={(e) => editingPoint 
                        ? setEditingPoint({ ...editingPoint, asciiInvalid: e.target.value })
                        : setNewPoint({ ...newPoint, asciiInvalid: e.target.value })
                      }
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">提示</Label>
                    <Input
                      placeholder="提示信息"
                      title="寄存器的提示信息"
                      value={editingPoint ? editingPoint.hint : newPoint.hint}
                      onChange={(e) => editingPoint 
                        ? setEditingPoint({ ...editingPoint, hint: e.target.value })
                        : setNewPoint({ ...newPoint, hint: e.target.value })
                      }
                    />
                  </div>
                </div>
              ) : (
                <div className="space-y-1">
                  <Label className="text-xs">提示</Label>
                  <Input
                    placeholder="提示信息"
                    title="寄存器的提示信息"
                    value={editingPoint ? editingPoint.hint : newPoint.hint}
                    onChange={(e) => editingPoint 
                      ? setEditingPoint({ ...editingPoint, hint: e.target.value })
                      : setNewPoint({ ...newPoint, hint: e.target.value })
                    }
                  />
                </div>
              )}
              
              <div className="text-xs text-gray-500 bg-blue-50 p-2 rounded">
                <strong>类型说明:</strong> {editingPoint ? editingPoint.type : newPoint.type}
              </div>
              
              <div className="text-xs text-gray-500 bg-green-50 p-2 rounded">
                <strong>线性变换公式:</strong> 实际值 = A × 寄存器值 + B
              </div>
              
              <div className="flex justify-end space-x-2 pt-2">
                <Button variant="outline" size="sm" onClick={() => {
                  setIsAdding(false);
                  setEditingPoint(null);
                }}>
                  取消
                </Button>
                <Button size="sm" onClick={editingPoint ? updatePoint : addPoint} disabled={!editingPoint && !newPoint.name}>
                  {editingPoint ? '更新' : '添加'}
                </Button>
              </div>
            </div>
          )}

          <div className="border rounded-lg overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>从站ID</TableHead>
                  <TableHead>地址</TableHead>
                  <TableHead>类型</TableHead>
                  <TableHead>名称</TableHead>
                  <TableHead>字节序</TableHead>
                  <TableHead>实际值范围</TableHead>
                  <TableHead>线性变换</TableHead>
                  <TableHead>提示</TableHead>
                  <TableHead>操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {points.map((point) => (
                  <TableRow key={point.id}>
                    <TableCell>{point.slaveId}</TableCell>
                    <TableCell>{point.address}</TableCell>
                    <TableCell>
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                        {point.type}
                      </span>
                    </TableCell>
                    <TableCell className="font-medium">{point.name}</TableCell>
                    <TableCell>
                      {point.reverseByteOrder ? '反转' : '正常'}
                    </TableCell>
                    <TableCell className="text-xs">
                      {point.min !== undefined && point.max !== undefined ? (
                        <div>实际值: {point.min} - {point.max}</div>
                      ) : (
                        <div>未设置范围</div>
                      )}
                    </TableCell>
                    <TableCell className="text-xs">
                      {getLinearFormula(point.a || 1, point.b || 0)}
                    </TableCell>
                    <TableCell className="text-xs">{point.hint || '-'}</TableCell>
                    <TableCell className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => startEditingPoint(point)}
                        title="编辑点位"
                      >
                        <Pencil className="h-4 w-4 text-blue-500" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deletePoint(point.id)}
                        title="删除点位"
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {points.length === 0 && (
            <div className="text-center py-4 text-gray-500">
              暂无MODBUS RTU控制点位
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ModbusRtuControlPointForm;