"use client";

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Trash2, Download, Upload, Pencil, Settings2 } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { toast } from "sonner";

interface ModbusRegister {
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
  logicType?: 'BIND_INPUT' | 'SCRIPT_ONLY';
  boundInputProtocol?: string;
  boundInputPoint?: string;
  variableName?: string;
}

interface ModbusTcpOutputPointFormProps {
  registers: ModbusRegister[];
  onRegistersChange: (registers: ModbusRegister[]) => void;
  // 新增isIoTab属性来区分是输出点位还是IO点位
  isIoTab?: boolean;
}

const ModbusTcpOutputPointForm: React.FC<ModbusTcpOutputPointFormProps> = ({
  registers,
  onRegistersChange,
  isIoTab = false
}) => {
  const [isAddingRegister, setIsAddingRegister] = useState(false);
  const [editingRegister, setEditingRegister] = useState<ModbusRegister | null>(null);
  const [newRegister, setNewRegister] = useState<Omit<ModbusRegister, 'id'>>({
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
    hint: '',
    variableName: ''
  });

  const [configDialogOpen, setConfigDialogOpen] = useState(false);
  const [selectedRegisterForConfig, setSelectedRegisterForConfig] = useState<ModbusRegister | null>(null);
  const [configForm, setConfigForm] = useState({
    logicType: 'BIND_INPUT' as 'BIND_INPUT' | 'SCRIPT_ONLY',
    boundInputProtocol: 'MODBUS TCP 客户端',
    boundInputPoint: 'voltage'
  });

  const [ioBindingDialogOpen, setIoBindingDialogOpen] = useState(false);
  const [selectedRegisterForIoBinding, setSelectedRegisterForIoBinding] = useState<ModbusRegister | null>(null);
  const [ioBindingForm, setIoBindingForm] = useState({
    emsIoDevice: 'EMS IO',
    pointType: 'DI' as 'DI' | 'DO',
    point: '!water'
  });

  const addRegister = () => {
    if (newRegister.name) {
      const register: ModbusRegister = {
        ...newRegister,
        id: Date.now().toString()
      };
      onRegistersChange([...registers, register]);
      setNewRegister({ 
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
        hint: '',
        variableName: ''
      });
      setIsAddingRegister(false);
    }
  };

  const updateRegister = () => {
    if (editingRegister) {
      onRegistersChange(registers.map(reg => 
        reg.id === editingRegister.id ? editingRegister : reg
      ));
      setEditingRegister(null);
    }
  };

  const deleteRegister = (id: string) => {
    onRegistersChange(registers.filter(register => register.id !== id));
  };

  const startEditingRegister = (register: ModbusRegister) => {
    setEditingRegister({ ...register });
    setIsAddingRegister(false);
  };

  const toggleByteOrder = (id: string) => {
    onRegistersChange(registers.map(reg => 
      reg.id === id ? { ...reg, reverseByteOrder: !reg.reverseByteOrder } : reg
    ));
  };

  const openConfigDialog = (register: ModbusRegister) => {
    setSelectedRegisterForConfig(register);
    setConfigForm({
      logicType: register.logicType || 'BIND_INPUT',
      boundInputProtocol: register.boundInputProtocol || 'MODBUS TCP 客户端',
      boundInputPoint: register.boundInputPoint || 'voltage'
    });
    setConfigDialogOpen(true);
  };

  const saveConfig = () => {
    if (selectedRegisterForConfig) {
      const updatedRegister = {
        ...selectedRegisterForConfig,
        logicType: configForm.logicType,
        boundInputProtocol: configForm.boundInputProtocol,
        boundInputPoint: configForm.logicType === 'BIND_INPUT' ? configForm.boundInputPoint : undefined
      };
      onRegistersChange(registers.map(reg => 
        reg.id === selectedRegisterForConfig.id ? updatedRegister : reg
      ));
      setConfigDialogOpen(false);
      setSelectedRegisterForConfig(null);
    }
  };

  const openIoBindingDialog = (register: ModbusRegister) => {
    setSelectedRegisterForIoBinding(register);
    setIoBindingForm({
      emsIoDevice: 'EMS IO',
      pointType: 'DI',
      point: '!water'
    });
    setIoBindingDialogOpen(true);
  };

  const saveIoBinding = () => {
    if (selectedRegisterForIoBinding) {
      setIoBindingDialogOpen(false);
      setSelectedRegisterForIoBinding(null);
    }
  };

  const getTypeExample = (type: string): string => {
    const examples: Record<string, string> = {
      'uint16': '0-65535 (无符号16位整数)',
      'int16': '-32768-32767 (有符号16位整数)',
      'uint32': '0-4294967295 (无符号32位整数)',
      'int32': '-2147483648-2147483647 (有符号32位整数)',
      'ascii': 'ASCII字符串 (可变长度)',
      'ascii8': '8位ASCII字符串 (固定8字节)'
    };
    return examples[type] || '';
  };

  const exportConfig = () => {
    const config = { registers };
    const dataStr = JSON.stringify(config, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'modbus_tcp_output_config.json';
    link.click();
    URL.revokeObjectURL(url);
    toast.success('MODBUS TCP输出配置已导出');
  };

  const importConfig = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const config = JSON.parse(e.target?.result as string);
        if (config.registers) {
          onRegistersChange(config.registers);
          toast.success('MODBUS TCP输出配置已导入');
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
        <CardTitle>
          {isIoTab ? 'MODBUS IO点位配置' : 'MODBUS 输出点位配置'}
        </CardTitle>
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
          <Button onClick={() => setIsAddingRegister(!isAddingRegister)} variant="outline" size="sm">
            <Plus className="mr-1 h-3 w-3" />
            {isAddingRegister ? '取消' : '添加寄存器'}
          </Button>
        </div>
      </div>

      <Card>
        <CardContent>
          {(isAddingRegister || editingRegister) && (
            <div className="space-y-4 mb-4 p-3 bg-gray-50 rounded">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
                <div className="space-y-1">
                  <Label className="text-xs">从站ID</Label>
                  <Input
                    type="number"
                    placeholder="从站ID (1-247)"
                    title="MODBUS从站ID，范围1-247"
                    value={editingRegister ? editingRegister.slaveId : newRegister.slaveId}
                    onChange={(e) => editingRegister 
                      ? setEditingRegister({ ...editingRegister, slaveId: parseInt(e.target.value) || 1 })
                      : setNewRegister({ ...newRegister, slaveId: parseInt(e.target.value) || 1 })
                    }
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">地址</Label>
                  <Input
                    type="number"
                    placeholder="寄存器地址"
                    title="寄存器地址"
                    value={editingRegister ? editingRegister.address : newRegister.address}
                    onChange={(e) => editingRegister 
                      ? setEditingRegister({ ...editingRegister, address: parseInt(e.target.value) || 0 })
                      : setNewRegister({ ...newRegister, address: parseInt(e.target.value) || 0 })
                    }
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">数据类型</Label>
                  <Select
                    value={editingRegister ? editingRegister.type : newRegister.type}
                    onValueChange={(value) => editingRegister 
                      ? setEditingRegister({ ...editingRegister, type: value as any })
                      : setNewRegister({ ...newRegister, type: value as any })
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
                    value={editingRegister ? editingRegister.name : newRegister.name}
                    onChange={(e) => editingRegister 
                      ? setEditingRegister({ ...editingRegister, name: e.target.value })
                      : setNewRegister({ ...newRegister, name: e.target.value })
                    }
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-6 gap-2">
                <div className="flex items-center space-x-2" title="是否反转多字节数据的字节顺序">
                  <Checkbox
                    checked={editingRegister ? editingRegister.reverseByteOrder : newRegister.reverseByteOrder}
                    onCheckedChange={(checked) => editingRegister 
                      ? setEditingRegister({ ...editingRegister, reverseByteOrder: checked as boolean })
                      : setNewRegister({ ...newRegister, reverseByteOrder: checked as boolean })
                    }
                  />
                  <Label className="text-sm">反转字节序</Label>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">变量名称</Label>
                  <Input
                    placeholder="变量名称"
                    title="输出变量名称"
                    value={editingRegister ? (editingRegister.variableName ?? '') : (newRegister.variableName ?? '')}
                    onChange={(e) => editingRegister 
                      ? setEditingRegister({ ...editingRegister, variableName: e.target.value })
                      : setNewRegister({ ...newRegister, variableName: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">注释</Label>
                  <Input
                    placeholder="寄存器注释"
                    title="寄存器描述或注释"
                    value={editingRegister ? editingRegister.comment : newRegister.comment}
                    onChange={(e) => editingRegister 
                      ? setEditingRegister({ ...editingRegister, comment: e.target.value })
                      : setNewRegister({ ...newRegister, comment: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">最小值(实际值)</Label>
                  <Input
                    type="number"
                    placeholder="最小实际值"
                    title="实际工程值的最小有效范围"
                    value={editingRegister ? (editingRegister.min ?? '') : (newRegister.min ?? '')}
                    onChange={(e) => editingRegister 
                      ? setEditingRegister({ ...editingRegister, min: e.target.value ? parseFloat(e.target.value) : undefined })
                      : setNewRegister({ ...newRegister, min: e.target.value ? parseFloat(e.target.value) : undefined })
                    }
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">最大值(实际值)</Label>
                  <Input
                    type="number"
                    placeholder="最大实际值"
                    title="实际工程值的最大有效范围"
                    value={editingRegister ? (editingRegister.max ?? '') : (newRegister.max ?? '')}
                    onChange={(e) => editingRegister 
                      ? setEditingRegister({ ...editingRegister, max: e.target.value ? parseFloat(e.target.value) : undefined })
                      : setNewRegister({ ...newRegister, max: e.target.value ? parseFloat(e.target.value) : undefined })
                    }
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">比例系数(A)</Label>
                  <Input
                    placeholder="A系数"
                    title="线性变换比例系数 A (实际值 = A × 寄存器值 + B)"
                    value={editingRegister ? (editingRegister.a ?? '') : (newRegister.a ?? '')}
                    onChange={(e) => editingRegister 
                      ? setEditingRegister({ ...editingRegister, a: e.target.value ? parseFloat(e.target.value) : 1 })
                      : setNewRegister({ ...newRegister, a: e.target.value ? parseFloat(e.target.value) : 1 })
                    }
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">偏移量(B)</Label>
                  <Input
                    placeholder="B系数"
                    title="线性变换偏移量 B (实际值 = A × 寄存器值 + B)"
                    value={editingRegister ? (editingRegister.b ?? '') : (newRegister.b ?? '')}
                    onChange={(e) => editingRegister 
                      ? setEditingRegister({ ...editingRegister, b: e.target.value ? parseFloat(e.target.value) : 0 })
                      : setNewRegister({ ...newRegister, b: e.target.value ? parseFloat(e.target.value) : 0 })
                    }
                  />
                </div>
              </div>
              
              {editingRegister 
                ? (editingRegister.type === 'ascii' || editingRegister.type === 'ascii8') 
                : (newRegister.type === 'ascii' || newRegister.type === 'ascii8') ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <Label className="text-xs">ASCII无效值</Label>
                    <Input
                      placeholder="无效值 (如: INVALID)"
                      title="当ASCII数据无效时显示的值"
                      value={editingRegister ? editingRegister.asciiInvalid : newRegister.asciiInvalid}
                      onChange={(e) => editingRegister 
                        ? setEditingRegister({ ...editingRegister, asciiInvalid: e.target.value })
                        : setNewRegister({ ...newRegister, asciiInvalid: e.target.value })
                      }
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">提示</Label>
                    <Input
                      placeholder="提示信息"
                      title="寄存器的提示信息"
                      value={editingRegister ? editingRegister.hint : newRegister.hint}
                      onChange={(e) => editingRegister 
                        ? setEditingRegister({ ...editingRegister, hint: e.target.value })
                        : setNewRegister({ ...newRegister, hint: e.target.value })
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
                    value={editingRegister ? editingRegister.hint : newRegister.hint}
                    onChange={(e) => editingRegister 
                      ? setEditingRegister({ ...editingRegister, hint: e.target.value })
                      : setNewRegister({ ...newRegister, hint: e.target.value })
                    }
                  />
                </div>
              )}
              
              <div className="text-xs text-gray-500 bg-blue-50 p-2 rounded">
                <strong>类型说明:</strong> {getTypeExample(editingRegister ? editingRegister.type : newRegister.type)}
              </div>
              
              <div className="text-xs text-gray-500 bg-green-50 p-2 rounded">
                <strong>线性变换公式:</strong> 实际值 = A × 寄存器值 + B<br/>
                <strong>寄存器类型:</strong> {editingRegister ? editingRegister.type : newRegister.type}
              </div>
              
              <div className="flex justify-end space-x-2 pt-2">
                <Button variant="outline" size="sm" onClick={() => {
                  setIsAddingRegister(false);
                  setEditingRegister(null);
                }}>
                  取消
                </Button>
                <Button size="sm" onClick={editingRegister ? updateRegister : addRegister} disabled={!editingRegister && !newRegister.name}>
                  {editingRegister ? '更新' : '添加'}
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
                  <TableHead>变量名称</TableHead>
                  <TableHead>实际值范围</TableHead>
                  <TableHead>线性变换</TableHead>
                  {!isIoTab && <TableHead>逻辑类型</TableHead>}
                  {!isIoTab && <TableHead>绑定输入点位</TableHead>}
                  <TableHead>提示</TableHead>
                  <TableHead>操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {registers.map((register) => (
                  <TableRow key={register.id}>
                    <TableCell>{register.slaveId}</TableCell>
                    <TableCell>{register.address}</TableCell>
                    <TableCell>
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                        {register.type}
                      </span>
                    </TableCell>
                    <TableCell className="font-medium">{register.name}</TableCell>
                    <TableCell>
                      {register.reverseByteOrder ? '反转' : '正常'}
                    </TableCell>
                    <TableCell className="text-xs">{register.variableName || '-'}</TableCell>
                    <TableCell className="text-xs">
                      {register.min !== undefined && register.max !== undefined ? (
                        <div>实际值: {register.min} - {register.max}</div>
                      ) : (
                        <div>未设置范围</div>
                      )}
                    </TableCell>
                    <TableCell className="text-xs">
                      {getLinearFormula(register.a || 1, register.b || 0)}
                    </TableCell>
                    {!isIoTab && (
                      <TableCell className="text-xs">
                        {getLogicTypeLabel(register.logicType)}
                      </TableCell>
                    )}
                    {!isIoTab && (
                      <TableCell className="text-xs">
                        {register.logicType === 'BIND_INPUT' ? 
                          `${register.boundInputProtocol || 'MODBUS TCP 客户端'} - ${register.boundInputPoint || 'voltage'}` : 
                          '-'}
                      </TableCell>
                    )}
                    <TableCell className="text-xs">{register.hint || '-'}</TableCell>
                    <TableCell className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => startEditingRegister(register)}
                        title="编辑寄存器"
                      >
                        <Pencil className="h-4 w-4 text-blue-500" />
                      </Button>
                      {!isIoTab ? (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openConfigDialog(register)}
                          title="配置逻辑"
                        >
                          <Settings2 className="h-4 w-4 text-purple-500" />
                        </Button>
                      ) : (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openIoBindingDialog(register)}
                          title="绑定IO点位"
                        >
                          <Settings2 className="h-4 w-4 text-green-500" />
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteRegister(register.id)}
                        title="删除寄存器"
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
              暂无{isIoTab ? 'IO' : '输出'}点位配置
            </div>
          )}
        </CardContent>
      </Card>

      {/* 配置对话框（仅在输出点位Tab显示） */}
      {!isIoTab && (
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
                    boundInputProtocol: value === 'BIND_INPUT' ? (configForm.boundInputProtocol || 'MODBUS TCP 客户端') : undefined,
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
      )}

      {/* IO点位绑定对话框（仅在IO点位Tab显示） */}
      {isIoTab && (
        <Dialog open={ioBindingDialogOpen} onOpenChange={setIoBindingDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>绑定IO点位</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <Label>EMS IO类型设备 *</Label>
                <Select
                  value={ioBindingForm.emsIoDevice}
                  onValueChange={(value) => setIoBindingForm({ ...ioBindingForm, emsIoDevice: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="EMS IO">EMS IO</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label>点位类型 *</Label>
                <Select
                  value={ioBindingForm.pointType}
                  onValueChange={(value) => setIoBindingForm({ ...ioBindingForm, pointType: value as 'DI' | 'DO' })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="DI">DI</SelectItem>
                    <SelectItem value="DO">DO</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label>点位 *</Label>
                <Select
                  value={ioBindingForm.point}
                  onValueChange={(value) => setIoBindingForm({ ...ioBindingForm, point: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="!water">!water</SelectItem>
                    <SelectItem value="!door">!door</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIoBindingDialogOpen(false)}>取消</Button>
              <Button onClick={saveIoBinding}>保存绑定</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default ModbusTcpOutputPointForm;