"use client";

import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';

// Import all node form components
import ModbusTcpNodeForm from './nodes/ModbusTcpNodeForm';
import ModbusRtuNodeForm from './nodes/ModbusRtuNodeForm';
import Dlt645RtuNodeForm from './nodes/Dlt645RtuNodeForm';
import Dlt645TcpNodeForm from './nodes/Dlt645TcpNodeForm';
import Iec104ServerNodeForm from './nodes/Iec104ServerNodeForm';
import Iec104ClientNodeForm from './nodes/Iec104ClientNodeForm';
import Iec61850ServerNodeForm from './nodes/Iec61850ServerNodeForm';
import Iec61850ClientNodeForm from './nodes/Iec61850ClientNodeForm';
import EmsIoNodeForm from './nodes/EmsIoNodeForm';

// Updated ProtocolType definition
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

interface BaseNode {
  id: string;
  name: string;
  protocolType: ProtocolType;
  description?: string;
}

// Updated config interfaces
interface ModbusTcpClientConfig {
  host: string;
  port: number;
  slaveId: number;
  timeout: number;
  retryCount: number;
  connectionMode: 'TCP' | 'TCP_RTU_OVER_TCP';
}

interface ModbusRtuClientConfig {
  serialPort: string;
  baudRate: number;
  dataBits: 7 | 8;
  stopBits: 1 | 2;
  parity: 'NONE' | 'EVEN' | 'ODD';
  slaveId: number;
  timeout: number;
  retryCount: number;
}

interface ModbusTcpServerConfig {
  bindAddress: string;
  port: number;
  maxConnections: number;
  timeout: number;
  connectionMode: 'TCP' | 'TCP_RTU_OVER_TCP';
}

interface ModbusRtuServerConfig {
  serialPort: string;
  baudRate: number;
  dataBits: 7 | 8;
  stopBits: 1 | 2;
  parity: 'NONE' | 'EVEN' | 'ODD';
  maxConnections: number;
  timeout: number;
}

interface Dlt645RtuConfig {
  serialPort: string;
  baudRate: number;
  dataBits: 7 | 8;
  stopBits: 1 | 2;
  parity: 'NONE' | 'EVEN' | 'ODD';
  address: string;
  password: string;
  timeout: number;
}

interface Dlt645TcpConfig {
  host: string;
  port: number;
  address: string;
  password: string;
  timeout: number;
  retryCount: number;
}

interface Iec104ServerConfig {
  bindAddress: string;
  port: number;
  maxConnections: number;
  commonAddress: number;
  kValue: number;
  wValue: number;
  t0Timeout: number;
  t1Timeout: number;
  t2Timeout: number;
  t3Timeout: number;
}

interface Iec104ClientConfig {
  host: string;
  port: number;
  commonAddress: number;
  kValue: number;
  wValue: number;
  t0Timeout: number;
  t1Timeout: number;
  t2Timeout: number;
  t3Timeout: number;
  reconnectInterval: number;
  autoReconnect: boolean;
}

interface Iec61850ServerConfig {
  bindAddress: string;
  mmsPort: number;
  goosePort: number;
  svPort: number;
  iedName: string;
  icdFile: string;
  maxConnections: number;
}

interface Iec61850ClientConfig {
  host: string;
  mmsPort: number;
  iedName: string;
  icdFile: string;
  reconnectInterval: number;
  autoReconnect: boolean;
}

// EMS IO Config interface
interface EmsIoConfig {
  diStartAddress: string;
  diCount: number;
  doStartAddress: string;
  doCount: number;
}

