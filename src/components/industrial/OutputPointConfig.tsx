"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Search } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';

// Updated ProtocolType definition to include MODBUS Server
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
  | 'IEC61850_CLIENT';

interface CommunicationNode {
  id: string;
  name: string;
  protocolType: ProtocolType;
  description?: string;
}

// Updated MODBUS output point interfaces to match input point structure
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

// MODBUS Control Point interface (for control point tab)
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
  variableName?: string;
}

// IEC104 output point interface - simplified to match input structure
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
}

// IEC104 Control Point interface
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
  logicType?: 'BIND_INPUT' | 'SCRIPT_ONLY';
  boundInputProtocol?: string;
  boundInputPoint?: string;
  variableName?: string;
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
    'IEC61850_CLIENT': 'IEC61850 客户端'
  };
  return displayNames[protocol];
};

// Get protocol group for filtering
const getProtocolGroup = (protocol: ProtocolType): string => {
  if (protocol.startsWith('MODBUS')) return 'MODBUS';
  if (protocol.startsWith('DLT645')) return 'DLT645';
  if (protocol.startsWith('IEC104')) return 'IEC104';
  if (protocol.startsWith('IEC61850')) return 'IEC61850';
  return 'OTHER';
};

// Import protocol-specific output point forms
import ModbusTcpOutputPointForm from './output-points/ModbusTcpOutputPointForm';
import ModbusRtuOutputPointForm from './output-points/ModbusRtuOutputPointForm';
import Iec104OutputPointForm from './output-points/Iec104OutputPointForm';
import Iec61850OutputPointForm from './output-points/Iec61850OutputPointForm';
// Import control point forms
import ModbusTcpControlPointForm from './output-points/ModbusTcpControlPointForm';
import ModbusRtuControlPointForm from './output-points/ModbusRtuControlPointForm';
import Iec104ControlPointForm from './output-points/Iec104ControlPointForm';

