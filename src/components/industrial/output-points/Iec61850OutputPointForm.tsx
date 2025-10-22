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
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { toast } from "sonner";

interface Iec61850OutputPoint {
  id: string;
  address: string;
  type: 'boolean' | 'int32' | 'float32' | 'timestamp' | 'check';
  name: string;
  dataType: 'BOOLEAN' | 'INT32' | 'FLOAT32' | 'TIMESTAMP';
  controlType: 'DIRECT' | 'SELECT_BEFORE_OPERATE' | 'ENHANCED_DIRECT';
  operationLevel: 'OPERATOR' | 'ENGINEER' | 'ADMIN';
  min?: number;
  max?: number;
  defaultValue?: string;
  description?: string;
  sboTimeout?: number;
  enhancedDirect?: boolean;
}

interface Iec61850OutputPointFormProps {
  points: Iec61850OutputPoint[];
  onPointsChange: (points: Iec61850OutputPoint[]) => void;
}

const Iec61850OutputPointForm: React.FC<Iec61850OutputPointFormProps> = ({
  points,
  onPointsChange
}) => {
  const [activeTab, setActiveTab] = useState('boolean');
  const [isAdding, setIsAdding] = useState(false);
  const [editingPoint, setEditingPoint] = useState<Iec61850OutputPoint | null>(null);
  const [newPoint, setNewPoint] = useState<Omit<Iec61850OutputPoint, 'id'>>({
    address: 'LD1/LLN0.CSWI1.Pos',
    type: 'boolean',
    name: '',
    dataType: 'BOOLEAN',
    controlType: 'SELECT_BEFORE_OPERATE',
    operationLevel: 'OPERATOR',
    description: '',
    sboTimeout: 10000
  });

  const addPoint = () => {
    if (newPoint.name) {
      const point: Iec61850OutputPoint = {
        ...newPoint,
        id: Date.now().toString(),
        type: activeTab as 'boolean' | 'int32' | 'float32' | 'timestamp' | 'check'
      };
      onPointsChange([...points, point]);
      setNewPoint({ 
        address: 'LD1/LLN0.CSWI1.Pos', 
        type: activeTab as 'boolean' | 'int32' | 'float32' | 'timestamp' | 'check', 
        name: '', 
        dataType: 'BOOLEAN', 
        controlType: 'SELECT_BEFORE_OPERATE', 
        operationLevel: 'OPERATOR',
        description: '',
        sboTimeout: 10000
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

  const startEditingPoint = (point: Iec61850OutputPoint) => {
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
    link.download = 'iec61850_output_config.json';
    link.click();
    URL.revokeObjectURL(url);
    toast.success('IEC61850输出配置已导出');
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
          toast.success('IEC61850输出配置已导入');
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

  const filteredPoints = points.filter(point => point.type === activeTab);

  const getTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      'boolean': '布尔控制 (SPC/SPS)',
      'int32': '整数控制 (INC)',
      'float32': '浮点控制 (APC)',
      'timestamp': '时间戳控制 (TSC)',
      'check': '检查控制 (BSC)'
    };
    return labels[type] || type;
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="boolean">布尔控制</TabsTrigger>
            <TabsTrigger value="int32">整数控制</TabsTrigger>
            <TabsTrigger value="float32">浮点控制</TabsTrigger>
            <TabsTrigger value="timestamp">时间戳控制</TabsTrigger>
            <TabsTrigger value="check">检查控制</TabsTrigger>
          </TabsList>
        </Tabs>
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
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>{getTypeLabel(activeTab)}</CardTitle>
            <Button onClick={() => setIsAdding(!isAdding)} variant="outline" size="sm">
              <Plus className="mr-1 h-3 w-3" />
              {isAdding ? '取消' : '添加点位'}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {(isAdding || editingPoint) && (
            <div className="space-y-4 mb-4 p-3 bg-gray-50 rounded">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
                <div className="space-y-1">
                  <Label className="text-xs">控制对象路径</Label>
                  <Input
                    placeholder="逻辑节点路径"
                    title="IEC61850控制对象路径"
                    value={editingPoint ? editingPoint.address : newPoint.address}
                    onChange={(e) => editingPoint 
                      ? setEditingPoint({ ...editingPoint, address: e.target.value })
                      : setNewPoint({ ...newPoint, address: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">名称</Label>
                  <Input
                    placeholder="点位名称"
                    title="输出点位名称"
                    value={editingPoint ? editingPoint.name : newPoint.name}
                    onChange={(e) => editingPoint 
                      ? setEditingPoint({ ...editingPoint, name: e.target.value })
                      : setNewPoint({ ...newPoint, name: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">数据类型</Label>
                  <Select
                    value={editingPoint ? editingPoint.dataType : newPoint.dataType}
                    onValueChange={(value) => editingPoint 
                      ? setEditingPoint({ ...editingPoint, dataType: value as any })
                      : setNewPoint({ ...newPoint, dataType: value as any })
                    }
                  >
                    <SelectTrigger className="w-full" title="输出数据类型">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {activeTab === 'boolean' ? (
                        <SelectItem value="BOOLEAN">BOOLEAN</SelectItem>
                      ) : activeTab === 'int32' ? (
                        <SelectItem value="INT32">INT32</SelectItem>
                      ) : activeTab === 'float32' ? (
                        <SelectItem value="FLOAT32">FLOAT32</SelectItem>
                      ) : activeTab === 'timestamp' ? (
                        <SelectItem value="TIMESTAMP">TIMESTAMP</SelectItem>
                      ) : (
                        <SelectItem value="BOOLEAN">BOOLEAN</SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">控制类型</Label>
                  <Select
                    value={editingPoint ? editingPoint.controlType : newPoint.controlType}
                    onValueChange={(value) => editingPoint 
                      ? setEditingPoint({ ...editingPoint, controlType: value as any })
                      : setNewPoint({ ...newPoint, controlType: value as any })
                    }
                  >
                    <SelectTrigger className="w-full" title="控制操作类型">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="DIRECT">直接控制</SelectItem>
                      <SelectItem value="SELECT_BEFORE_OPERATE">选择-操作</SelectItem>
                      <SelectItem value="ENHANCED_DIRECT">增强直接控制</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                <div className="space-y-1">
                  <Label className="text-xs">操作级别</Label>
                  <Select
                    value={editingPoint ? editingPoint.operationLevel : newPoint.operationLevel}
                    onValueChange={(value) => editingPoint 
                      ? setEditingPoint({ ...editingPoint, operationLevel: value as any })
                      : setNewPoint({ ...newPoint, operationLevel: value as any })
                    }
                  >
                    <SelectTrigger className="w-full" title="操作权限级别">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="OPERATOR">操作员</SelectItem>
                      <SelectItem value="ENGINEER">工程师</SelectItem>
                      <SelectItem value="ADMIN">管理员</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">默认值</Label>
                  <Input
                    placeholder="默认值"
                    title="点位默认值"
                    value={editingPoint ? (editingPoint.defaultValue ?? '') : (newPoint.defaultValue ?? '')}
                    onChange={(e) => editingPoint 
                      ? setEditingPoint({ ...editingPoint, defaultValue: e.target.value })
                      : setNewPoint({ ...newPoint, defaultValue: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">描述</Label>
                  <Input
                    placeholder="点位描述"
                    title="输出点位描述"
                    value={editingPoint ? (editingPoint.description ?? '') : (newPoint.description ?? '')}
                    onChange={(e) => editingPoint 
                      ? setEditingPoint({ ...editingPoint, description: e.target.value })
                      : setNewPoint({ ...newPoint, description: e.target.value })
                    }
                  />
                </div>
              </div>
              
              {(activeTab === 'int32' || activeTab === 'float32') && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <Label className="text-xs">最小值</Label>
                    <Input
                      type="number"
                      placeholder="最小值"
                      title="有效范围最小值"
                      value={editingPoint ? (editingPoint.min ?? '') : (newPoint.min ?? '')}
                      onChange={(e) => editingPoint 
                        ? setEditingPoint({ ...editingPoint, min: e.target.value ? parseFloat(e.target.value) : undefined })
                        : setNewPoint({ ...newPoint, min: e.target.value ? parseFloat(e.target.value) : undefined })
                      }
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">最大值</Label>
                    <Input
                      type="number"
                      placeholder="最大值"
                      title="有效范围最大值"
                      value={editingPoint ? (editingPoint.max ?? '') : (newPoint.max ?? '')}
                      onChange={(e) => editingPoint 
                        ? setEditingPoint({ ...editingPoint, max: e.target.value ? parseFloat(e.target.value) : undefined })
                        : setNewPoint({ ...newPoint, max: e.target.value ? parseFloat(e.target.value) : undefined })
                      }
                    />
                  </div>
                </div>
              )}
              
              {editingPoint?.controlType === 'SELECT_BEFORE_OPERATE' || newPoint.controlType === 'SELECT_BEFORE_OPERATE' ? (
                <div className="space-y-1">
                  <Label className="text-xs">选择操作超时(ms)</Label>
                  <Input
                    type="number"
                    placeholder="选择操作超时时间"
                    title="选择操作超时时间（毫秒）"
                    value={editingPoint ? (editingPoint.sboTimeout ?? 10000) : (newPoint.sboTimeout ?? 10000)}
                    onChange={(e) => editingPoint 
                      ? setEditingPoint({ ...editingPoint, sboTimeout: parseInt(e.target.value) || 10000 })
                      : setNewPoint({ ...newPoint, sboTimeout: parseInt(e.target.value) || 10000 })
                    }
                  />
                </div>
              ) : null}
              
              {editingPoint?.controlType === 'ENHANCED_DIRECT' || newPoint.controlType === 'ENHANCED_DIRECT' ? (
                <div className="flex items-center space-x-2">
                  <Checkbox
                    checked={editingPoint ? editingPoint.enhancedDirect : newPoint.enhancedDirect}
                    onCheckedChange={(checked) => editingPoint 
                      ? setEditingPoint({ ...editingPoint, enhancedDirect: checked as boolean })
                      : setNewPoint({ ...newPoint, enhancedDirect: checked as boolean })
                    }
                  />
                  <Label className="text-sm">启用增强直接控制</Label>
                </div>
              ) : null}
              
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
                  <TableHead>路径</TableHead>
                  <TableHead>名称</TableHead>
                  <TableHead>数据类型</TableHead>
                  <TableHead>控制类型</TableHead>
                  <TableHead>操作级别</TableHead>
                  <TableHead>默认值</TableHead>
                  <TableHead>描述</TableHead>
                  <TableHead>操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPoints.map((point) => (
                  <TableRow key={point.id}>
                    <TableCell className="font-mono text-xs">{point.address}</TableCell>
                    <TableCell className="font-medium">{point.name}</TableCell>
                    <TableCell>
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                        {point.dataType}
                      </span>
                    </TableCell>
                    <TableCell>
                      {point.controlType === 'DIRECT' && '直接控制'}
                      {point.controlType === 'SELECT_BEFORE_OPERATE' && '选择-操作'}
                      {point.controlType === 'ENHANCED_DIRECT' && '增强直接控制'}
                    </TableCell>
                    <TableCell>
                      {point.operationLevel === 'OPERATOR' && '操作员'}
                      {point.operationLevel === 'ENGINEER' && '工程师'}
                      {point.operationLevel === 'ADMIN' && '管理员'}
                    </TableCell>
                    <TableCell>{point.defaultValue || '-'}</TableCell>
                    <TableCell className="text-xs">{point.description || '-'}</TableCell>
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

          {filteredPoints.length === 0 && (
            <div className="text-center py-4 text-gray-500">
              暂无{getTypeLabel(activeTab)}点位
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Iec61850OutputPointForm;