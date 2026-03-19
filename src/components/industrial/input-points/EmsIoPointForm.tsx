"use client";

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Trash2, Download, Upload, Pencil } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { toast } from "sonner";

interface EmsIoPoint {
  id: string;
  name: string;
  pointType: 'DI' | 'DO';
  address: string;
  description?: string;
  enabled: boolean;
}

interface EmsIoPointFormProps {
  points: EmsIoPoint[];
  pointType: 'DI' | 'DO';
  onPointsChange: (points: EmsIoPoint[]) => void;
}

const EmsIoPointForm: React.FC<EmsIoPointFormProps> = ({
  points,
  pointType,
  onPointsChange
}) => {
  const [isAdding, setIsAdding] = useState(false);
  const [editingPoint, setEditingPoint] = useState<EmsIoPoint | null>(null);
  const [newPoint, setNewPoint] = useState<Omit<EmsIoPoint, 'id'>>({
    name: '',
    pointType: pointType,
    address: '',
    description: '',
    enabled: true
  });

  const addPoint = () => {
    if (newPoint.name && newPoint.address) {
      const point: EmsIoPoint = {
        ...newPoint,
        id: Date.now().toString()
      };
      onPointsChange([...points, point]);
      setNewPoint({ 
        name: '', 
        pointType: pointType,
        address: '',
        description: '',
        enabled: true
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

  const startEditingPoint = (point: EmsIoPoint) => {
    setEditingPoint({ ...point });
    setIsAdding(false);
  };

  const exportConfig = () => {
    const config = { points };
    const dataStr = JSON.stringify(config, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `ems_io_${pointType.toLowerCase()}_config.json`;
    link.click();
    URL.revokeObjectURL(url);
    toast.success(`EMS IO ${pointType}点位配置已导出`);
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
          toast.success(`EMS IO ${pointType}点位配置已导入`);
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

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <CardTitle>EMS IO {pointType === 'DI' ? 'DI' : 'DO'} 点位配置</CardTitle>
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
            {isAdding ? '取消' : `添加${pointType}点位`}
          </Button>
        </div>
      </div>

      <Card>
        <CardContent>
          {(isAdding || editingPoint) && (
            <div className="space-y-4 mb-4 p-3 bg-gray-50 rounded">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label className="text-xs">点位名称 *</Label>
                  <Input
                    placeholder="点位名称"
                    title={`${pointType}点位名称`}
                    value={editingPoint ? editingPoint.name : newPoint.name}
                    onChange={(e) => editingPoint 
                      ? setEditingPoint({ ...editingPoint, name: e.target.value })
                      : setNewPoint({ ...newPoint, name: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">地址 *</Label>
                  <Input
                    placeholder="点位地址"
                    title={`${pointType}点位地址`}
                    value={editingPoint ? editingPoint.address : newPoint.address}
                    onChange={(e) => editingPoint 
                      ? setEditingPoint({ ...editingPoint, address: e.target.value })
                      : setNewPoint({ ...newPoint, address: e.target.value })
                    }
                  />
                </div>
              </div>
              
              <div className="space-y-1">
                <Label className="text-xs">描述</Label>
                <Input
                  placeholder="点位描述"
                  title={`${pointType}点位描述`}
                  value={editingPoint ? (editingPoint.description ?? '') : (newPoint.description ?? '')}
                  onChange={(e) => editingPoint 
                    ? setEditingPoint({ ...editingPoint, description: e.target.value })
                    : setNewPoint({ ...newPoint, description: e.target.value })
                  }
                />
              </div>
              
              <div className="flex items-center space-x-2">
                <Switch
                  checked={editingPoint ? editingPoint.enabled : newPoint.enabled}
                  onCheckedChange={(checked) => editingPoint 
                    ? setEditingPoint({ ...editingPoint, enabled: checked })
                    : setNewPoint({ ...newPoint, enabled: checked })
                  }
                />
                <Label className="text-sm">启用点位</Label>
              </div>
              
              <div className="flex justify-end space-x-2 pt-2">
                <Button variant="outline" size="sm" onClick={() => {
                  setIsAdding(false);
                  setEditingPoint(null);
                }}>
                  取消
                </Button>
                <Button size="sm" onClick={editingPoint ? updatePoint : addPoint} disabled={!editingPoint && (!newPoint.name || !newPoint.address)}>
                  {editingPoint ? '更新' : '添加'}
                </Button>
              </div>
            </div>
          )}

          <div className="border rounded-lg overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>名称</TableHead>
                  <TableHead>地址</TableHead>
                  <TableHead>描述</TableHead>
                  <TableHead>状态</TableHead>
                  <TableHead>操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {points.map((point) => (
                  <TableRow key={point.id}>
                    <TableCell className="font-medium">{point.name}</TableCell>
                    <TableCell className="font-mono">{point.address}</TableCell>
                    <TableCell className="text-sm">{point.description || '-'}</TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        point.enabled 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {point.enabled ? '启用' : '禁用'}
                      </span>
                    </TableCell>
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
              暂无{pointType === 'DI' ? 'DI' : 'DO'}点位
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default EmsIoPointForm;