"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

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

// IEC104 output point interface
interface Iec104OutputPoint {
  id: string;
  address: number;
  type: 'single' | 'double' | 'step' | 'setpoint';
  name: string;
  dataType: 'BOOLEAN' | 'INT32' | 'FLOAT32';
  controlType: 'DIRECT' | 'SELECT_EXECUTE';
  operationLevel: 'OPERATOR' | 'ENGINEER' | 'ADMIN';
  min?: number;
  max?: number;
  defaultValue?: string;
  description?: string;
  selectTimeout?: number;
  executeTimeout?: number;
}

// IEC61850 output point interface
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

// Import protocol-specific output point forms
import ModbusTcpOutputPointForm from './output-points/ModbusTcpOutputPointForm';
import ModbusRtuOutputPointForm from './output-points/ModbusRtuOutputPointForm';
import Iec104OutputPointForm from './output-points/Iec104OutputPointForm';
import Iec61850OutputPointForm from './output-points/Iec61850OutputPointForm';

const OutputPointConfig = () => {
  const [nodes, setNodes] = useState<CommunicationNode[]>([]);
  const [selectedNode, setSelectedNode] = useState<CommunicationNode | null>(null);
  
  // MODBUS TCP Server output points - using only registers (no scan entries for server)
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

  // IEC104 Server output points
  const [iec104Points, setIec104Points] = useState<Iec104OutputPoint[]>([
    {
      id: '1',
      address: 1001,
      type: 'single',
      name: '断路器控制',
      dataType: 'BOOLEAN',
      controlType: 'SELECT_EXECUTE',
      operationLevel: 'OPERATOR',
      defaultValue: 'false',
      description: '断路器分合闸控制',
      selectTimeout: 10000,
      executeTimeout: 15000
    },
    {
      id: '2',
      address: 2001,
      type: 'setpoint',
      name: '电压设定',
      dataType: 'FLOAT32',
      controlType: 'SELECT_EXECUTE',
      operationLevel: 'ENGINEER',
      min: 0,
      max: 400,
      defaultValue: '220.0',
      description: '系统电压设定值',
      selectTimeout: 10000,
      executeTimeout: 15000
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
      sboTimeout: 10000
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
      sboTimeout: 10000
    }
  ]);

  // Get nodes from parent component or global state
  useEffect(() => {
    // In real application, this should come from global state or API
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

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">输出点位配置</h3>
      </div>

      {/* Device list horizontally */}
      <Card>
        <CardHeader>
          <CardTitle>服务端设备列表</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3 overflow-x-auto pb-2">
            {nodes.map(node => (
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
        </CardContent>
      </Card>

      {/* Point table takes bottom space */}
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
              {selectedNode.protocolType === 'MODBUS_TCP_SERVER' && (
                <ModbusTcpOutputPointForm
                  registers={modbusTcpRegisters}
                  onRegistersChange={setModbusTcpRegisters}
                />
              )}
              
              {selectedNode.protocolType === 'MODBUS_RTU_SERVER' && (
                <ModbusRtuOutputPointForm
                  registers={modbusRtuRegisters}
                  onRegistersChange={setModbusRtuRegisters}
                />
              )}
              
              {selectedNode.protocolType === 'IEC104_SERVER' && (
                <Iec104OutputPointForm
                  points={iec104Points}
                  onPointsChange={setIec104Points}
                />
              )}
              
              {selectedNode.protocolType === 'IEC61850_SERVER' && (
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