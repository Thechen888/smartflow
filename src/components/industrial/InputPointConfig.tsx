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

// Import unified MODBUS form component
import ModbusInputPointForm from './input-points/ModbusInputPointForm';
import Dlt645RtuInputPointForm from './input-points/Dlt645RtuInputPointForm';
import Dlt645TcpInputPointForm from './input-points/Dlt645TcpInputPointForm';
import Iec104InputPointForm from './input-points/Iec104InputPointForm';
import Iec61850InputPointForm from './input-points/Iec61850InputPointForm';

const InputPointConfig = () => {
  const [nodes, setNodes] = useState<CommunicationNode[]>([]);
  const [selectedNode, setSelectedNode] = useState<CommunicationNode | null>(null);
  
  // MODBUS unified config state
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

  // Other protocol config states
  const [dlt645RtuConfig, setDlt645RtuConfig] = useState({ address: '000000000001', dataType: 'ENERGY', scanRate: 60000 });
  const [dlt645TcpConfig, setDlt645TcpConfig] = useState({ address: '000000000002', dataType: 'POWER', scanRate: 10000 });
  const [iec104Config, setIec104Config] = useState({ address: '1001', dataType: 'M_SP_NA_1', scanRate: 500 });
  const [iec61850Config, setIec61850Config] = useState({ address: 'LD1/LLN0.MX.Vol', dataType: 'FLOAT32', scanRate: 1000 });

  // Get nodes from parent component or global state
  useEffect(() => {
    // In real application, this should come from global state or API
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
        <h3 className="text-lg font-medium">输入点位配置</h3>
      </div>

      {/* Device list horizontally */}
      <Card>
        <CardHeader>
          <CardTitle>设备列表</CardTitle>
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
            {selectedNode ? `${selectedNode.name} - ${getProtocolDisplayName(selectedNode.protocolType)}` : '请选择设备'}
          </CardTitle>
          {selectedNode && selectedNode.description && (
            <p className="text-sm text-gray-500 mt-2">{selectedNode.description}</p>
          )}
        </CardHeader>
        <CardContent>
          {selectedNode && (
            <>
              {/* MODBUS TCP/RTU Client use unified config */}
              {(selectedNode.protocolType === 'MODBUS_TCP' || 
                selectedNode.protocolType === 'MODBUS_RTU') && (
                <ModbusInputPointForm
                  scanEntries={modbusScanEntries}
                  registers={modbusRegisters}
                  onScanEntriesChange={setModbusScanEntries}
                  onRegistersChange={setModbusRegisters}
                />
              )}
              
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
              
              {selectedNode.protocolType === 'IEC104_CLIENT' && (
                <Iec104InputPointForm
                  address={iec104Config.address}
                  dataType={iec104Config.dataType}
                  scanRate={iec104Config.scanRate}
                  onAddressChange={(address) => setIec104Config({ ...iec104Config, address })}
                  onDataTypeChange={(dataType) => setIec104Config({ ...iec104Config, dataType })}
                  onScanRateChange={(scanRate) => setIec104Config({ ...iec104Config, scanRate })}
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