const OutputPointConfig = () => {
  const [nodes, setNodes] = useState<CommunicationNode[]>([]);
  const [selectedNode, setSelectedNode] = useState<CommunicationNode | null>(null);
  const [filterProtocol, setFilterProtocol] = useState<string>('ALL');
  const [filterName, setFilterName] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'output' | 'control' | 'io'>('output');

  // MODBUS TCP Server output points
  const [modbusTcpRegisters, setModbusTcpRegisters] = useState<ModbusRegister[]>([
    { 
      id: '1', 
      slaveId: 1, 
      address: 0, 
      type: 'uint16', 
      name: '电机启停', 
      reverseByteOrder: false, 
      comment: '控制电机启停的线圈输出',
      min: 0,
      max: 1,
      a: 1,
      b: 0,
      hint: '0=停止, 1=启动'
    },
    { 
      id: '2', 
      slaveId: 1, 
      address: 10, 
      type: 'uint16', 
      name: '频率设定', 
      reverseByteOrder: false, 
      comment: '变频器频率设定值',
      min: 0,
      max: 50,
      a: 1,
      b: 0,
      hint: '频率范围0-50Hz'
    }
  ]);

  // MODBUS TCP Server control points
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
    }
  ]);

  // MODBUS RTU Server output points
  const [modbusRtuRegisters, setModbusRtuRegisters] = useState<ModbusRegister[]>([
    { 
      id: '1', 
      slaveId: 1, 
      address: 0, 
      type: 'uint16', 
      name: '报警复位', 
      reverseByteOrder: false, 
      comment: '复位报警状态',
      min: 0,
      max: 1,
      a: 1,
      b: 0,
      hint: '0=正常, 1=复位'
    }
  ]);

  // MODBUS RTU Server control points
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
    }
  ]);

  // IEC104 Server output points
  const [iec104Points, setIec104Points] = useState<Iec104OutputPoint[]>([
    {
      id: '1',
      address: '5001',
      name: '断路器控制',
      dataType: '单点遥信',
      min: 0,
      max: 1,
      multiplier: 1,
      offset: 0,
      description: '断路器分合闸控制'
    },
    {
      id: '2',
      address: '6001',
      name: '电压设定',
      dataType: '测量值，标度化值',
      min: 0,
      max: 400,
      multiplier: 1,
      offset: 0,
      description: '系统电压设定值'
    }
  ]);

  // IEC104 Server control points
  const [iec104ControlPoints, setIec104ControlPoints] = useState<Iec104ControlPoint[]>([
    {
      id: 'iec104-control-1',
      address: '5001',
      name: '遥控开关1',
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
      name: '设定值1',
      dataType: '测量值，标度化值',
      min: 0,
      max: 100,
      multiplier: 1,
      offset: 0,
      description: '设定值1'
    }
  ]);

  // IEC61850 Server output points
  const [iec61850Points, setIec61850Points] = useState<Iec61850OutputPoint[]>([
    {
      id: '1',
      address: 'LD1/LLN0.CSWI1.Pos',
      type: 'boolean',
      name: '开关位置',
      dataType: 'BOOLEAN',
      controlType: 'SELECT_BEFORE_OPERATE',
      operationLevel: 'OPERATOR',
      defaultValue: 'false',
      description: '开关分合闸控制',
      sboTimeout: 10000,
      variableName: 'switch_pos'
    },
    {
      id: '2',
      address: 'LD1/LLN0.MV.Amp.setMag.f',
      type: 'float32',
      name: '电流设定',
      dataType: 'FLOAT32',
      controlType: 'SELECT_BEFORE_OPERATE',
      operationLevel: 'ENGINEER',
      min: 0,
      max: 1000,
      defaultValue: '500.0',
      description: '电流设定值',
      sboTimeout: 10000,
      variableName: 'current_set'
    }
  ]);

  // Get nodes from parent component or global state
  useEffect(() => {
    const defaultNodes: CommunicationNode[] = [
      {
        id: 'modbus-tcp-server-1',
        name: 'MODBUS TCP 服务端',
        protocolType: 'MODBUS_TCP_SERVER',
        description: 'MODBUS TCP 服务端'
      },
      {
        id: 'modbus-rtu-server-1',
        name: 'MODBUS RTU 服务端',
        protocolType: 'MODBUS_RTU_SERVER',
        description: 'MODBUS RTU 服务端'
      },
      {
        id: 'iec104-server-1',
        name: 'IEC104 服务端',
        protocolType: 'IEC104_SERVER',
        description: '数据采集服务端'
      },
      {
        id: 'iec61850-server-1',
        name: 'IEC61850 服务端',
        protocolType: 'IEC61850_SERVER',
        description: '变电站IED服务端'
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

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">输出点位配置</h3>
      </div>

      {/* Combined filter and device list */}
      <Card>
        <CardHeader>
          <CardTitle>服务端设备列表</CardTitle>
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

      {/* Point configuration with output/control tabs */}
      <Card>
        <CardHeader>
          <CardTitle>
            {selectedNode ? `${selectedNode.name} - ${getProtocolDisplayName(selectedNode.protocolType)}` : '请选择服务端设备'}
          </CardTitle>
          {selectedNode && selectedNode.description && (
            <p className="text-sm text-gray-500 mt-2">{selectedNode.description}</p>
          )}
        </CardHeader>
        <CardContent>
          {selectedNode && (
            <>
              {/* MODBUS TCP Server: show output, control, and IO tabs */}
              {selectedNode.protocolType === 'MODBUS_TCP_SERVER' && (
                <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'output' | 'control' | 'io')}>
                  <TabsList>
                    <TabsTrigger value="output">输出点位</TabsTrigger>
                    <TabsTrigger value="control">控制点位</TabsTrigger>
                    <TabsTrigger value="io">IO点位</TabsTrigger>
                  </TabsList>

                  <TabsContent value="output">
                    <ModbusTcpOutputPointForm
                      registers={modbusTcpRegisters}
                      onRegistersChange={setModbusTcpRegisters}
                      isIoTab={false}
                    />
                  </TabsContent>

                  <TabsContent value="control">
                    <ModbusTcpControlPointForm
                      points={modbusTcpControlPoints}
                      onPointsChange={setModbusTcpControlPoints}
                    />
                  </TabsContent>

                  <TabsContent value="io">
                    <ModbusTcpOutputPointForm
                      registers={modbusTcpRegisters}
                      onRegistersChange={setModbusTcpRegisters}
                      isIoTab={true}
                    />
                  </TabsContent>
                </Tabs>
              )}
              
              {/* MODBUS RTU Server: show output and control tabs */}
              {selectedNode.protocolType === 'MODBUS_RTU_SERVER' && (
                <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'output' | 'control')}>
                  <TabsList>
                    <TabsTrigger value="output">输出点位</TabsTrigger>
                    <TabsTrigger value="control">控制点位</TabsTrigger>
                  </TabsList>

                  <TabsContent value="output">
                    <ModbusRtuOutputPointForm
                      registers={modbusRtuRegisters}
                      onRegistersChange={setModbusRtuRegisters}
                    />
                  </TabsContent>

                  <TabsContent value="control">
                    <ModbusRtuControlPointForm
                      points={modbusRtuControlPoints}
                      onPointsChange={setModbusRtuControlPoints}
                    />
                  </TabsContent>
                </Tabs>
              )}
              
              {/* IEC104 Server: show output, control, and IO tabs */}
              {selectedNode.protocolType === 'IEC104_SERVER' && (
                <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'output' | 'control' | 'io')}>
                  <TabsList>
                    <TabsTrigger value="output">输出点位</TabsTrigger>
                    <TabsTrigger value="control">控制点位</TabsTrigger>
                    <TabsTrigger value="io">IO点位</TabsTrigger>
                  </TabsList>

                  <TabsContent value="output">
                    <Iec104OutputPointForm
                      points={iec104Points}
                      onPointsChange={setIec104Points}
                      isIoTab={false}
                    />
                  </TabsContent>

                  <TabsContent value="control">
                    <Iec104ControlPointForm
                      points={iec104ControlPoints}
                      onPointsChange={setIec104ControlPoints}
                    />
                  </TabsContent>

                  <TabsContent value="io">
                    <Iec104OutputPointForm
                      points={iec104Points}
                      onPointsChange={setIec104Points}
                      isIoTab={true}
                    />
                  </TabsContent>
                </Tabs>
              )}
              
              {/* Other protocols: only show output form */}
              {(selectedNode.protocolType !== 'MODBUS_TCP_SERVER' && 
                selectedNode.protocolType !== 'MODBUS_RTU_SERVER' &&
                selectedNode.protocolType !== 'IEC104_SERVER') && (
                <Iec61850OutputPointForm
                  points={iec61850Points}
                  onPointsChange={setIec61850Points}
                />
              )}
            </>
          )}
          
          {!selectedNode && (
            <div className="text-center py-8 text-gray-500">
              请从上方服务端设备列表中选择一个设备进行配置
            </div>
          )}
        </CardContent>
      </Card>

      {nodes.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          暂无服务端节点，请先在节点配置中添加服务端节点
        </div>
      )}
    </div>
  );
};

export default OutputPointConfig;