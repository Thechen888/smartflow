"use client";

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Trash2, Download, Upload, Pencil } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { toast } from "sonner";

interface Iec104OutputPoint {
  id: string;
  address: string;
  name: string;
  dataType: string;
  min?: number;
  max?: number;
  multiplier?: number;
  offset?: number;
  description?: string;
  logicType?: 'BIND_INPUT' | 'SCRIPT_ONLY';
  boundInputProtocol?: string;
  boundInputPoint?: string;
  variableName?: string;
}

interface Iec104OutputPointFormProps {
  points: Iec104OutputPoint[];
  onPointsChange: (points: Iec104OutputPoint[]) => void;
}

const Iec104OutputPointForm: React.FC<Iec104OutputPointFormProps> = ({
  points,
  onPointsChange
}) => {
  const [isAdding, setIsAdding] = useState(false);
  const [editingPoint, setEditingPoint] = useState<Iec104OutputPoint | null>(null);
  const [newPoint, setNewPoint] = useState<Omit<Iec104OutputPoint, 'id'>>({
    address: '5001',
    name: '',
    dataType: '单点遥信',
    description: '',
    min: undefined,
    max: undefined,
    multiplier: 1,
    offset: 0,
    variableName: ''
  });

  const [configDialogOpen, setConfigDialogOpen] = useState(false);
  const [selectedPointForConfig, setSelectedPointForConfig] = useState<Iec104OutputPoint | null>(null);
  const [configForm, setConfigForm] = useState({
    logicType: 'BIND_INPUT' as 'BIND_INPUT' | 'SCRIPT_ONLY',
    boundInputProtocol: 'IEC104 客户端',
    boundInputPoint: 'voltage'
  });

  const addPoint = () => {
    if (newPoint.name) {
      const point: Iec104OutputPoint = {
        ...newPoint,
        id: Date.now().toString()
      };
      onPointsChange([...points, point]);
      setNewPoint({ 
        address: '5001', 
        name: '', 
        dataType: '单点遥信',
        description: '',
        min: undefined,
        max: undefined,
        multiplier: 1,
        offset: 0,
        variableName: ''
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

  const startEditingPoint = (point: Iec104OutputPoint) => {
    setEditingPoint({ ...point });
    setIsAdding(false);
  };

  // 配置对话框处理（用于输出点位逻辑）
  const openConfigDialog = (point: Iec104OutputPoint) => {
    setSelectedPointForConfig(point);
    setConfigForm({
      logicType: point.logicType || 'BIND_INPUT',
      boundInputProtocol: point.boundInputProtocol || 'IEC104 客户端',
      boundInputPoint: point.boundInputPoint || 'voltage'
    });
    setConfigDialogOpen(true);
  };

  const saveConfig = () => {
    if (selectedPointForConfig) {
      const updatedPoint = {
        ...selectedPointForConfig,
        logicType: configForm.logicType,
        boundInputProtocol: configForm.boundInputProtocol,
        boundInputPoint: configForm.logicType === 'BIND_INPUT' ? configForm.boundInputPoint : undefined
      };
      onPointsChange(points.map(point => 
        point.id === selectedPointForConfig.id ? updatedPoint : point
      ));
      setConfigDialogOpen(false);
      setSelectedPointForConfig(null);
    }
  };

  const exportConfig = () => {
    const config = { points };
    const dataStr = JSON.stringify(config, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'iec104_output_config.json';
    link.click();
    URL.revokeObjectURL(url);
    toast.success('IEC104输出配置已导出');
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
          toast.success('IEC104输出配置已导入');
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

  const getLogicTypeLabel = (type: 'BIND_INPUT' | 'SCRIPT_ONLY' | undefined) => {
    if (!type) return '绑定输入点位';
    return type === 'BIND_INPUT' ? '绑定输入点位' : '纯脚本';
  };

  const protocolOptions = [
    'MODBUS TCP 客户端',
    'MODBUS RTU 客户端', 
    'IEC104',
    'IEC61850 客户端',
    'DLT645 RTU 电表',
    'DLT645 TCP 电表'
  ];

  const pointOptions = [
    { value: 'voltage', label: 'voltage' },
    { value: 'current', label: 'current' }
  ];

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <CardTitle>IEC104 输出点位配置</CardTitle>
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
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <Label className="text-xs">地址 *</Label>
                  <Input
                    placeholder="例如: 5001"
                    value={editingPoint ? editingPoint.address : newPoint.address}
                    onChange={(e) => editingPoint 
                      ? setEditingPoint({ ...editingPoint, address: e.target.value })
                      : setNewPoint({ ...newPoint, address: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">名称 *</Label>
                  <Input
                    placeholder="点位名称"
                    value={editingPoint ? editingPoint.name : newPoint.name}
                    onChange={(e) => editingPoint 
                      ? setEditingPoint({ ...editingPoint, name: e.target.value })
                      : setNewPoint({ ...newPoint, name: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">类型 *</Label>
                  <Select
                    value={editingPoint ? editingPoint.dataType : newPoint.dataType}
                    onValueChange={(value) => editingPoint 
                      ? setEditingPoint({ ...editingPoint, dataType: value })
                      : setNewPoint({ ...newPoint, dataType: value })
                    }
                  >
                    <SelectTrigger className="w-full" title="控制数据类型">
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
              
              <div className="grid grid-cols-1 md:grid-cols-5 gap-2">
                <div className="space-y-1">
                  <Label className="text-xs">最小值</Label>
                  <Input
                    type="number"
                    placeholder="最小值"
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
                    value={editingPoint ? (editingPoint.max ?? '') : (newPoint.max ?? '')}
                    onChange={(e) => editingPoint 
                      ? setEditingPoint({ ...editingPoint, max: e.target.value ? parseFloat(e.target.value) : undefined })
                      : setNewPoint({ ...newPoint, max: e.target.value ? parseFloat(e.target.value) : undefined })
                    }
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">倍率</Label>
                  <Input
                    type="number"
                    placeholder="1"
                    value={editingPoint ? (editingPoint.multiplier ?? 1) : (newPoint.multiplier ?? 1)}
                    onChange={(e) => editingPoint 
                      ? setEditingPoint({ ...editingPoint, multiplier: e.target.value ? parseFloat(e.target.value) : 1 })
                      : setNewPoint({ ...newPoint, multiplier: e.target.value ? parseFloat(e.target.value) : 1 })
                    }
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">偏移量</Label>
                  <Input
                    type="number"
                    placeholder="0"
                    value={editingPoint ? (editingPoint.offset ?? 0) : (newPoint.offset ?? 0)}
                    onChange={(e) => editingPoint 
                      ? setEditingPoint({ ...editingPoint, offset: e.target.value ? parseFloat(e.target.value) : 0 })
                      : setNewPoint({ ...newPoint, offset: e.target.value ? parseFloat(e.target.value) : 0 })
                    }
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">变量名称</Label>
                  <Input
                    placeholder="变量名称"
                    title="控制变量名称"
                    value={editingPoint ? (editingPoint.variableName ?? '') : (newPoint.variableName ?? '')}
                    onChange={(e) => editingPoint 
                      ? setEditingPoint({ ...editingPoint, variableName: e.target.value })
                      : setNewPoint({ ...newPoint, variableName: e.target.value })
                    }
                  />
                </div>
              </div>
              
              <div className="space-y-1">
                <Label className="text-xs">描述</Label>
                <Input
                  placeholder="点位描述"
                  value={editingPoint ? (editingPoint.description ?? '') : (newPoint.description ?? '')}
                  onChange={(e) => editingPoint 
                    ? setEditingPoint({ ...editingPoint, description: e.target.value })
                    : setNewPoint({ ...newPoint, description: e.target.value })
                  }
                />
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
                  <TableHead>地址</TableHead>
                  <TableHead>名称</TableHead>
                  <TableHead>类型</TableHead>
                  <TableHead>最小值</TableHead>
                  <TableHead>最大值</TableHead>
                  <TableHead>倍率</TableHead>
                  <TableHead>偏移量</TableHead>
                  <TableHead>变量名称</TableHead>
                  <TableHead>描述</TableHead>
                  <TableHead>逻辑类型</TableHead>
                  <TableHead>绑定输入点位</TableHead>
                  <TableHead>操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {points.map((point) => (
                  <TableRow key={point.id}>
                    <TableCell className="font-medium">{point.address}</TableCell>
                    <TableCell className="font-medium">{point.name}</TableCell>
                    <TableCell>
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                        {getDataTypeLabel(point.dataType)}
                      </span>
                    </TableCell>
                    <TableCell>{point.min ?? '-'}</TableCell>
                    <TableCell>{point.max ?? '-'}</TableCell>
                    <TableCell>{point.multiplier ?? '-'}</TableCell>
                    <TableCell>{point.offset ?? '-'}</TableCell>
                    <TableCell className="text-xs">{point.variableName || '-'}</TableCell>
                    <TableCell className="text-xs">{point.description || '-'}</TableCell>
                    <TableCell className="text-xs">
                      {getLogicTypeLabel(point.logicType)}
                    </TableCell>
                    <TableCell className="text-xs">
                      {point.logicType === 'BIND_INPUT' ? 
                        `${point.boundInputProtocol || 'IEC104 客户端'} - ${point.boundInputPoint || 'voltage'}` : 
                        '-'}
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
                        onClick={() => openConfigDialog(point)}
                        title="配置逻辑"
                      >
                        <Pencil className="h-4 w-4 text-purple-500" />
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
              暂无IEC104输出点位
            </div>
          )}
        </CardContent>
      </Card>

      {/* 配置对话框（输出点位逻辑） */}
      <Dialog open={configDialogOpen} onOpenChange={setConfigDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>配置输出点位逻辑</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label>逻辑类型 *</Label>
              <Select
                value={configForm.logicType}
                onValueChange={(value) => setConfigForm({ 
                  ...configForm, 
                  logicType: value as 'BIND_INPUT' | 'SCRIPT_ONLY',
                  boundInputProtocol: value === 'BIND_INPUT' ? (configForm.boundInputProtocol || 'IEC104 客户端') : undefined,
                  boundInputPoint: value === 'BIND_INPUT' ? (configForm.boundInputPoint || 'voltage') : undefined
                })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="BIND_INPUT">绑定输入点位</SelectItem>
                  <SelectItem value="SCRIPT_ONLY">纯脚本</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {configForm.logicType === 'BIND_INPUT' && (
              <>
                <div>
                  <Label>输入协议类型 *</Label>
                  <Select
                    value={configForm.boundInputProtocol}
                    onValueChange={(value) => setConfigForm({ 
                      ...configForm, 
                      boundInputProtocol: value,
                      boundInputPoint: 'voltage'
                    })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {protocolOptions.map(protocol => (
                        <SelectItem key={protocol} value={protocol}>
                          {protocol}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>输入点位选择 *</Label>
                  <Select
                    value={configForm.boundInputPoint}
                    onValueChange={(value) => setConfigForm({ ...configForm, boundInputPoint: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {pointOptions.map(point => (
                        <SelectItem key={point.value} value={point.value}>
                          {point.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfigDialogOpen(false)}>取消</Button>
            <Button onClick={saveConfig}>保存配置</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Iec104OutputPointForm;