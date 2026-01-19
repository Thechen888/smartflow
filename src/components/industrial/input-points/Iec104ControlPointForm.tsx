"use client";

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Trash2, Download, Upload, Pencil } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { toast } from "sonner";

interface Iec104ControlPoint {
  id: string;
  address: string;
  name: string;
  dataType: string;
  min?: number;
  max?: number;
  multiplier?: number;
  offset?: number;
  description?: string;
}

interface Iec104ControlPointFormProps {
  points: Iec104ControlPoint[];
  onPointsChange: (points: Iec104ControlPoint[]) => void;
}

const Iec104ControlPointForm: React.FC<Iec104ControlPointFormProps> = ({
  points,
  onPointsChange
}) => {
  const [isAdding, setIsAdding] = useState(false);
  const [editingPoint, setEditingPoint] = useState<Iec104ControlPoint | null>(null);
  const [newPoint, setNewPoint] = useState<Omit<Iec104ControlPoint, 'id'>>({
    address: '1001',
    name: '',
    dataType: '单点遥信',
    description: '',
    min: undefined,
    max: undefined,
    multiplier: 1,
    offset: 0
  });

  const addPoint = () => {
    if (newPoint.name) {
      const point: Iec104ControlPoint = {
        ...newPoint,
        id: Date.now().toString()
      };
      onPointsChange([...points, point]);
      setNewPoint({ 
        address: '1001', 
        name: '', 
        dataType: '单点遥信',
        description: '',
        min: undefined,
        max: undefined,
        multiplier: 1,
        offset: 0
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
      setIsAdding(false);
    }
  };

  const deletePoint = (id: string) => {
    onPointsChange(points.filter(point => point.id !== id));
  };

  const startEditingPoint = (point: Iec104ControlPoint) => {
    setEditingPoint({ ...point });
    setIsAdding(true);
  };

  const exportConfig = () => {
    const config = { points };
    const dataStr = JSON.stringify(config, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'iec104_control_config.json';
    link.click();
    URL.revokeObjectURL(url);
    toast.success('IEC104控制点位配置已导出');
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
          toast.success('IEC104控制点位配置已导入');
        } else {
          console.error('配置文件格式不正确');
        }
      } catch (error) {
        console.error('导入配置文件失败，请检查文件格式');
      }
    };
    reader.readAsText(file);
    event.target.value = '';
  };

  const getDataTypeLabel = (type: string): string => {
    const labels: Record<string, string> = {
      '单点遥信': '单点遥信',
      '双点遥信': '双点遥信',
      '测量值，规一化值': '测量值，规一化值',
      '测量值，标度化值': '测量值，标度化值',
      '测量值，短浮点数': '测量值，短浮点数',
      '累计量': '累计量'
    };
    return labels[type] || type;
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <CardTitle>IEC104 控制点位配置</CardTitle>
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

      {isAdding && (
        <Card className="p-4 bg-blue-50">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg">
              {editingPoint ? '编辑点位' : '添加新点位'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>地址 *</Label>
                <Input
                  value={editingPoint ? editingPoint.address : newPoint.address}
                  onChange={(e) => editingPoint 
                    ? setEditingPoint({ ...editingPoint, address: e.target.value })
                    : setNewPoint({ ...newPoint, address: e.target.value })
                  }
                  placeholder="例如: 1001"
                />
              </div>
              <div className="space-y-2">
                <Label>名称 *</Label>
                <Input
                  value={editingPoint ? editingPoint.name : newPoint.name}
                  onChange={(e) => editingPoint 
                    ? setEditingPoint({ ...editingPoint, name: e.target.value })
                    : setNewPoint({ ...newPoint, name: e.target.value })
                  }
                  placeholder="点位名称"
                />
              </div>
              <div className="space-y-2">
                <Label>类型 *</Label>
                <Select
                  value={editingPoint ? editingPoint.dataType : newPoint.dataType}
                  onValueChange={(value) => editingPoint 
                    ? setEditingPoint({ ...editingPoint, dataType: value })
                    : setNewPoint({ ...newPoint, dataType: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="单点遥信">单点遥信</SelectItem>
                    <SelectItem value="双点遥信">双点遥信</SelectItem>
                    <SelectItem value="测量值，规一化值">测量值，规一化值</SelectItem>
                    <SelectItem value="测量值，标度化值">测量值，标度化值</SelectItem>
                    <SelectItem value="测量值，短浮点数">测量值，短浮点数</SelectItem>
                    <SelectItem value="累计量">累计量</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-4">
              <div className="space-y-2">
                <Label>最小值</Label>
                <Input
                  type="number"
                  value={editingPoint ? (editingPoint.min ?? '') : (newPoint.min ?? '')}
                  onChange={(e) => editingPoint 
                    ? setEditingPoint({ ...editingPoint, min: e.target.value ? parseFloat(e.target.value) : undefined })
                    : setNewPoint({ ...newPoint, min: e.target.value ? parseFloat(e.target.value) : undefined })
                  }
                  placeholder="最小值"
                />
              </div>
              <div className="space-y-2">
                <Label>最大值</Label>
                <Input
                  type="number"
                  value={editingPoint ? (editingPoint.max ?? '') : (newPoint.max ?? '')}
                  onChange={(e) => editingPoint 
                    ? setEditingPoint({ ...editingPoint, max: e.target.value ? parseFloat(e.target.value) : undefined })
                    : setNewPoint({ ...newPoint, max: e.target.value ? parseFloat(e.target.value) : undefined })
                  }
                  placeholder="最大值"
                />
              </div>
              <div className="space-y-2">
                <Label>倍率</Label>
                <Input
                  type="number"
                  value={editingPoint ? (editingPoint.multiplier ?? 1) : (newPoint.multiplier ?? 1)}
                  onChange={(e) => editingPoint 
                    ? setEditingPoint({ ...editingPoint, multiplier: e.target.value ? parseFloat(e.target.value) : 1 })
                    : setNewPoint({ ...newPoint, multiplier: e.target.value ? parseFloat(e.target.value) : 1 })
                  }
                  placeholder="1"
                />
              </div>
              <div className="space-y-2">
                <Label>偏移量</Label>
                <Input
                  type="number"
                  value={editingPoint ? (editingPoint.offset ?? 0) : (newPoint.offset ?? 0)}
                  onChange={(e) => editingPoint 
                    ? setEditingPoint({ ...editingPoint, offset: e.target.value ? parseFloat(e.target.value) : 0 })
                    : setNewPoint({ ...newPoint, offset: e.target.value ? parseFloat(e.target.value) : 0 })
                  }
                  placeholder="0"
                />
              </div>
            </div>

            <div className="mt-4">
              <Label>描述</Label>
              <Input
                value={editingPoint ? (editingPoint.description ?? '') : (newPoint.description ?? '')}
                onChange={(e) => editingPoint 
                  ? setEditingPoint({ ...editingPoint, description: e.target.value })
                  : setNewPoint({ ...newPoint, description: e.target.value })
                }
                placeholder="点位描述"
              />
            </div>

            <div className="flex justify-end gap-2 mt-6">
              <Button 
                variant="outline" 
                onClick={() => {
                  setIsAdding(false);
                  setEditingPoint(null);
                }}
              >
                取消
              </Button>
              <Button 
                onClick={editingPoint ? updatePoint : addPoint}
                disabled={!editingPoint && !newPoint.name}
              >
                {editingPoint ? '更新' : '添加'}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>地址</TableHead>
                <TableHead>名称</TableHead>
                <TableHead>类型</TableHead>
                <TableHead>最小值</TableHead>
                <TableHead>最大值</TableHead>
                <TableHead>倍率</TableHead>
                <TableHead>偏移量</TableHead>
                <TableHead>描述</TableHead>
                <TableHead className="w-32">操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {points.map((point) => (
                <TableRow key={point.id}>
                  <TableCell className="font-medium">{point.address}</TableCell>
                  <TableCell>
                    <span className="font-medium">{point.name}</span>
                  </TableCell>
                  <TableCell>
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                      {getDataTypeLabel(point.dataType)}
                    </span>
                  </TableCell>
                  <TableCell>{point.min ?? '-'}</TableCell>
                  <TableCell>{point.max ?? '-'}</TableCell>
                  <TableCell>{point.multiplier ?? '-'}</TableCell>
                  <TableCell>{point.offset ?? '-'}</TableCell>
                  <TableCell className="text-sm">{point.description || '-'}</TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => startEditingPoint(point)}
                        title="编辑"
                      >
                        <Pencil className="h-4 w-4 text-blue-500" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deletePoint(point.id)}
                        title="删除"
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {points.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              暂无IEC104控制点位
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Iec104ControlPointForm;