type CommunicationNode = BaseNode & (
  | { protocolType: 'MODBUS_TCP'; config: ModbusTcpClientConfig }
  | { protocolType: 'MODBUS_RTU'; config: ModbusRtuClientConfig }
  | { protocolType: 'MODBUS_TCP_SERVER'; config: ModbusTcpServerConfig }
  | { protocolType: 'MODBUS_RTU_SERVER'; config: ModbusRtuServerConfig }
  | { protocolType: 'DLT645_RTU'; config: Dlt645RtuConfig }
  | { protocolType: 'DLT645_TCP'; config: Dlt645TcpConfig }
  | { protocolType: 'IEC104_SERVER'; config: Iec104ServerConfig }
  | { protocolType: 'IEC104_CLIENT'; config: Iec104ClientConfig }
  | { protocolType: 'IEC61850_SERVER'; config: Iec61850ServerConfig }
  | { protocolType: 'IEC61850_CLIENT'; config: Iec61850ClientConfig }
  | { protocolType: 'EMS_IO'; config: EmsIoConfig }
);

interface NodeConfigDialogProps {
  node: CommunicationNode;
  isOpen: boolean;
  onClose: () => void;
  onSave: (node: CommunicationNode) => void;
  isEditMode: boolean;
}

const NodeConfigDialog: React.FC<NodeConfigDialogProps> = ({ 
  node, 
  isOpen, 
  onClose, 
  onSave, 
  isEditMode 
}) => {
  const [editedNode, setEditedNode] = React.useState<CommunicationNode>(node);

  React.useEffect(() => {
    if (isOpen && node) {
      setEditedNode(node);
    }
  }, [node, isOpen]);

  const handleSave = () => {
    onSave(editedNode);
    onClose();
  };

  const renderConfigForm = () => {
    if (!editedNode) {
      return <div>加载中...</div>;
    }

    if (!isEditMode) {
      // Display mode - read-only
      return (
        <div className="bg-gray-50 p-4 rounded-md">
          {renderConfigDisplay()}
        </div>
      );
    }

    // Edit mode - editable form
    switch (editedNode.protocolType) {
      case 'MODBUS_TCP':
        return (
          <ModbusTcpNodeForm
            config={editedNode.config}
            onConfigChange={(config) => setEditedNode({ ...editedNode, config })}
          />
        );
      case 'MODBUS_RTU':
        return (
          <ModbusRtuNodeForm
            config={editedNode.config}
            onConfigChange={(config) => setEditedNode({ ...editedNode, config })}
          />
        );
      case 'MODBUS_TCP_SERVER':
        return (
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>绑定地址 *</Label>
                <Input
                  value={editedNode.config.bindAddress}
                  onChange={(e) => setEditedNode({ 
                    ...editedNode, 
                    config: { ...editedNode.config, bindAddress: e.target.value } 
                  })}
                />
              </div>
              <div>
                <Label>端口 *</Label>
                <Input
                  type="number"
                  value={editedNode.config.port}
                  onChange={(e) => setEditedNode({ 
                    ...editedNode, 
                    config: { ...editedNode.config, port: parseInt(e.target.value) || 502 } 
                  })}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>最大连接数</Label>
                <Input
                  type="number"
                  value={editedNode.config.maxConnections}
                  onChange={(e) => setEditedNode({ 
                    ...editedNode, 
                    config: { ...editedNode.config, maxConnections: parseInt(e.target.value) || 10 } 
                  })}
                />
              </div>
              <div>
                <Label>超时(ms)</Label>
                <Input
                  type="number"
                  value={editedNode.config.timeout}
                  onChange={(e) => setEditedNode({ 
                    ...editedNode, 
                    config: { ...editedNode.config, timeout: parseInt(e.target.value) || 3000 } 
                  })}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>连接模式</Label>
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="server-tcp-mode-dialog"
                    checked={editedNode.config.connectionMode === 'TCP'}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        setEditedNode({
                          ...editedNode,
                          config: { ...editedNode.config, connectionMode: 'TCP' }
                        });
                      }
                    }}
                  />
                  <Label htmlFor="server-tcp-mode-dialog">标准TCP</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="server-rtu-over-tcp-mode-dialog"
                    checked={editedNode.config.connectionMode === 'TCP_RTU_OVER_TCP'}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        setEditedNode({
                          ...editedNode,
                          config: { ...editedNode.config, connectionMode: 'TCP_RTU_OVER_TCP' }
                        });
                      }
                    }}
                  />
                  <Label htmlFor="server-rtu-over-tcp-mode-dialog">RTU over TCP</Label>
                </div>
              </div>
            </div>
          </div>
        );
      case 'MODBUS_RTU_SERVER':
        return (
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>串口 *</Label>
                <Input
                  value={editedNode.config.serialPort}
                  onChange={(e) => setEditedNode({ 
                    ...editedNode, 
                    config: { ...editedNode.config, serialPort: e.target.value } 
                  })}
                />
              </div>
              <div>
                <Label>波特率 *</Label>
                <select
                  value={editedNode.config.baudRate}
                  onChange={(e) => setEditedNode({ 
                    ...editedNode, 
                    config: { ...editedNode.config, baudRate: parseInt(e.target.value) } 
                  })}
                  className="border rounded px-2 py-1 text-sm w-full"
                >
                  {[1200, 2400, 4800, 9600, 19200, 38400, 57600, 115200].map(rate => (
                    <option key={rate} value={rate}>{rate}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="grid grid-cols-4 gap-3">
              <div>
                <Label>数据位</Label>
                <select
                  value={editedNode.config.dataBits}
                  onChange={(e) => setEditedNode({ 
                    ...editedNode, 
                    config: { ...editedNode.config, dataBits: parseInt(e.target.value) as 7 | 8 } 
                  })}
                  className="border rounded px-2 py-1 text-sm w-full"
                >
                  <option value={7}>7位</option>
                  <option value={8}>8位</option>
                </select>
              </div>
              <div>
                <Label>停止位</Label>
                <select
                  value={editedNode.config.stopBits}
                  onChange={(e) => setEditedNode({ 
                    ...editedNode, 
                    config: { ...editedNode.config, stopBits: parseInt(e.target.value) as 1 | 2 } 
                  })}
                  className="border rounded px-2 py-1 text-sm w-full"
                >
                  <option value={1}>1位</option>
                  <option value={2}>2位</option>
                </select>
              </div>
              <div>
                <Label>校验位</Label>
                <select
                  value={editedNode.config.parity}
                  onChange={(e) => setEditedNode({ 
                    ...editedNode, 
                    config: { ...editedNode.config, parity: e.target.value as any } 
                  })}
                  className="border rounded px-2 py-1 text-sm w-full"
                >
                  <option value="NONE">无校验</option>
                  <option value="EVEN">偶校验</option>
                  <option value="ODD">奇校验</option>
                </select>
              </div>
              <div>
                <Label>最大连接数</Label>
                <Input
                  type="number"
                  value={editedNode.config.maxConnections}
                  onChange={(e) => setEditedNode({ 
                    ...editedNode, 
                    config: { ...editedNode.config, maxConnections: parseInt(e.target.value) || 10 } 
                  })}
                />
              </div>
            </div>
            <div>
              <Label>超时(ms)</Label>
              <Input
                type="number"
                value={editedNode.config.timeout}
                onChange={(e) => setEditedNode({ 
                  ...editedNode, 
                  config: { ...editedNode.config, timeout: parseInt(e.target.value) || 3000 } 
                })}
              />
            </div>
          </div>
        );
      case 'DLT645_RTU':
        return (
          <Dlt645RtuNodeForm
            config={editedNode.config}
            onConfigChange={(config) => setEditedNode({ ...editedNode, config })}
          />
        );
      case 'DLT645_TCP':
        return (
          <Dlt645TcpNodeForm
            config={editedNode.config}
            onConfigChange={(config) => setEditedNode({ ...editedNode, config })}
          />
        );
      case 'IEC104_SERVER':
        return (
          <Iec104ServerNodeForm
            config={editedNode.config}
            onConfigChange={(config) => setEditedNode({ ...editedNode, config })}
          />
        );
      case 'IEC104_CLIENT':
        return (
          <Iec104ClientNodeForm
            config={editedNode.config}
            onConfigChange={(config) => setEditedNode({ ...editedNode, config })}
          />
        );
      case 'IEC61850_SERVER':
        return (
          <Iec61850ServerNodeForm
            config={editedNode.config}
            onConfigChange={(config) => setEditedNode({ ...editedNode, config })}
          />
        );
      case 'IEC61850_CLIENT':
        return (
          <Iec61850ClientNodeForm
            config={editedNode.config}
            onConfigChange={(config) => setEditedNode({ ...editedNode, config })}
          />
        );
      case 'EMS_IO':
        return (
          <EmsIoNodeForm
            config={editedNode.config}
            onConfigChange={(config) => setEditedNode({ ...editedNode, config })}
          />
        );
      default:
        return <div>未知协议配置</div>;
    }
  };

  const renderConfigDisplay = () => {
    if (!editedNode) {
      return <div>加载中...</div>;
    }

    const config = editedNode.config;
    switch (editedNode.protocolType) {
      case 'MODBUS_TCP':
        return (
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div><span className="font-medium">主机地址:</span> {(config as ModbusTcpClientConfig).host}</div>
            <div><span className="font-medium">端口:</span> {(config as ModbusTcpClientConfig).port}</div>
            <div><span className="font-medium">从站ID:</span> {(config as ModbusTcpClientConfig).slaveId}</div>
            <div><span className="font-medium">超时(ms):</span> {(config as ModbusTcpClientConfig).timeout}</div>
            <div><span className="font-medium">重试次数:</span> {(config as ModbusTcpClientConfig).retryCount}</div>
            <div><span className="font-medium">连接模式:</span> {(config as ModbusTcpClientConfig).connectionMode === 'TCP' ? '标准TCP' : 'RTU over TCP'}</div>
          </div>
        );
      case 'MODBUS_RTU':
        return (
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div><span className="font-medium">串口:</span> {(config as ModbusRtuClientConfig).serialPort}</div>
            <div><span className="font-medium">波特率:</span> {(config as ModbusRtuClientConfig).baudRate}</div>
            <div><span className="font-medium">数据位:</span> {(config as ModbusRtuClientConfig).dataBits}</div>
            <div><span className="font-medium">停止位:</span> {(config as ModbusRtuClientConfig).stopBits}</div>
            <div><span className="font-medium">校验位:</span> {(config as ModbusRtuClientConfig).parity}</div>
            <div><span className="font-medium">从站ID:</span> {(config as ModbusRtuClientConfig).slaveId}</div>
            <div><span className="font-medium">超时(ms):</span> {(config as ModbusRtuClientConfig).timeout}</div>
            <div><span className="font-medium">重试次数:</span> {(config as ModbusRtuClientConfig).retryCount}</div>
          </div>
        );
      case 'MODBUS_TCP_SERVER':
        return (
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div><span className="font-medium">绑定地址:</span> {(config as ModbusTcpServerConfig).bindAddress}</div>
            <div><span className="font-medium">端口:</span> {(config as ModbusTcpServerConfig).port}</div>
            <div><span className="font-medium">最大连接数:</span> {(config as ModbusTcpServerConfig).maxConnections}</div>
            <div><span className="font-medium">超时(ms):</span> {(config as ModbusTcpServerConfig).timeout}</div>
            <div><span className="font-medium">连接模式:</span> {(config as ModbusTcpServerConfig).connectionMode === 'TCP' ? '标准TCP' : 'RTU over TCP'}</div>
          </div>
        );
      case 'MODBUS_RTU_SERVER':
        return (
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div><span className="font-medium">串口:</span> {(config as ModbusRtuServerConfig).serialPort}</div>
            <div><span className="font-medium">波特率:</span> {(config as ModbusRtuServerConfig).baudRate}</div>
            <div><span className="font-medium">数据位:</span> {(config as ModbusRtuServerConfig).dataBits}</div>
            <div><span className="font-medium">停止位:</span> {(config as ModbusRtuServerConfig).stopBits}</div>
            <div><span className="font-medium">校验位:</span> {(config as ModbusRtuServerConfig).parity}</div>
            <div><span className="font-medium">最大连接数:</span> {(config as ModbusRtuServerConfig).maxConnections}</div>
            <div><span className="font-medium">超时(ms):</span> {(config as ModbusRtuServerConfig).timeout}</div>
          </div>
        );
      case 'DLT645_RTU':
        return (
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div><span className="font-medium">串口:</span> {(config as Dlt645RtuConfig).serialPort}</div>
            <div><span className="font-medium">波特率:</span> {(config as Dlt645RtuConfig).baudRate}</div>
            <div><span className="font-medium">数据位:</span> {(config as Dlt645RtuConfig).dataBits}</div>
            <div><span className="font-medium">停止位:</span> {(config as Dlt645RtuConfig).stopBits}</div>
            <div><span className="font-medium">校验位:</span> {(config as Dlt645RtuConfig).parity}</div>
            <div><span className="font-medium">电表地址:</span> {(config as Dlt645RtuConfig).address}</div>
            <div><span className="font-medium">超时(ms):</span> {(config as Dlt645RtuConfig).timeout}</div>
          </div>
        );
      case 'DLT645_TCP':
        return (
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div><span className="font-medium">主机地址:</span> {(config as Dlt645TcpConfig).host}</div>
            <div><span className="font-medium">端口:</span> {(config as Dlt645TcpConfig).port}</div>
            <div><span className="font-medium">电表地址:</span> {(config as Dlt645TcpConfig).address}</div>
            <div><span className="font-medium">超时(ms):</span> {(config as Dlt645TcpConfig).timeout}</div>
            <div><span className="font-medium">重试次数:</span> {(config as Dlt645TcpConfig).retryCount}</div>
          </div>
        );
      case 'IEC104_SERVER':
        return (
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div><span className="font-medium">绑定地址:</span> {(config as Iec104ServerConfig).bindAddress}</div>
            <div><span className="font-medium">端口:</span> {(config as Iec104ServerConfig).port}</div>
            <div><span className="font-medium">最大连接数:</span> {(config as Iec104ServerConfig).maxConnections}</div>
            <div><span className="font-medium">公共地址:</span> {(config as Iec104ServerConfig).commonAddress}</div>
            <div><span className="font-medium">K值:</span> {(config as Iec104ServerConfig).kValue}</div>
            <div><span className="font-medium">W值:</span> {(config as Iec104ServerConfig).wValue}</div>
            <div><span className="font-medium">T0超时(ms):</span> {(config as Iec104ServerConfig).t0Timeout}</div>
            <div><span className="font-medium">T1超时(ms):</span> {(config as Iec104ServerConfig).t1Timeout}</div>
            <div><span className="font-medium">T2超时(ms):</span> {(config as Iec104ServerConfig).t2Timeout}</div>
            <div><span className="font-medium">T3周期(ms):</span> {(config as Iec104ServerConfig).t3Timeout}</div>
          </div>
        );
      case 'IEC104_CLIENT':
        return (
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div><span className="font-medium">主机地址:</span> {(config as Iec104ClientConfig).host}</div>
            <div><span className="font-medium">端口:</span> {(config as Iec104ClientConfig).port}</div>
            <div><span className="font-medium">公共地址:</span> {(config as Iec104ClientConfig).commonAddress}</div>
            <div><span className="font-medium">K值:</span> {(config as Iec104ClientConfig).kValue}</div>
            <div><span className="font-medium">W值:</span> {(config as Iec104ClientConfig).wValue}</div>
            <div><span className="font-medium">T0超时(ms):</span> {(config as Iec104ClientConfig).t0Timeout}</div>
            <div><span className="font-medium">T1超时(ms):</span> {(config as Iec104ClientConfig).t1Timeout}</div>
            <div><span className="font-medium">T2超时(ms):</span> {(config as Iec104ClientConfig).t2Timeout}</div>
            <div><span className="font-medium">T3周期(ms):</span> {(config as Iec104ClientConfig).t3Timeout}</div>
            <div><span className="font-medium">重连间隔(ms):</span> {(config as Iec104ClientConfig).reconnectInterval}</div>
            <div><span className="font-medium">自动重连:</span> {(config as Iec104ClientConfig).autoReconnect ? '是' : '否'}</div>
          </div>
        );
      case 'IEC61850_SERVER':
        return (
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div><span className="font-medium">绑定地址:</span> {(config as Iec61850ServerConfig).bindAddress}</div>
            <div><span className="font-medium">MMS端口:</span> {(config as Iec61850ServerConfig).mmsPort}</div>
            <div><span className="font-medium">GOOSE端口:</span> {(config as Iec61850ServerConfig).goosePort}</div>
            <div><span className="font-medium">SV端口:</span> {(config as Iec61850ServerConfig).svPort}</div>
            <div><span className="font-medium">IED名称:</span> {(config as Iec61850ServerConfig).iedName}</div>
            <div><span className="font-medium">ICD文件:</span> {(config as Iec61850ServerConfig).icdFile}</div>
            <div><span className="font-medium">最大连接数:</span> {(config as Iec61850ServerConfig).maxConnections}</div>
          </div>
        );
      case 'IEC61850_CLIENT':
        return (
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div><span className="font-medium">主机地址:</span> {(config as Iec61850ClientConfig).host}</div>
            <div><span className="font-medium">MMS端口:</span> {(config as Iec61850ClientConfig).mmsPort}</div>
            <div><span className="font-medium">IED名称:</span> {(config as Iec61850ClientConfig).iedName}</div>
            <div><span className="font-medium">ICD文件:</span> {(config as Iec61850ClientConfig).icdFile}</div>
            <div><span className="font-medium">重连间隔(ms):</span> {(config as Iec61850ClientConfig).reconnectInterval}</div>
            <div><span className="font-medium">自动重连:</span> {(config as Iec61850ClientConfig).autoReconnect ? '是' : '否'}</div>
          </div>
        );
      case 'EMS_IO':
        return (
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div><span className="font-medium">DI起始地址:</span> {(config as EmsIoConfig).diStartAddress}</div>
            <div><span className="font-medium">计数（DI）:</span> {(config as EmsIoConfig).diCount}</div>
            <div><span className="font-medium">DO起始地址:</span> {(config as EmsIoConfig).doStartAddress}</div>
            <div><span className="font-medium">计数（DO）:</span> {(config as EmsIoConfig).doCount}</div>
          </div>
        );
      default:
        return <div>未知协议配置</div>;
    }
  };

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

  if (!node) {
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEditMode ? '编辑' : '查看'} {getProtocolDisplayName(node.protocolType)} 节点
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>节点名称 *</Label>
              <Input
                value={editedNode?.name || ''}
                onChange={(e) => setEditedNode({ ...editedNode, name: e.target.value })}
                disabled={!isEditMode}
              />
            </div>
            <div>
              <Label>描述</Label>
              <Input
                value={editedNode?.description || ''}
                onChange={(e) => setEditedNode({ ...editedNode, description: e.target.value })}
                disabled={!isEditMode}
              />
            </div>
          </div>
          
          <div>
            <Label>协议类型</Label>
            <div className="px-3 py-2 bg-blue-100 text-blue-800 rounded-md">
              {getProtocolDisplayName(node.protocolType)}
            </div>
          </div>
          
          {renderConfigForm()}
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            关闭
          </Button>
          {isEditMode && editedNode && (
            <Button onClick={handleSave}>
              保存
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default NodeConfigDialog;