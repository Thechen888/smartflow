"use client";

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Trash2, Download, Upload, Pencil, Search } from 'lucide-react';
import { Label } from '@/components/ui/label';

interface Iec104InputPoint {
  id: string;
  address: string;
  dataType: string;
  scanRate: number;
  description?: string;
}

interface Iec104InputPointFormProps {
  points: Iec104InputPoint[];
  onPointsChange: (points: Iec104InputPoint[]) => void;
}

const Iec104InputPointForm: React.FC<Iec104InputPointFormProps> = ({
  points,
  onPointsChange
}) => {
  const [isAdding, setIsAdding] = useState(false);
  const [editingPoint, setEditingPoint] = useState<Iec104InputPoint | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [newPoint, setNewPoint] = useState<Omit<Iec104InputPoint, 'id'>>({
    address: '1001',
    dataType: 'M_SP_NA_1',
    scanRate: 500,
    description: ''
  });

  const addPoint = () => {
    if (newPoint.address) {
      const point: Iec104InputPoint = {
        ...newPoint,
        id: Date.now().toString()
      };
      onPointsChange([...points, point]);
      setNewPoint({ 
        address: '1001', 
        dataType: 'M_SP_NA_1', 
        scanRate: 500,
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

  const filteredPoints = points.filter(point => 
    point.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
    point.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getDataTypeLabel = (type: string): string => {
    const labels: Record<string, string> = {
      'M_SP_NA_1': '单点信息 (M_SP_NA_1)',
      'M_DP_NA_1': '双点信息 (M_DP_NA_1)',
      'M_ST_NA_1': '步位置信息 (M_ST_NA_1)',
      'M_ME_NA_1': '测量值-归一化值 (M_ME_NA_1)',
      'M_ME_NB_1': '测量值-标度化值 (M_ME_NB_1)',
      'M_ME_NC_1': '测量值-短浮点数 (M_ME_NC_1)',
      'M_IT_NA_1': '累计量 (M_IT_NA_1)'
    };
    return labels[type] || type;
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <CardTitle>IEC104 输入点位配置</CardTitle>
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

      {/* 搜索栏 */}
      {!isAdding && (
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="搜索点位..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      )}

      {/* 添加/编辑表单 */}
      {isAdding && (
        <Card className="p-4 bg-blue-50">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg">
              {editingPoint ? '编辑点位' : '添加新点位'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>信息对象地址 *</Label>
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
                <Label>数据类型 *</Label>
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
                    <SelectItem value="M_SP_NA_1">单点信息 (M_SP_NA_1)</SelectItem>
                    <SelectItem value="M_DP_NA_1">双点信息 (M_DP_NA_1)</SelectItem>
                    <SelectItem value="M_ST_NA_1">步位置信息 (M_ST_NA_1)</SelectItem>
                    <SelectItem value="M_ME_NA_1">测量值-归一化值 (M_ME_NA_1)</SelectItem>
                    <SelectItem value="M_ME_NB_1">测量值-标度化值 (M_ME_NB_1)</SelectItem>
                    <SelectItem value="M_ME_NC_1">测量值-短浮点数 (M_ME_NC_1)</SelectItem>
                    <SelectItem value="M_IT_NA_1">累计量 (M_IT_NA_1)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>扫描频率(ms)</Label>
                <Input
                  type="number"
                  value={editingPoint ? editingPoint.scanRate : newPoint.scanRate}
                  onChange={(e) => editingPoint 
                    ? setEditingPoint({ ...editingPoint, scanRate: parseInt(e.target.value) || 500 })
                    : setNewPoint({ ...newPoint, scanRate: parseInt(e.target.value) || 500 })
                  }
                  placeholder="500"
                />
              </div>
              <div className="space-y-2">
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
            </div>
            <div className="flex justify-end gap-2 mt-4">
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
                disabled={!editingPoint && !newPoint.address}
              >
                {editingPoint ? '更新' : '添加'}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* 点位列表 */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>信息对象地址</TableHead>
                <TableHead>数据类型</TableHead>
                <TableHead>扫描频率(ms)</TableHead>
                <TableHead>描述</TableHead>
                <TableHead className="w-32">操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPoints.map((point) => (
                <TableRow key={point.id}>
                  <TableCell className="font-medium">{point.address}</TableCell>
                  <TableCell>
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                      {getDataTypeLabel(point.dataType)}
                    </span>
                  </TableCell>
                  <TableCell>{point.scanRate}</TableCell>
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
          {filteredPoints.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              暂无IEC104输入点位
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Iec104InputPointForm;