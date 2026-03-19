"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Search } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';

// Updated ProtocolType definition to include MODBUS Server and EMS IO
type ProtocolType = 
  | 'MODBUS_TCP' 
  | 'MODBUS_RTU' 
  | 'MODBUS_TCP_SERVER'
  | 'MODBUS_RTU_SERVER'
  | 'DLT645_RTU' 
  | 'DLT645_TCP' 
  | 'IEC104_SERVER' 
  | 'IEC104_CLIENT' 
  | 'IEC61850_SERVER' 
  | 'IEC61850_CLIENT'
  | 'EMS_IO';

interface CommunicationNode {
  id: string;
  name: string;
  protocolType: ProtocolType;
  description?: string;
}

interface ModbusScanEntry {
  id: string;
  slaveId: number;
  start: number;
  count: number;
  type: number;
  interval: number;
}

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
}

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
  logicType?: 'BIND_INPUT' | 'SCRIPT_ONLY';
  boundInputProtocol?: string;
  boundInputPoint?: string;
}

interface Iec104InputPoint {
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

// EMS IO Point interfaces
interface EmsIoDiPoint {
  id: string;
  name: string;
  address: string;
  description?: string;
  scanRate?: number;
}

interface EmsIoDoPoint {
  id: string;
  name: string;
  address: string;
  description?: string;
  defaultValue?: boolean;
}

// Protocol display name mapping
const getProtocolDisplayName = (protocol: ProtocolType): string => {
  const displayNames: Record<ProtocolType, string> = {
    'MODBUS_TCP': 'MODBUS TCP 客户端',
    'MODBUS_RTU': 'MODBUS RTU 客户端',
    'MODBUS_TCP_SERVER': 'MODBUS TCP 服务端',
    'MODBUS_RTU_SERVER': 'MODBUS RTU 服务端',
    'DLT645_RTU': 'DLT645 RTU',
    'DLT645_TCP': 'DLT645 TCP',
    'IEC104_SERVER': 'IEC104 服务端',
    'IEC104_CLIENT': 'IEC104 客户端',
    'IEC61850_SERVER': 'IEC61850 服务端',
    'IEC61850_CLIENT': 'IEC61850 客户端',
    'EMS_IO': 'EMS IO'
  };
  return displayNames[protocol];
};

// Get protocol group for filtering
const getProtocolGroup = (protocol: ProtocolType): string => {
  if (protocol.startsWith('MODBUS')) return 'MODBUS';
  if (protocol.startsWith('DLT645')) return 'DLT645';
  if (protocol.startsWith('IEC104')) return 'IEC104';
  if (protocol.startsWith('IEC61850')) return 'IEC61850';
  if (protocol === 'EMS_IO') return 'EMS_IO';
  return 'OTHER';
};

// Import unified MODBUS form component
import ModbusInputPointForm from './input-points/ModbusInputPointForm';
import Dlt645RtuInputPointForm from './input-points/Dlt645RtuInputPointForm';
import Dlt645TcpInputPointForm from './input-points/Dlt645TcpInputPointForm';
import Iec104InputPointForm from './input-points/Iec104InputPointForm';
import Iec61850InputPointForm from './input-points/Iec61850InputPointForm';
// Import control point forms
import ModbusTcpControlPointForm from './input-points/ModbusTcpControlPointForm';
import ModbusRtuControlPointForm from './input-points/ModbusRtuControlPointForm';
import Iec104ControlPointForm from './input-points/Iec104ControlPointForm';

// EMS IO DI Point Form Component
const EmsIoDiPointForm = ({ points, onPointsChange }: { points: EmsIoDiPoint[]; onPointsChange: (points: EmsIoDiPoint[]) => void }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [editingPoint, setEditingPoint] = useState<EmsIoDiPoint | null>(null);

  const updatePoint = () => {
    if (editingPoint) {
      onPointsChange(points.map(point => 
        point.id === editingPoint.id ? editingPoint : point
      ));
      setEditingPoint(null);
    }
  };

  const startEditingPoint = (point: EmsIoDiPoint) => {
    setEditingPoint({ ...point });
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <CardTitle>EMS IO DI点位配置</CardTitle>
      </div>

      <Card>
        <CardContent>
          {editingPoint && (
            <div className="space-y-4 mb-4 p-3 bg-gray-50 rounded">
              <div className="space-y-1">
                <Label className="text-xs">备注</Label>
                <Input
                  placeholder="点位备注"
                  value={editingPoint.description || ''}
                  onChange={(e) => setEditingPoint({ ...editingPoint, description: e.target.value })}
                />
              </div>
              
              <div className="flex justify-end space-x-2 pt-2">
                <Button variant="outline" size="sm" onClick={() => {
                  setEditingPoint(null);
                }}>
                  取消
                </Button>
                <Button size="sm" onClick={updatePoint}>
                  保存
                </Button>
              </div>
            </div>
          )}

          <div className="border rounded-lg overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2 px-3 font-medium">地址</th>
                  <th className="text-left py-2 px-3 font-medium">路径</th>
                  <th className="text-left py-2 px-3 font-medium">初始值</th>
                  <th className="text-left py-2 px-3 font-medium">备注</th>
                  <th className="w-32 py-2 px-3 font-medium">操作</th>
                </tr>
              </thead>
              <tbody>
                {points.map((point) => (
                  <tr key={point.id} className="border-b hover:bg-gray-50">
                    <td className="py-2 px-3">{point.address}</td>
                    <td className="py-2 px-3">{point.name}</td>
                    <td className="py-2 px-3">-</td>
                    <td className="py-2 px-3 text-sm">{point.description || '-'}</td>
                    <td className="py-2 px-3">
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => startEditingPoint(point)}
                          title="编辑"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4 text-blue-500">
                            <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"></path>
                          </svg>
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {points.length === 0 && (
            <div className="text-center py-4 text-gray-500">
              暂无DI点位
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

// EMS IO DO Point Form Component
const EmsIoDoPointForm = ({ points, onPointsChange }: { points: EmsIoDoPoint[]; onPointsChange: (points: EmsIoDoPoint[]) => void }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [editingPoint, setEditingPoint] = useState<EmsIoDoPoint | null>(null);

  const updatePoint = () => {
    if (editingPoint) {
      onPointsChange(points.map(point => 
        point.id === editingPoint.id ? editingPoint : point
      ));
      setEditingPoint(null);
    }
  };

  const startEditingPoint = (point: EmsIoDoPoint) => {
    setEditingPoint({ ...point });
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <CardTitle>EMS IO DO点位配置</CardTitle>
      </div>

      <Card>
        <CardContent>
          {editingPoint && (
            <div className="space-y-4 mb-4 p-3 bg-gray-50 rounded">
              <div className="space-y-1">
                <Label className="text-xs">备注</Label>
                <Input
                  placeholder="点位备注"
                  value={editingPoint.description || ''}
                  onChange={(e) => setEditingPoint({ ...editingPoint, description: e.target.value })}
                />
              </div>
              
              <div className="flex justify-end space-x-2 pt-2">
                <Button variant="outline" size="sm" onClick={() => {
                  setEditingPoint(null);
                }}>
                  取消
                </Button>
                <Button size="sm" onClick={updatePoint}>
                  保存
                </Button>
              </div>
            </div>
          )}

          <div className="border rounded-lg overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2 px-3 font-medium">地址</th>
                  <th className="text-left py-2 px-3 font-medium">路径</th>
                  <th className="text-left py-2 px-3 font-medium">初始值</th>
                  <th className="text-left py-2 px-3 font-medium">备注</th>
                  <th className="w-32 py-2 px-3 font-medium">操作</th>
                </tr>
              </thead>
              <tbody>
                {points.map((point) => (
                  <tr key={point.id} className="border-b hover:bg-gray-50">
                    <td className="py-2 px-3">{point.address}</td>
                    <td className="py-2 px-3">{point.name}</td>
                    <td className="py-2 px-3">{point.defaultValue ? 'True' : 'False'}</td>
                    <td className="py-2 px-3 text-sm">{point.description || '-'}</td>
                    <td className="py-2 px-3">
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => startEditingPoint(point)}
                          title="编辑"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4 text-blue-500">
                            <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"></path>
                          </svg>
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {points.length === 0 && (
            <div className="text-center py-4 text-gray-500">
              暂无DO点位
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

const InputPointConfig = () => {
  const [nodes, setNodes] = useState<CommunicationNode[]>([]);
  const [selectedNode, setSelectedNode] = useState<CommunicationNode | null>(null);
  const [filterProtocol, setFilterProtocol] = useState<string>('ALL');
  const [filterName, setFilterName] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'input' | 'control' | 'di' | 'do'>('input');
  
  // MODBUS input config state
  const [modbusScanEntries, setModbusScanEntries] = useState<ModbusScanEntry[]>([
    { id: '1', slaveId: 1, start: 0, count: 27, type: 1, interval: 1000 },
    { id: '2', slaveId: 1, start: 101, count: 1, type: 1, interval: 1000 },
    { id: '3', slaveId: 1, start: 14000, count: 18, type: 1, interval: 1000 },
    { id: '4', slaveId: 1, start: 0, count: 62, type: 3, interval: 1000 }
  ]);
  
  const [modbusRegisters, setModbusRegisters] = useState<ModbusRegister[]>([
    { 
      id: '1', 
      slaveId: 1, 
      address: 0, 
      type: 'uint16', 
      name: 'voltage', 
      reverseByteOrder: false, 
      comment: '',
      min: 0,
      max: 500,
      a: 0.1,
      b: 0,
      hint: '电压范围0-500V'
    },
    { 
      id: '2', 
      slaveId: 1, 
      address: 1, 
      type: 'uint16', 
      name: 'current', 
      reverseByteOrder: false, 
      comment: '',
      min: 0,
      max: 100,
      a: 0.01,
      b: 0,
      hint: '电流范围0-100A'
    },
    { 
      id: '3', 
      slaveId: 1, 
      address: 2, 
      type: 'uint16', 
      name: 'soc', 
      reverseByteOrder: false, 
      comment: '0-100',
      min: 0,
      max: 100,
      a: 1,
      b: 0,
      hint: '电池SOC百分比'
    },
    { 
      id: '4', 
      slaveId: 1, 
      address: 10, 
      type: 'ascii', 
      name: 'device_id', 
      reverseByteOrder: false, 
      comment: '设备ID',
      asciiInvalid: 'INVALID',
      hint: '8位ASCII设备标识'
    }
  ]);

  // MODBUS TCP control points state with example data
  const [modbusTcpControlPoints, setModbusTcpControlPoints] = useState<ModbusControlPoint[]>([
    {
      id: 'tcp-control-1',
      slaveId: 1,
      address: 0,
      type: 'uint16',
      name: 'motor_start',
      reverseByteOrder: false,
      comment: '电机启动信号',
      min: 0,
      max: 1,
      a: 1,
      b: 0,
      hint: '0停止，1启动'
    },
    {
      id: 'tcp-control-2',
      slaveId: 1,
      address: 1,
      type: 'uint16',
      name: 'motor_speed',
      reverseByteOrder: false,
      comment: '电机速度设定',
      min: 0,
      max: 3000,
      a: 1,
      b: 0,
      hint: '速度范围0-3000RPM'
    },
    {
      id: 'tcp-control-3',
      slaveId: 1,
      address: 100,
      type: 'uint16',
      name: 'alarm_reset',
      reverseByteOrder: false,
      comment: '报警复位',
      min: 0,
      max: 1,
      a: 1,
      b: 0,
      hint: '0无效，1有效复位'
    },
    {
      id: 'tcp-control-4',
      slaveId: 1,
      address: 200,
      type: 'ascii',
      name: 'command_string',
      reverseByteOrder: false,
      comment: '命令字符串',
      asciiInvalid: 'INVALID',
      hint: 'ASCII命令字符串'
    }
  ]);

  // MODBUS RTU control points state with example data
  const [modbusRtuControlPoints, setModbusRtuControlPoints] = useState<ModbusControlPoint[]>([
    {
      id: 'rtu-control-1',
      slaveId: 1,
      address: 0,
      type: 'uint16',
      name: 'valve_open',
      reverseByteOrder: false,
      comment: '阀门开启',
      min: 0,
      max: 1,
      a: 1,
      b: 0,
      hint: '0关闭，1开启'
    },
    {
      id: 'rtu-control-2',
      slaveId: 1,
      address: 1,
      type: 'int16',
      name: 'temperature_set',
      reverseByteOrder: false,
      comment: '温度设定值',
      min: -20,
      max: 50,
      a: 1,
      b: 0,
      hint: '温度范围-20到50度'
    },
    {
      id: 'rtu-control-3',
      slaveId: 1,
      address: 10,
      type: 'ascii',
      name: 'device_status',
      reverseByteOrder: false,
      comment: '设备状态字符串',
      asciiInvalid: 'OFF',
      hint: '设备状态：ON/OFF'
    }
  ]);
  
  // IEC104 input config state
  const [iec104Points, setIec104Points] = useState<Iec104InputPoint[]>([
    {
      id: '1',
      address: '1001',
      dataType: '单点遥信',
      min: undefined,
      max: undefined,
      multiplier: 1,
      offset: 0,
      description: '单点信息'
    },
    {
      id: '2',
      address: '2001',
      dataType: '测量值，短浮点数',
      min: undefined,
      max: undefined,
      multiplier: 1,
      offset: 0,
      description: '测量值-短浮点数'
    }
  ]);

  // IEC104 control points state with example data
  const [iec104ControlPoints, setIec104ControlPoints] = useState<Iec104ControlPoint[]>([
    {
      id: 'iec104-control-1',
      address: '5001',
      dataType: '单点遥信',
      min: 0,
      max: 1,
      multiplier: 1,
      offset: 0,
      description: '遥控开关1'
    },
    {
      id: 'iec104-control-2',
      address: '6001',
      dataType: '测量值，标度化值',
      min: 0,
      max: 100,
      multiplier: 1,
      offset: 0,
      description: '设定值1'
    },
    {
      id: 'iec104-control-3',
      address: '6002',
      dataType: '累计量',
      min: undefined,
      max: undefined,
      multiplier: 1,
      offset: 0,
      description: '累计电量'
    }
  ]);
  
  // Other protocol config states
  const [dlt645RtuConfig, setDlt645RtuConfig] = useState({ address: '000000000001', dataType: 'ENERGY', scanRate: 60000 });
  const [dlt645TcpConfig, setDlt645TcpConfig] = useState({ address: '000000000002', dataType: 'POWER', scanRate: 10000 });
  const [iec61850Config, setIec61850Config] = useState({ address: 'LD1/LLN0.MX.Vol', dataType: 'FLOAT32', scanRate: 1000 });

  // EMS IO config states - Updated with the requested values
  const [emsIoDiPoints, setEmsIoDiPoints] = useState<EmsIoDiPoint[]>([
    {
      id: 'di-1',
      name: 'PG7',
      address: '1',
      description: '!water',
      scanRate: 100
    },
    {
      id: 'di-2',
      name: 'PD4',
      address: '2',
      description: '!door',
      scanRate: 500
    }
  ]);

  const [emsIoDoPoints, setEmsIoDoPoints] = useState<EmsIoDoPoint[]>([
    {
      id: 'do-1',
      name: 'PG7',
      address: '1',
      description: '!water',
      defaultValue: false
    },
    {
      id: 'do-2',
      name: 'PD4',
      address: '2',
      description: '!door',
      defaultValue: true
    }
  ]);

  // Get nodes from parent component or global state
  useEffect(() => {
    const defaultNodes: CommunicationNode[] = [
      {
        id: 'modbus-tcp-1',
        name: 'MODBUS TCP 客户端',
        protocolType: 'MODBUS_TCP',
        description: '工厂温度传感器'
      },
      {
        id: 'modbus-rtu-1',
        name: 'MODBUS RTU 客户端',
        protocolType: 'MODBUS_RTU',
        description: '串口温湿度传感器'
      },
      {
        id: 'dlt645-rtu-1',
        name: 'DLT645 RTU 电表',
        protocolType: 'DLT645_RTU',
        description: '智能电表'
      },
      {
        id: 'dlt645-tcp-1',
        name: 'DLT645 TCP 电表',
        protocolType: 'DLT645_TCP',
        description: '网络电表'
      },
      {
        id: 'iec104-client-1',
        name: 'IEC104 客户端',
        protocolType: 'IEC104_CLIENT',
        description: '连接上级调度系统'
      },
      {
        id: 'iec61850-client-1',
        name: 'IEC61850 客户端',
        protocolType: 'IEC61850_CLIENT',
        description: '连接远程IED设备'
      },
      {
        id: 'ems-io-1',
        name: 'EMS IO',
        protocolType: 'EMS_IO',
        description: '能源管理系统IO点位'
      }
    ];
    setNodes(defaultNodes);
    if (defaultNodes.length > 0) {
      setSelectedNode(defaultNodes[0]);
    }
  }, []);

  // Filter nodes based on protocol and name
  const filteredNodes = nodes.filter(node => {
    const matchesProtocol = filterProtocol === 'ALL' || getProtocolGroup(node.protocolType) === filterProtocol;
    const matchesName = filterName === '' || node.name.toLowerCase().includes(filterName.toLowerCase());
    return matchesProtocol && matchesName;
  });

  // Determine active tab based on selected node
  useEffect(() => {
    if (selectedNode?.protocolType === 'EMS_IO') {
      // For EMS IO, default to DI tab if not already set to DI/DO
      if (activeTab !== 'di' && activeTab !== 'do') {
        setActiveTab('di');
      }
    } else {
      // For other protocols, default to input tab if not already set to input/control
      if (activeTab !== 'input' && activeTab !== 'control') {
        setActiveTab('input');
      }
    }
  }, [selectedNode, activeTab]);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">输入点位配置</h3>
      </div>

      {/* Combined filter and device list */}
      <Card>
        <CardHeader>
          <CardTitle>设备列表</CardTitle>
        </CardHeader>
        <CardContent>
          {/* Filter controls */}
          <div className="flex flex-wrap gap-4 mb-4 p-3 bg-gray-50 rounded-lg">
            <div className="flex-1 min-w-[150px]">
              <Label className="text-xs mb-1 block">协议类型</Label>
              <Select value={filterProtocol} onValueChange={setFilterProtocol}>
                <SelectTrigger className="text-sm">
                  <SelectValue placeholder="选择协议类型" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">全部协议</SelectItem>
                  <SelectItem value="MODBUS">MODBUS</SelectItem>
                  <SelectItem value="DLT645">DLT645</SelectItem>
                  <SelectItem value="IEC104">IEC104</SelectItem>
                  <SelectItem value="IEC61850">IEC61850</SelectItem>
                  <SelectItem value="EMS_IO">EMS IO</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex-1 min-w-[200px]">
              <Label className="text-xs mb-1 block">设备名称</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="输入设备名称搜索"
                  value={filterName}
                  onChange={(e) => setFilterName(e.target.value)}
                  className="pl-10 text-sm"
                />
              </div>
            </div>
          </div>
          
          {/* Device list horizontally */}
          <div className="flex flex-wrap gap-3 overflow-x-auto pb-2">
            {filteredNodes.map(node => (
              <div
                key={node.id}
                className={`px-4 py-2 rounded-lg cursor-pointer transition-colors whitespace-nowrap ${
                  selectedNode?.id === node.id
                    ? 'bg-blue-100 border border-blue-300'
                    : 'hover:bg-gray-100'
                }`}
                onClick={() => setSelectedNode(node)}
              >
                <div className="flex items-center gap-2">
                  <span className="font-medium text-sm">{node.name}</span>
                  <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                    {getProtocolDisplayName(node.protocolType)}
                  </span>
                </div>
              </div>
            ))}
          </div>
          {filteredNodes.length === 0 && (
            <div className="text-center py-4 text-gray-500">
              未找到匹配的设备
            </div>
          )}
        </CardContent>
      </Card>

      {/* Point configuration */}
      <Card>
        <CardContent>
          {selectedNode && (
            <>
              {/* EMS IO: show DI/DO tabs */}
              {selectedNode.protocolType === 'EMS_IO' && (
                <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'di' | 'do')}>
                  <TabsList>
                    <TabsTrigger value="di">DI点位</TabsTrigger>
                    <TabsTrigger value="do">DO点位</TabsTrigger>
                  </TabsList>

                  <TabsContent value="di">
                    <EmsIoDiPointForm
                      points={emsIoDiPoints}
                      onPointsChange={setEmsIoDiPoints}
                    />
                  </TabsContent>

                  <TabsContent value="do">
                    <EmsIoDoPointForm
                      points={emsIoDoPoints}
                      onPointsChange={setEmsIoDoPoints}
                    />
                  </TabsContent>
                </Tabs>
              )}
              
              {/* MODBUS TCP/RTU: show input and control tabs */}
              {(selectedNode.protocolType === 'MODBUS_TCP' || 
                selectedNode.protocolType === 'MODBUS_RTU') && (
                <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'input' | 'control')}>
                  <TabsList>
                    <TabsTrigger value="input">输入点位</TabsTrigger>
                    <TabsTrigger value="control">控制点位</TabsTrigger>
                  </TabsList>

                  <TabsContent value="input">
                    <ModbusInputPointForm
                      scanEntries={modbusScanEntries}
                      registers={modbusRegisters}
                      onScanEntriesChange={setModbusScanEntries}
                      onRegistersChange={setModbusRegisters}
                    />
                  </TabsContent>

                  <TabsContent value="control">
                    {selectedNode.protocolType === 'MODBUS_TCP' && (
                      <ModbusTcpControlPointForm
                        points={modbusTcpControlPoints}
                        onPointsChange={setModbusTcpControlPoints}
                      />
                    )}
                    {selectedNode.protocolType === 'MODBUS_RTU' && (
                      <ModbusRtuControlPointForm
                        points={modbusRtuControlPoints}
                        onPointsChange={setModbusRtuControlPoints}
                      />
                    )}
                  </TabsContent>
                </Tabs>
              )}
              
              {/* IEC104: show input and control tabs */}
              {selectedNode.protocolType === 'IEC104_CLIENT' && (
                <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'input' | 'control')}>
                  <TabsList>
                    <TabsTrigger value="input">输入点位</TabsTrigger>
                    <TabsTrigger value="control">控制点位</TabsTrigger>
                  </TabsList>

                  <TabsContent value="input">
                    <Iec104InputPointForm
                      points={iec104Points}
                      onPointsChange={setIec104Points}
                    />
                  </TabsContent>

                  <TabsContent value="control">
                    <Iec104ControlPointForm
                      points={iec104ControlPoints}
                      onPointsChange={setIec104ControlPoints}
                    />
                  </TabsContent>
                </Tabs>
              )}
              
              {/* Other protocols: only show input form */}
              {(selectedNode.protocolType !== 'MODBUS_TCP' && 
                selectedNode.protocolType !== 'MODBUS_RTU' &&
                selectedNode.protocolType !== 'IEC104_CLIENT' &&
                selectedNode.protocolType !== 'EMS_IO') && (
                <>
                  {selectedNode.protocolType === 'DLT645_RTU' && (
                    <Dlt645RtuInputPointForm
                      address={dlt645RtuConfig.address}
                      dataType={dlt645RtuConfig.dataType}
                      scanRate={dlt645RtuConfig.scanRate}
                      onAddressChange={(address) => setDlt645RtuConfig({ ...dlt645RtuConfig, address })}
                      onDataTypeChange={(dataType) => setDlt645RtuConfig({ ...dlt645RtuConfig, dataType })}
                      onScanRateChange={(scanRate) => setDlt645RtuConfig({ ...dlt645RtuConfig, scanRate })}
                    />
                  )}
                  {selectedNode.protocolType === 'DLT645_TCP' && (
                    <Dlt645TcpInputPointForm
                      address={dlt645TcpConfig.address}
                      dataType={dlt645TcpConfig.dataType}
                      scanRate={dlt645TcpConfig.scanRate}
                      onAddressChange={(address) => setDlt645TcpConfig({ ...dlt645TcpConfig, address })}
                      onDataTypeChange={(dataType) => setDlt645TcpConfig({ ...dlt645TcpConfig, dataType })}
                      onScanRateChange={(scanRate) => setDlt645TcpConfig({ ...dlt645TcpConfig, scanRate })}
                    />
                  )}
                  {selectedNode.protocolType === 'IEC61850_CLIENT' && (
                    <Iec61850InputPointForm
                      address={iec61850Config.address}
                      dataType={iec61850Config.dataType}
                      scanRate={iec61850Config.scanRate}
                      onAddressChange={(address) => setIec61850Config({ ...iec61850Config, address })}
                      onDataTypeChange={(dataType) => setIec61850Config({ ...iec61850Config, dataType })}
                      onScanRateChange={(scanRate) => setIec61850Config({ ...iec61850Config, scanRate })}
                    />
                  )}
                </>
              )}
            </>
          )}
          
          {!selectedNode && (
            <div className="text-center py-8 text-gray-500">
              请从上方设备列表中选择一个设备进行配置
            </div>
          )}
        </CardContent>
      </Card>

      {nodes.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          暂无通信节点，请先在节点配置中添加客户端节点
        </div>
      )}
    </div>
  );
};

export default InputPointConfig;