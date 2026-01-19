"use client";

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Trash2, Download, Upload, Pencil } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { toast } from "sonner";

interface Iec104InputPoint {
  id: string;
  commonAddress: number;           // 公共地址
  causeOfTransmission: number;    // 传送原因
  informationObjectAddress: number; // 信息体地址
  timestamp?: number;             // 时标
  typeId: string;                 // 类型标识
  dataType: string;               // 数据类型
  description?: string;            // 描述
}

interface Iec104InputPointFormProps {
  points: Iec104InputPoint[];
  onPointsChange: (points: Iec104InputPoint[]) => void;
}

const Iec104InputPointForm: React.FC<Iec104InputPointFormProps> = ({
  points,
  onPointsChange
}) => {
  const [activeTab, setActiveTab] = useState('M_SP_NA_1');
  const [isAdding, setIsAdding] = useState(false);
  const [editingPoint, setEditingPoint] = useState<Iec104InputPoint | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [newPoint, setNewPoint] = useState<Omit<Iec104InputPoint, 'id'>>({
    commonAddress: 1,
    causeOfTransmission: 20,
    informationObjectAddress: 1001,
    timestamp: 0,
    typeId: 'M_SP_NA_1',
    dataType: 'BOOLEAN',
    description: ''
  });

  const addPoint = () => {
    if (newPoint.typeId) {
      const point: Iec104InputPoint = {
        ...newPoint,
        id: Date.now().toString()
      };
      onPointsChange([...points, point]);
      setNewPoint({ 
        commonAddress: 1,
        causeOfTransmission: 20,
        informationObjectAddress: 1001,
        timestamp: 0,
        typeId: activeTab,
        dataType: activeTab === 'M_SP_NA_1' || activeTab === 'M_DP_NA_1' ? 'BOOLEAN' : 'INT16',
        description: ''
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

  const startEditingPoint = (point: Iec104InputPoint) => {
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
    link.download = 'iec104_input_config.json';
    link.click();
    URL.revokeObjectURL(url);
    toast.success('IEC104输入配置已导出');
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
          toast.success('IEC104输入配置已导入');
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

  const filteredPoints = points.filter(point => {
    const matchesTab = point.typeId === activeTab;
    const matchesSearch = searchTerm === '' || 
      point.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      point.informationObjectAddress.toString().includes(searchTerm);
    return matchesTab && matchesSearch;
  });

  const getDataTypeOptions = (typeId: string) => {
    if (typeId === 'M_SP_NA_1' || typeId === 'M_DP_NA_1') {
      return <SelectItem value="BOOLEAN">BOOLEAN</SelectItem>;
    }
    if (typeId === 'M_ME_NA_1') {
      return <><SelectItem value="INT16">INT16</SelectItem><SelectItem value="UINT16">UINT16</SelectItem></>;
    }
    if (typeId === 'M_ME_NB_1') {
      return <><SelectItem value="INT32">INT32</SelectItem><SelectItem value="UINT32">UINT32</SelectItem></>;
    }
    if (typeId === 'M_ME_NC_1') {
      return <><SelectItem value="FLOAT32">FLOAT32</SelectItem><SelectItem value="FLOAT64">FLOAT64</SelectItem></>;
    }
    if (typeId === 'M_ST_NA_1') {
      return <><SelectItem value="INT16">INT16</SelectItem><SelectItem value="UINT16">UINT16</SelectItem></>;
    }
    if (typeId === 'M_IT_NA_1') {
      return <><SelectItem value="INT32">INT32</SelectItem><SelectItem value="UINT32">UINT32</SelectItem></>;
    }
    return null;
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="M_SP_NA_1">单点遥测信息</TabsTrigger>
            <TabsTrigger value="M_DP_NA_1">双点遥测信息</TabsTrigger>
            <TabsTrigger value="M_ST_NA_1">步位置遥测信息</TabsTrigger>
            <TabsTrigger value="M_ME_NA_1">测量值-归一化值</TabsTrigger>
            <TabsTrigger value="M_ME_NB_1">测量值-标度化值</TabsTrigger>
            <TabsTrigger value="M_ME_NC_1">测量值-短浮点数</TabsTrigger>
            <TabsTrigger value="M_IT_NA_1">累计量</TabsTrigger>
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
            <CardTitle>{activeTab}</CardTitle>
            <Button onClick={() => setIsAdding(!isAdding)} variant="outline" size="sm">
              <Plus className="mr-1 h-3 w-3" />
              {isAdding ? '取消' : '添加点位'}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {(isAdding || editingPoint) && (
            <div className="space-y-4 mb-4 p-3 bg-gray-50 rounded">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <Label className="text-xs">公共地址 *</Label>
                  <Input
                    type="number"
                    title="公共地址"
                    value={editingPoint ? editingPoint.commonAddress : newPoint.commonAddress}
                    onChange={(e) => editingPoint 
                      ? setEditingPoint({ ...editingPoint, commonAddress: parseInt(e.target.value) || 1 })
                      : setNewPoint({ ...newPoint, commonAddress: parseInt(e.target.value) || 1 })
                    }
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">传送原因 *</Label>
                  <Input
                    type="number"
                    title="传送原因"
                    value={editingPoint ? editingPoint.causeOfTransmission : newPoint.causeOfTransmission}
                    onChange={(e) => editingPoint 
                      ? setEditingPoint({ ...editingPoint, causeOfTransmission: parseInt(e.target.value) || 20 })
                      : setNewPoint({ ...newPoint, causeOfTransmission: parseInt(e.target.value) || 20 })
                    }
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">信息体地址 *</Label>
                  <Input
                    type="number"
                    title="信息体地址"
                    value={editingPoint ? editingPoint.informationObjectAddress : newPoint.informationObjectAddress}
                    onChange={(e) => editingPoint 
                      ? setEditingPoint({ ...editingPoint, informationObjectAddress: parseInt(e.target.value) || 1001 })
                      : setNewPoint({ ...newPoint, informationObjectAddress: parseInt(e.target.value) || 1001 })
                    }
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <Label className="text-xs">时标</Label>
                  <Input
                    type="number"
                    title="时标"
                    value={editingPoint ? (editingPoint.timestamp ?? '') : (newPoint.timestamp ?? '')}
                    onChange={(e) => editingPoint 
                      ? setEditingPoint({ ...editingPoint, timestamp: e.target.value ? parseInt(e.target.value) : undefined })
                      : setNewPoint({ ...newPoint, timestamp: e.target.value ? parseInt(e.target.value) : undefined })
                    }
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">类型标识 *</Label>
                  <Input
                    title="类型标识"
                    value={activeTab}
                    disabled
                    className="bg-gray-100"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">数据类型 *</Label>
                  <Select
                    value={editingPoint ? editingPoint.dataType : newPoint.dataType}
                    onValueChange={(value) => editingPoint 
                      ? setEditingPoint({ ...editingPoint, dataType: value })
                      : setNewPoint({ ...newPoint, dataType: value })
                    }
                  >
                    <SelectTrigger className="w-full" title="数据类型">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {getDataTypeOptions(activeTab)}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="space-y-1">
                <Label className="text-xs">描述</Label>
                <Input
                  title="点位描述"
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
                <Button size="sm" onClick={editingPoint ? updatePoint : addPoint}>
                  {editingPoint ? '更新' : '添加'}
                </Button>
              </div>
            </div>
          )}

          {/* 搜索栏 */}
          {!isAdding && !editingPoint && (
            <div className="relative mb-4">
              <Input
                placeholder="搜索点位..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          )}

          <div className="border rounded-lg overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>公共地址</TableHead>
                  <TableHead>传送原因</TableHead>
                  <TableHead>信息体地址</TableHead>
                  <TableHead>时标</TableHead>
                  <TableHead>类型标识</TableHead>
                  <TableHead>数据类型</TableHead>
                  <TableHead>描述</TableHead>
                  <TableHead>操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPoints.map((point) => (
                  <TableRow key={point.id}>
                    <TableCell>{point.commonAddress}</TableCell>
                    <TableCell>{point.causeOfTransmission}</TableCell>
                    <TableCell>{point.informationObjectAddress}</TableCell>
                    <TableCell>{point.timestamp || '-'}</TableCell>
                    <TableCell>
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                        {point.typeId}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                        {point.dataType}
                      </span>
                    </TableCell>
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
          </div>

          {filteredPoints.length === 0 && (
            <div className="text-center py-4 text-gray-500">
              暂无{activeTab}点位
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Iec104InputPointForm;