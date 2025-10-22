"use client";

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Trash2 } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';

interface InputPoint {
  id: string;
  name: string;
  nodeId: string;
  protocolType: string;
  address: string;
  dataType: string;
}

interface OutputPoint {
  id: string;
  name: string;
  nodeId: string;
  protocolType: string;
  address: string;
  dataType: string;
}

interface VariableCategory {
  id: string;
  name: string;
  description?: string;
}

interface VariableLogic {
  id: string;
  name: string;
  resultType: string;
  logicType: 'GENERATE' | 'BIND_OUTPUT' | 'SCRIPT_ONLY';
  inputVariableId?: string;
  outputVariableId?: string;
  scriptContent: string;
  executeRate: number;
  categoryId: string;
  description?: string;
  enabled: boolean;
}

export interface VariableAlias {
  id: string;
  alias: string;
  sourceType: 'device' | 'category';
  deviceId?: string;
  variableId?: string;
  categoryId?: string;
  variableName?: string;
}

interface VariableAliasSelectorProps {
  inputPoints: InputPoint[];
  outputPoints: OutputPoint[];
  categories: VariableCategory[];
  variables: VariableLogic[];
  aliases: VariableAlias[];
  onAliasesChange: (aliases: VariableAlias[]) => void;
}

const VariableAliasSelector: React.FC<VariableAliasSelectorProps> = ({
  inputPoints,
  outputPoints,
  categories,
  variables,
  aliases,
  onAliasesChange
}) => {
  const [isAddingAlias, setIsAddingAlias] = useState(false);
  const [newAlias, setNewAlias] = useState({
    alias: '',
    sourceType: 'device' as 'device' | 'category',
    deviceId: '',
    variableId: '',
    categoryId: '',
    variableName: ''
  });

  // 获取设备列表
  const getDeviceList = () => {
    const devices = new Map<string, { id: string; name: string; protocolType: string }>();
    
    inputPoints.forEach(point => {
      if (!devices.has(point.nodeId)) {
        devices.set(point.nodeId, {
          id: point.nodeId,
          name: point.name.split(' ')[0] || point.nodeId,
          protocolType: point.protocolType
        });
      }
    });
    
    outputPoints.forEach(point => {
      if (!devices.has(point.nodeId)) {
        devices.set(point.nodeId, {
          id: point.nodeId,
          name: point.name.split(' ')[0] || point.nodeId,
          protocolType: point.protocolType
        });
      }
    });
    
    return Array.from(devices.values());
  };

  const addAlias = () => {
    if (newAlias.alias && 
        ((newAlias.sourceType === 'device' && newAlias.deviceId && newAlias.variableId) || 
         (newAlias.sourceType === 'category' && newAlias.categoryId && newAlias.variableName))) {
      const alias: VariableAlias = {
        id: Date.now().toString(),
        ...newAlias
      };
      onAliasesChange([...aliases, alias]);
      setNewAlias({
        alias: '',
        sourceType: 'device',
        deviceId: '',
        variableId: '',
        categoryId: '',
        variableName: ''
      });
      setIsAddingAlias(false);
    }
  };

  const deleteAlias = (id: string) => {
    onAliasesChange(aliases.filter(alias => alias.id !== id));
  };

  const getDeviceVariables = (deviceId: string) => {
    return [
      ...inputPoints.filter(point => point.nodeId === deviceId),
      ...outputPoints.filter(point => point.nodeId === deviceId)
    ];
  };

  const getCategoryVariables = (categoryId: string) => {
    return variables.filter(variable => variable.categoryId === categoryId);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>变量别名配置</CardTitle>
          <Button onClick={() => setIsAddingAlias(!isAddingAlias)} variant="outline" size="sm">
            <Plus className="mr-1 h-3 w-3" />
            {isAddingAlias ? '取消' : '添加别名'}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {isAddingAlias && (
          <div className="space-y-4 mb-4 p-3 bg-gray-50 rounded">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>别名 *</Label>
                <Input
                  placeholder="变量别名 (如: TEMP1, VOLTAGE等)"
                  value={newAlias.alias}
                  onChange={(e) => setNewAlias({ ...newAlias, alias: e.target.value })}
                />
              </div>
              <div>
                <Label>来源类型 *</Label>
                <Select
                  value={newAlias.sourceType}
                  onValueChange={(value) => setNewAlias({ 
                    ...newAlias, 
                    sourceType: value as 'device' | 'category',
                    deviceId: '',
                    variableId: '',
                    categoryId: '',
                    variableName: ''
                  })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="device">设备变量</SelectItem>
                    <SelectItem value="category">中间变量</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {newAlias.sourceType === 'device' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>选择设备 *</Label>
                  <Select
                    value={newAlias.deviceId}
                    onValueChange={(value) => setNewAlias({ ...newAlias, deviceId: value, variableId: '' })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="选择设备" />
                    </SelectTrigger>
                    <SelectContent>
                      {getDeviceList().map(device => (
                        <SelectItem key={device.id} value={device.id}>
                          {device.name} ({device.protocolType})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>选择变量 *</Label>
                  <Select
                    value={newAlias.variableId}
                    onValueChange={(value) => setNewAlias({ ...newAlias, variableId: value })}
                    disabled={!newAlias.deviceId}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="选择变量" />
                    </SelectTrigger>
                    <SelectContent>
                      {newAlias.deviceId && getDeviceVariables(newAlias.deviceId).map(variable => (
                        <SelectItem key={variable.id} value={variable.id}>
                          {variable.name} ({variable.dataType})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}

            {newAlias.sourceType === 'category' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>选择分类 *</Label>
                  <Select
                    value={newAlias.categoryId}
                    onValueChange={(value) => setNewAlias({ ...newAlias, categoryId: value, variableName: '' })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="选择分类" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map(category => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>选择变量 *</Label>
                  <Select
                    value={newAlias.variableName}
                    onValueChange={(value) => setNewAlias({ ...newAlias, variableName: value })}
                    disabled={!newAlias.categoryId}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="选择变量" />
                    </SelectTrigger>
                    <SelectContent>
                      {newAlias.categoryId && getCategoryVariables(newAlias.categoryId).map(variable => (
                        <SelectItem key={variable.id} value={variable.name}>
                          {variable.name} ({variable.resultType})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}

            <div className="flex justify-end space-x-2">
              <Button variant="outline" size="sm" onClick={() => setIsAddingAlias(false)}>取消</Button>
              <Button size="sm" onClick={addAlias} disabled={!newAlias.alias || 
                (newAlias.sourceType === 'device' && (!newAlias.deviceId || !newAlias.variableId)) ||
                (newAlias.sourceType === 'category' && (!newAlias.categoryId || !newAlias.variableName))
              }>
                添加别名
              </Button>
            </div>
          </div>
        )}

        <div className="space-y-2">
          {aliases.length === 0 ? (
            <div className="text-center py-4 text-gray-500">
              暂无变量别名，请添加别名以便在脚本中使用
            </div>
          ) : (
            aliases.map(alias => (
              <div key={alias.id} className="flex items-center justify-between p-3 border rounded-lg bg-white">
                <div className="flex items-center gap-3">
                  <Badge variant="secondary" className="font-mono">{alias.alias}</Badge>
                  <div>
                    <div className="font-medium">
                      {alias.sourceType === 'device' 
                        ? inputPoints.find(p => p.id === alias.variableId)?.name || 
                          outputPoints.find(p => p.id === alias.variableId)?.name || '未知变量'
                        : alias.variableName}
                    </div>
                    <div className="text-sm text-gray-500">
                      {alias.sourceType === 'device' ? '设备变量' : '中间变量'}
                    </div>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => deleteAlias(alias.id)}
                >
                  <Trash2 className="h-4 w-4 text-red-500" />
                </Button>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default VariableAliasSelector;