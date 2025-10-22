"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Trash2, Edit, Eye, ArrowUp, ArrowDown, Upload, Download } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { toast } from "sonner";
import NodeConfigDialog from '@/components/industrial/NodeConfigDialog';
import { Checkbox } from '@/components/ui/checkbox';

// Updated ProtocolType definition to include MODBUS_SERVER
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

// Base node interface
interface BaseNode {
  id: string;
  name: string;
  protocolType: ProtocolType;
  description?: string;
  enabled: boolean;
  status: 'ONLINE' | 'OFFLINE' | 'ERROR' | 'CONNECTING';
}

// MODBUS TCP Client Config (existing)
interface ModbusTcpClientConfig {
  host: string;
  port: number;
  slaveId: number;
  timeout: number;
  retryCount: number;
  connectionMode: 'TCP' | 'TCP_RTU_OVER_TCP';
}

// MODBUS TCP Server Config (new)
interface ModbusTcpServerConfig {
  bindAddress: string;
  port: number;
  maxConnections: number;
  timeout: number;
  connectionMode: 'TCP' | 'TCP_RTU_OVER_TCP';
}

// MODBUS RTU Client Config (existing)
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

// MODBUS RTU Server Config (new)
interface ModbusRtuServerConfig {
  serialPort: string;
  baudRate: number;
  dataBits: 7 | 8;
  stopBits: 1 | 2;
  parity: 'NONE' | 'EVEN' | 'ODD';
  maxConnections: number;
  timeout: number;
}

// Other protocol configs remain the same
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

// Updated CommunicationNode type
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
);

const NodeConfig = () => {
  const [nodes, setNodes] = useState<CommunicationNode[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [selectedProtocol, setSelectedProtocol] = useState<ProtocolType>('MODBUS_TCP');
  const [viewingNode, setViewingNode] = useState<CommunicationNode | null>(null);
  const [editingNode, setEditingNode] = useState<CommunicationNode | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);

  // Get protocol display name
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

  // Create default config
  const createDefaultConfig = (protocol: ProtocolType): any => {
    switch (protocol) {
      case 'MODBUS_TCP':
        return {
          host: '192.168.1.100',
          port: 502,
          slaveId: 1,
          timeout: 3000,
          retryCount: 3,
          connectionMode: 'TCP'
        };
      case 'MODBUS_RTU':
        return {
          serialPort: '/dev/ttyS0',
          baudRate: 9600,
          dataBits: 8,
          stopBits: 1,
          parity: 'NONE',
          slaveId: 1,
          timeout: 3000,
          retryCount: 3
        };
      case 'MODBUS_TCP_SERVER':
        return {
          bindAddress: '0.0.0.0',
          port: 502,
          maxConnections: 10,
          timeout: 3000,
          connectionMode: 'TCP'
        };
      case 'MODBUS_RTU_SERVER':
        return {
          serialPort: '/dev/ttyS0',
          baudRate: 9600,
          dataBits: 8,
          stopBits: 1,
          parity: 'NONE',
          maxConnections: 10,
          timeout: 3000
        };
      case 'DLT645_RTU':
        return {
          serialPort: '/dev/ttyS1',
          baudRate: 2400,
          dataBits: 8,
          stopBits: 1,
          parity: 'EVEN',
          address: '000000000001',
          password: '123456',
          timeout: 5000
        };
      case 'DLT645_TCP':
        return {
          host: '192.168.1.101',
          port: 6450,
          address: '000000000002',
          password: '654321',
          timeout: 5000,
          retryCount: 3
        };
      case 'IEC104_SERVER':
        return {
          bindAddress: '0.0.0.0',
          port: 2404,
          maxConnections: 10,
          commonAddress: 1,
          kValue: 12,
          wValue: 8,
          t0Timeout: 30000,
          t1Timeout: 15000,
          t2Timeout: 10000,
          t3Timeout: 20000
        };
      case 'IEC104_CLIENT':
        return {
          host: '192.168.1.200',
          port: 2404,
          commonAddress: 1,
          kValue: 12,
          wValue: 8,
          t0Timeout: 30000,
          t1Timeout: 15000,
          t2Timeout: 10000,
          t3Timeout: 20000,
          reconnectInterval: 5000,
          autoReconnect: true
        };
      case 'IEC61850_SERVER':
        return {
          bindAddress: '0.0.0.0',
          mmsPort: 102,
          goosePort: 0,
          svPort: 0,
          iedName: 'IED1',
          icdFile: '/path/to/ied1.icd',
          maxConnections: 10
        };
      case 'IEC61850_CLIENT':
        return {
          host: '192.168.1.201',
          mmsPort: 102,
          iedName: 'RemoteIED',
          icdFile: '/path/to/remote.icd',
          reconnectInterval: 5000,
          autoReconnect: true
        };
      default:
        return {};
    }
  };

  // Initialize default nodes
  useEffect(() => {
    const defaultNodes: CommunicationNode[] = [
      {
        id: 'modbus-tcp-1',
        name: 'MODBUS TCP 客户端',
        protocolType: 'MODBUS_TCP',
        description: '工厂温度传感器',
        enabled: true,
        status: 'ONLINE',
        config: createDefaultConfig('MODBUS_TCP')
      },
      {
        id: 'modbus-rtu-1',
        name: 'MODBUS RTU 客户端',
        protocolType: 'MODBUS_RTU',
        description: '串口温湿度传感器',
        enabled: true,
        status: 'OFFLINE',
        config: createDefaultConfig('MODBUS_RTU')
      },
      {
        id: 'modbus-tcp-server-1',
        name: 'MODBUS TCP 服务端',
        protocolType: 'MODBUS_TCP_SERVER',
        description: 'MODBUS TCP 服务端',
        enabled: true,
        status: 'ONLINE',
        config: createDefaultConfig('MODBUS_TCP_SERVER')
      },
      {
        id: 'modbus-rtu-server-1',
        name: 'MODBUS RTU 服务端',
        protocolType: 'MODBUS_RTU_SERVER',
        description: 'MODBUS RTU 服务端',
        enabled: true,
        status: 'OFFLINE',
        config: createDefaultConfig('MODBUS_RTU_SERVER')
      },
      {
        id: 'dlt645-rtu-1',
        name: 'DLT645 RTU 电表',
        protocolType: 'DLT645_RTU',
        description: '智能电表',
        enabled: true,
        status: 'OFFLINE',
        config: createDefaultConfig('DLT645_RTU')
      },
      {
        id: 'dlt645-tcp-1',
        name: 'DLT645 TCP 电表',
        protocolType: 'DLT645_TCP',
        description: '网络电表',
        enabled: true,
        status: 'OFFLINE',
        config: createDefaultConfig('DLT645_TCP')
      },
      {
        id: 'iec104-server-1',
        name: 'IEC104 服务端',
        protocolType: 'IEC104_SERVER',
        description: '数据采集服务端',
        enabled: true,
        status: 'ONLINE',
        config: createDefaultConfig('IEC104_SERVER')
      },
      {
        id: 'iec104-client-1',
        name: 'IEC104 客户端',
        protocolType: 'IEC104_CLIENT',
        description: '连接上级调度系统',
        enabled: true,
        status: 'OFFLINE',
        config: createDefaultConfig('IEC104_CLIENT')
      },
      {
        id: 'iec61850-server-1',
        name: 'IEC61850 服务端',
        protocolType: 'IEC61850_SERVER',
        description: '变电站IED服务端',
        enabled: true,
        status: 'ONLINE',
        config: createDefaultConfig('IEC61850_SERVER')
      },
      {
        id: 'iec61850-client-1',
        name: 'IEC61850 客户端',
        protocolType: 'IEC61850_CLIENT',
        description: '连接远程IED设备',
        enabled: true,
        status: 'OFFLINE',
        config: createDefaultConfig('IEC61850_CLIENT')
      }
    ];
    setNodes(defaultNodes);
  }, []);

  const addNode = (formData: any) => {
    const newNode: CommunicationNode = {
      id: `node-${Date.now()}`,
      name: formData.name,
      description: formData.description,
      protocolType: selectedProtocol,
      enabled: true,
      status: 'OFFLINE',
      config: formData.config
    };
    setNodes([...nodes, newNode]);
    setIsAdding(false);
    setSelectedProtocol('MODBUS_TCP');
  };

  const deleteNode = (id: string) => {
    setNodes(nodes.filter(node => node.id !== id));
  };

  const updateNode = (updatedNode: CommunicationNode) => {
    setNodes(nodes.map(node => node.id === updatedNode.id ? updatedNode : node));
  };

  const moveNodeUp = (index: number) => {
    if (index > 0) {
      const newNodes = [...nodes];
      [newNodes[index - 1], newNodes[index]] = [newNodes[index], newNodes[index - 1]];
      setNodes(newNodes);
    }
  };

  const moveNodeDown = (index: number) => {
    if (index < nodes.length - 1) {
      const newNodes = [...nodes];
      [newNodes[index], newNodes[index + 1]] = [newNodes[index + 1], newNodes[index]];
      setNodes(newNodes);
    }
  };

  const exportNode = (node: CommunicationNode) => {
    const nodeData = {
      id: node.id,
      name: node.name,
      protocolType: node.protocolType,
      description: node.description,
      enabled: node.enabled,
      config: node.config
    };
    const dataStr = JSON.stringify(nodeData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${node.name.replace(/\s+/g, '_')}_config.json`;
    link.click();
    URL.revokeObjectURL(url);
    toast.success(`设备 "${node.name}" 配置已导出`);
  };

  const importNode = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const nodeData = JSON.parse(e.target?.result as string);
        const newNode: CommunicationNode = {
          ...nodeData,
          id: `node-${Date.now()}`,
          status: 'OFFLINE'
        };
        setNodes([...nodes, newNode]);
        toast.success(`设备 "${newNode.name}" 配置已导入`);
      } catch (error) {
        toast.error('导入配置文件失败，请检查文件格式');
      }
    };
    reader.readAsText(file);
    event.target.value = '';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ONLINE': return 'text-green-600';
      case 'OFFLINE': return 'text-yellow-600';
      case 'ERROR': return 'text-red-600';
      case 'CONNECTING': return 'text-blue-600';
      default: return 'text-gray-600';
    }
  };

  // MODBUS TCP Client Form
  const ModbusTcpClientForm = ({ onSubmit }: { onSubmit: (data: any) => void }) => {
    const [formData, setFormData] = useState({
      name: '',
      description: '',
      config: createDefaultConfig('MODBUS_TCP')
    });

    return (
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label>节点名称 *</Label>
            <Input
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="输入节点名称"
            />
          </div>
          <div>
            <Label>描述</Label>
            <Input
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="节点描述"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label>主机地址 *</Label>
            <Input
              value={formData.config.host}
              onChange={(e) => setFormData({
                ...formData,
                config: { ...formData.config, host: e.target.value }
              })}
              placeholder="IP地址或域名"
            />
          </div>
          <div>
            <Label>端口 *</Label>
            <Input
              type="number"
              value={formData.config.port}
              onChange={(e) => setFormData({
                ...formData,
                config: { ...formData.config, port: parseInt(e.target.value) || 502 }
              })}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <Label>从站ID *</Label>
            <Input
              type="number"
              value={formData.config.slaveId}
              onChange={(e) => setFormData({
                ...formData,
                config: { ...formData.config, slaveId: parseInt(e.target.value) || 1 }
              })}
            />
          </div>
          <div>
            <Label>超时(ms)</Label>
            <Input
              type="number"
              value={formData.config.timeout}
              onChange={(e) => setFormData({
                ...formData,
                config: { ...formData.config, timeout: parseInt(e.target.value) || 3000 }
              })}
            />
          </div>
          <div>
            <Label>重试次数</Label>
            <Input
              type="number"
              value={formData.config.retryCount}
              onChange={(e) => setFormData({
                ...formData,
                config: { ...formData.config, retryCount: parseInt(e.target.value) || 3 }
              })}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label>连接模式</Label>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="tcp-mode"
                checked={formData.config.connectionMode === 'TCP'}
                onCheckedChange={(checked) => {
                  if (checked) {
                    setFormData({
                      ...formData,
                      config: { ...formData.config, connectionMode: 'TCP' }
                    });
                  }
                }}
              />
              <Label htmlFor="tcp-mode">标准TCP</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="rtu-over-tcp-mode"
                checked={formData.config.connectionMode === 'TCP_RTU_OVER_TCP'}
                onCheckedChange={(checked) => {
                  if (checked) {
                    setFormData({
                      ...formData,
                      config: { ...formData.config, connectionMode: 'TCP_RTU_OVER_TCP' }
                    });
                  }
                }}
              />
              <Label htmlFor="rtu-over-tcp-mode">RTU over TCP</Label>
            </div>
          </div>
        </div>

        <div className="flex justify-end space-x-2 pt-4">
          <Button variant="outline" onClick={() => setIsAdding(false)}>取消</Button>
          <Button onClick={() => onSubmit(formData)} disabled={!formData.name || !formData.config.host}>
            添加节点
          </Button>
        </div>
      </div>
    );
  };

  // MODBUS TCP Server Form
  const ModbusTcpServerForm = ({ onSubmit }: { onSubmit: (data: any) => void }) => {
    const [formData, setFormData] = useState({
      name: '',
      description: '',
      config: createDefaultConfig('MODBUS_TCP_SERVER')
    });

    return (
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label>节点名称 *</Label>
            <Input
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="输入节点名称"
            />
          </div>
          <div>
            <Label>描述</Label>
            <Input
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="节点描述"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label>绑定地址 *</Label>
            <Input
              value={formData.config.bindAddress}
              onChange={(e) => setFormData({
                ...formData,
                config: { ...formData.config, bindAddress: e.target.value }
              })}
              placeholder="0.0.0.0"
            />
          </div>
          <div>
            <Label>端口 *</Label>
            <Input
              type="number"
              value={formData.config.port}
              onChange={(e) => setFormData({
                ...formData,
                config: { ...formData.config, port: parseInt(e.target.value) || 502 }
              })}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label>最大连接数</Label>
            <Input
              type="number"
              value={formData.config.maxConnections}
              onChange={(e) => setFormData({
                ...formData,
                config: { ...formData.config, maxConnections: parseInt(e.target.value) || 10 }
              })}
            />
          </div>
          <div>
            <Label>超时(ms)</Label>
            <Input
              type="number"
              value={formData.config.timeout}
              onChange={(e) => setFormData({
                ...formData,
                config: { ...formData.config, timeout: parseInt(e.target.value) || 3000 }
              })}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label>连接模式</Label>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="server-tcp-mode"
                checked={formData.config.connectionMode === 'TCP'}
                onCheckedChange={(checked) => {
                  if (checked) {
                    setFormData({
                      ...formData,
                      config: { ...formData.config, connectionMode: 'TCP' }
                    });
                  }
                }}
              />
              <Label htmlFor="server-tcp-mode">标准TCP</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="server-rtu-over-tcp-mode"
                checked={formData.config.connectionMode === 'TCP_RTU_OVER_TCP'}
                onCheckedChange={(checked) => {
                  if (checked) {
                    setFormData({
                      ...formData,
                      config: { ...formData.config, connectionMode: 'TCP_RTU_OVER_TCP' }
                    });
                  }
                }}
              />
              <Label htmlFor="server-rtu-over-tcp-mode">RTU over TCP</Label>
            </div>
          </div>
        </div>

        <div className="flex justify-end space-x-2 pt-4">
          <Button variant="outline" onClick={() => setIsAdding(false)}>取消</Button>
          <Button onClick={() => onSubmit(formData)} disabled={!formData.name}>
            添加节点
          </Button>
        </div>
      </div>
    );
  };

  // MODBUS RTU Client Form
  const ModbusRtuClientForm = ({ onSubmit }: { onSubmit: (data: any) => void }) => {
    const [formData, setFormData] = useState({
      name: '',
      description: '',
      config: createDefaultConfig('MODBUS_RTU')
    });

    return (
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label>节点名称 *</Label>
            <Input
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="输入节点名称"
            />
          </div>
          <div>
            <Label>描述</Label>
            <Input
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="节点描述"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label>串口 *</Label>
            <Input
              value={formData.config.serialPort}
              onChange={(e) => setFormData({
                ...formData,
                config: { ...formData.config, serialPort: e.target.value }
              })}
              placeholder="/dev/ttyS0 或 COM1"
            />
          </div>
          <div>
            <Label>波特率 *</Label>
            <Select
              value={formData.config.baudRate.toString()}
              onValueChange={(value) => setFormData({
                ...formData,
                config: { ...formData.config, baudRate: parseInt(value) }
              })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {[1200, 2400, 4800, 9600, 19200, 38400, 57600, 115200].map(rate => (
                  <SelectItem key={rate} value={rate.toString()}>{rate}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <Label>数据位</Label>
            <Select
              value={formData.config.dataBits.toString()}
              onValueChange={(value) => setFormData({
                ...formData,
                config: { ...formData.config, dataBits: parseInt(value) as 7 | 8 }
              })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7">7位</SelectItem>
                <SelectItem value="8">8位</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>停止位</Label>
            <Select
              value={formData.config.stopBits.toString()}
              onValueChange={(value) => setFormData({
                ...formData,
                config: { ...formData.config, stopBits: parseInt(value) as 1 | 2 }
              })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">1位</SelectItem>
                <SelectItem value="2">2位</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>校验位</Label>
            <Select
              value={formData.config.parity}
              onValueChange={(value) => setFormData({
                ...formData,
                config: { ...formData.config, parity: value as any }
              })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="NONE">无校验</SelectItem>
                <SelectItem value="EVEN">偶校验</SelectItem>
                <SelectItem value="ODD">奇校验</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>从站ID *</Label>
            <Input
              type="number"
              value={formData.config.slaveId}
              onChange={(e) => setFormData({
                ...formData,
                config: { ...formData.config, slaveId: parseInt(e.target.value) || 1 }
              })}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label>超时(ms)</Label>
            <Input
              type="number"
              value={formData.config.timeout}
              onChange={(e) => setFormData({
                ...formData,
                config: { ...formData.config, timeout: parseInt(e.target.value) || 3000 }
              })}
            />
          </div>
          <div>
            <Label>重试次数</Label>
            <Input
              type="number"
              value={formData.config.retryCount}
              onChange={(e) => setFormData({
                ...formData,
                config: { ...formData.config, retryCount: parseInt(e.target.value) || 3 }
              })}
            />
          </div>
        </div>

        <div className="flex justify-end space-x-2 pt-4">
          <Button variant="outline" onClick={() => setIsAdding(false)}>取消</Button>
          <Button onClick={() => onSubmit(formData)} disabled={!formData.name || !formData.config.serialPort}>
            添加节点
          </Button>
        </div>
      </div>
    );
  };

  // MODBUS RTU Server Form
  const ModbusRtuServerForm = ({ onSubmit }: { onSubmit: (data: any) => void }) => {
    const [formData, setFormData] = useState({
      name: '',
      description: '',
      config: createDefaultConfig('MODBUS_RTU_SERVER')
    });

    return (
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label>节点名称 *</Label>
            <Input
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="输入节点名称"
            />
          </div>
          <div>
            <Label>描述</Label>
            <Input
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="节点描述"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label>串口 *</Label>
            <Input
              value={formData.config.serialPort}
              onChange={(e) => setFormData({
                ...formData,
                config: { ...formData.config, serialPort: e.target.value }
              })}
              placeholder="/dev/ttyS0 或 COM1"
            />
          </div>
          <div>
            <Label>波特率 *</Label>
            <Select
              value={formData.config.baudRate.toString()}
              onValueChange={(value) => setFormData({
                ...formData,
                config: { ...formData.config, baudRate: parseInt(value) }
              })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {[1200, 2400, 4800, 9600, 19200, 38400, 57600, 115200].map(rate => (
                  <SelectItem key={rate} value={rate.toString()}>{rate}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <Label>数据位</Label>
            <Select
              value={formData.config.dataBits.toString()}
              onValueChange={(value) => setFormData({
                ...formData,
                config: { ...formData.config, dataBits: parseInt(value) as 7 | 8 }
              })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7">7位</SelectItem>
                <SelectItem value="8">8位</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>停止位</Label>
            <Select
              value={formData.config.stopBits.toString()}
              onValueChange={(value) => setFormData({
                ...formData,
                config: { ...formData.config, stopBits: parseInt(value) as 1 | 2 }
              })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">1位</SelectItem>
                <SelectItem value="2">2位</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>校验位</Label>
            <Select
              value={formData.config.parity}
              onValueChange={(value) => setFormData({
                ...formData,
                config: { ...formData.config, parity: value as any }
              })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="NONE">无校验</SelectItem>
                <SelectItem value="EVEN">偶校验</SelectItem>
                <SelectItem value="ODD">奇校验</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>最大连接数</Label>
            <Input
              type="number"
              value={formData.config.maxConnections}
              onChange={(e) => setFormData({
                ...formData,
                config: { ...formData.config, maxConnections: parseInt(e.target.value) || 10 }
              })}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label>超时(ms)</Label>
            <Input
              type="number"
              value={formData.config.timeout}
              onChange={(e) => setFormData({
                ...formData,
                config: { ...formData.config, timeout: parseInt(e.target.value) || 3000 }
              })}
            />
          </div>
        </div>

        <div className="flex justify-end space-x-2 pt-4">
          <Button variant="outline" onClick={() => setIsAdding(false)}>取消</Button>
          <Button onClick={() => onSubmit(formData)} disabled={!formData.name || !formData.config.serialPort}>
            添加节点
          </Button>
        </div>
      </div>
    );
  };

  // Other protocol forms remain the same (DLT645, IEC104, IEC61850)
  const Dlt645RtuForm = ({ onSubmit }: { onSubmit: (data: any) => void }) => {
    const [formData, setFormData] = useState({
      name: '',
      description: '',
      config: createDefaultConfig('DLT645_RTU')
    });

    return (
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label>节点名称 *</Label>
            <Input
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="输入节点名称"
            />
          </div>
          <div>
            <Label>描述</Label>
            <Input
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="节点描述"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label>串口 *</Label>
            <Input
              value={formData.config.serialPort}
              onChange={(e) => setFormData({
                ...formData,
                config: { ...formData.config, serialPort: e.target.value }
              })}
              placeholder="/dev/ttyS0 或 COM1"
            />
          </div>
          <div>
            <Label>波特率 *</Label>
            <Select
              value={formData.config.baudRate.toString()}
              onValueChange={(value) => setFormData({
                ...formData,
                config: { ...formData.config, baudRate: parseInt(value) }
              })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {[1200, 2400, 4800, 9600].map(rate => (
                  <SelectItem key={rate} value={rate.toString()}>{rate}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <Label>数据位</Label>
            <Select
              value={formData.config.dataBits.toString()}
              onValueChange={(value) => setFormData({
                ...formData,
                config: { ...formData.config, dataBits: parseInt(value) as 7 | 8 }
              })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7">7位</SelectItem>
                <SelectItem value="8">8位</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>停止位</Label>
            <Select
              value={formData.config.stopBits.toString()}
              onValueChange={(value) => setFormData({
                ...formData,
                config: { ...formData.config, stopBits: parseInt(value) as 1 | 2 }
              })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">1位</SelectItem>
                <SelectItem value="2">2位</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>校验位</Label>
            <Select
              value={formData.config.parity}
              onValueChange={(value) => setFormData({
                ...formData,
                config: { ...formData.config, parity: value as any }
              })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="NONE">无校验</SelectItem>
                <SelectItem value="EVEN">偶校验</SelectItem>
                <SelectItem value="ODD">奇校验</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label>电表地址 (12位) *</Label>
            <Input
              value={formData.config.address}
              onChange={(e) => setFormData({
                ...formData,
                config: { ...formData.config, address: e.target.value }
              })}
              placeholder="12位电表地址"
            />
          </div>
          <div>
            <Label>密码 (6位)</Label>
            <Input
              type="password"
              value={formData.config.password}
              onChange={(e) => setFormData({
                ...formData,
                config: { ...formData.config, password: e.target.value }
              })}
              placeholder="6位密码"
            />
          </div>
        </div>

        <div>
          <Label>超时(ms)</Label>
          <Input
            type="number"
            value={formData.config.timeout}
            onChange={(e) => setFormData({
              ...formData,
              config: { ...formData.config, timeout: parseInt(e.target.value) || 5000 }
            })}
          />
        </div>

        <div className="flex justify-end space-x-2 pt-4">
          <Button variant="outline" onClick={() => setIsAdding(false)}>取消</Button>
          <Button onClick={() => onSubmit(formData)} disabled={!formData.name || !formData.config.serialPort || !formData.config.address}>
            添加节点
          </Button>
        </div>
      </div>
    );
  };

  const Dlt645TcpForm = ({ onSubmit }: { onSubmit: (data: any) => void }) => {
    const [formData, setFormData] = useState({
      name: '',
      description: '',
      config: createDefaultConfig('DLT645_TCP')
    });

    return (
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label>节点名称 *</Label>
            <Input
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="输入节点名称"
            />
          </div>
          <div>
            <Label>描述</Label>
            <Input
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="节点描述"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label>主机地址 *</Label>
            <Input
              value={formData.config.host}
              onChange={(e) => setFormData({
                ...formData,
                config: { ...formData.config, host: e.target.value }
              })}
              placeholder="IP地址或域名"
            />
          </div>
          <div>
            <Label>端口 *</Label>
            <Input
              type="number"
              value={formData.config.port}
              onChange={(e) => setFormData({
                ...formData,
                config: { ...formData.config, port: parseInt(e.target.value) || 6450 }
              })}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label>电表地址 (12位) *</Label>
            <Input
              value={formData.config.address}
              onChange={(e) => setFormData({
                ...formData,
                config: { ...formData.config, address: e.target.value }
              })}
              placeholder="12位电表地址"
            />
          </div>
          <div>
            <Label>密码 (6位)</Label>
            <Input
              type="password"
              value={formData.config.password}
              onChange={(e) => setFormData({
                ...formData,
                config: { ...formData.config, password: e.target.value }
              })}
              placeholder="6位密码"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label>超时(ms)</Label>
            <Input
              type="number"
              value={formData.config.timeout}
              onChange={(e) => setFormData({
                ...formData,
                config: { ...formData.config, timeout: parseInt(e.target.value) || 5000 }
              })}
            />
          </div>
          <div>
            <Label>重试次数</Label>
            <Input
              type="number"
              value={formData.config.retryCount}
              onChange={(e) => setFormData({
                ...formData,
                config: { ...formData.config, retryCount: parseInt(e.target.value) || 3 }
              })}
            />
          </div>
        </div>

        <div className="flex justify-end space-x-2 pt-4">
          <Button variant="outline" onClick={() => setIsAdding(false)}>取消</Button>
          <Button onClick={() => onSubmit(formData)} disabled={!formData.name || !formData.config.host || !formData.config.address}>
            添加节点
          </Button>
        </div>
      </div>
    );
  };

  const Iec104ServerForm = ({ onSubmit }: { onSubmit: (data: any) => void }) => {
    const [formData, setFormData] = useState({
      name: '',
      description: '',
      config: createDefaultConfig('IEC104_SERVER')
    });

    return (
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label>节点名称 *</Label>
            <Input
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="输入节点名称"
            />
          </div>
          <div>
            <Label>描述</Label>
            <Input
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="节点描述"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label>绑定地址 *</Label>
            <Input
              value={formData.config.bindAddress}
              onChange={(e) => setFormData({
                ...formData,
                config: { ...formData.config, bindAddress: e.target.value }
              })}
              placeholder="0.0.0.0"
            />
          </div>
          <div>
            <Label>端口 *</Label>
            <Input
              type="number"
              value={formData.config.port}
              onChange={(e) => setFormData({
                ...formData,
                config: { ...formData.config, port: parseInt(e.target.value) || 2404 }
              })}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label>最大连接数</Label>
            <Input
              type="number"
              value={formData.config.maxConnections}
              onChange={(e) => setFormData({
                ...formData,
                config: { ...formData.config, maxConnections: parseInt(e.target.value) || 10 }
              })}
            />
          </div>
          <div>
            <Label>公共地址</Label>
            <Input
              type="number"
              value={formData.config.commonAddress}
              onChange={(e) => setFormData({
                ...formData,
                config: { ...formData.config, commonAddress: parseInt(e.target.value) || 1 }
              })}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label>K值 (发送未确认帧)</Label>
            <Input
              type="number"
              value={formData.config.kValue}
              onChange={(e) => setFormData({
                ...formData,
                config: { ...formData.config, kValue: parseInt(e.target.value) || 12 }
              })}
            />
          </div>
          <div>
            <Label>W值 (接收未确认帧)</Label>
            <Input
              type="number"
              value={formData.config.wValue}
              onChange={(e) => setFormData({
                ...formData,
                config: { ...formData.config, wValue: parseInt(e.target.value) || 8 }
              })}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label>T0 超时(ms)</Label>
            <Input
              type="number"
              value={formData.config.t0Timeout}
              onChange={(e) => setFormData({
                ...formData,
                config: { ...formData.config, t0Timeout: parseInt(e.target.value) || 30000 }
              })}
            />
          </div>
          <div>
            <Label>T1 超时(ms)</Label>
            <Input
              type="number"
              value={formData.config.t1Timeout}
              onChange={(e) => setFormData({
                ...formData,
                config: { ...formData.config, t1Timeout: parseInt(e.target.value) || 15000 }
              })}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label>T2 超时(ms)</Label>
            <Input
              type="number"
              value={formData.config.t2Timeout}
              onChange={(e) => setFormData({
                ...formData,
                config: { ...formData.config, t2Timeout: parseInt(e.target.value) || 10000 }
              })}
            />
          </div>
          <div>
            <Label>T3 周期(ms)</Label>
            <Input
              type="number"
              value={formData.config.t3Timeout}
              onChange={(e) => setFormData({
                ...formData,
                config: { ...formData.config, t3Timeout: parseInt(e.target.value) || 20000 }
              })}
            />
          </div>
        </div>

        <div className="flex justify-end space-x-2 pt-4">
          <Button variant="outline" onClick={() => setIsAdding(false)}>取消</Button>
          <Button onClick={() => onSubmit(formData)} disabled={!formData.name}>
            添加节点
          </Button>
        </div>
      </div>
    );
  };

  const Iec104ClientForm = ({ onSubmit }: { onSubmit: (data: any) => void }) => {
    const [formData, setFormData] = useState({
      name: '',
      description: '',
      config: createDefaultConfig('IEC104_CLIENT')
    });

    return (
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label>节点名称 *</Label>
            <Input
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="输入节点名称"
            />
          </div>
          <div>
            <Label>描述</Label>
            <Input
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="节点描述"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label>主机地址 *</Label>
            <Input
              value={formData.config.host}
              onChange={(e) => setFormData({
                ...formData,
                config: { ...formData.config, host: e.target.value }
              })}
              placeholder="IP地址或域名"
            />
          </div>
          <div>
            <Label>端口 *</Label>
            <Input
              type="number"
              value={formData.config.port}
              onChange={(e) => setFormData({
                ...formData,
                config: { ...formData.config, port: parseInt(e.target.value) || 2404 }
              })}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label>公共地址</Label>
            <Input
              type="number"
              value={formData.config.commonAddress}
              onChange={(e) => setFormData({
                ...formData,
                config: { ...formData.config, commonAddress: parseInt(e.target.value) || 1 }
              })}
            />
          </div>
          <div>
            <Label>重连间隔(ms)</Label>
            <Input
              type="number"
              value={formData.config.reconnectInterval}
              onChange={(e) => setFormData({
                ...formData,
                config: { ...formData.config, reconnectInterval: parseInt(e.target.value) || 5000 }
              })}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label>K值 (发送未确认帧)</Label>
            <Input
              type="number"
              value={formData.config.kValue}
              onChange={(e) => setFormData({
                ...formData,
                config: { ...formData.config, kValue: parseInt(e.target.value) || 12 }
              })}
            />
          </div>
          <div>
            <Label>W值 (接收未确认帧)</Label>
            <Input
              type="number"
              value={formData.config.wValue}
              onChange={(e) => setFormData({
                ...formData,
                config: { ...formData.config, wValue: parseInt(e.target.value) || 8 }
              })}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label>T0 超时(ms)</Label>
            <Input
              type="number"
              value={formData.config.t0Timeout}
              onChange={(e) => setFormData({
                ...formData,
                config: { ...formData.config, t0Timeout: parseInt(e.target.value) || 30000 }
              })}
            />
          </div>
          <div>
            <Label>T1 超时(ms)</Label>
            <Input
              type="number"
              value={formData.config.t1Timeout}
              onChange={(e) => setFormData({
                ...formData,
                config: { ...formData.config, t1Timeout: parseInt(e.target.value) || 15000 }
              })}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label>T2 超时(ms)</Label>
            <Input
              type="number"
              value={formData.config.t2Timeout}
              onChange={(e) => setFormData({
                ...formData,
                config: { ...formData.config, t2Timeout: parseInt(e.target.value) || 10000 }
              })}
            />
          </div>
          <div>
            <Label>T3 周期(ms)</Label>
            <Input
              type="number"
              value={formData.config.t3Timeout}
              onChange={(e) => setFormData({
                ...formData,
                config: { ...formData.config, t3Timeout: parseInt(e.target.value) || 20000 }
              })}
            />
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={formData.config.autoReconnect}
              onChange={(e) => setFormData({
                ...formData,
                config: { ...formData.config, autoReconnect: e.target.checked }
              })}
              className="mr-2"
            />
            自动重连
          </label>
        </div>

        <div className="flex justify-end space-x-2 pt-4">
          <Button variant="outline" onClick={() => setIsAdding(false)}>取消</Button>
          <Button onClick={() => onSubmit(formData)} disabled={!formData.name || !formData.config.host}>
            添加节点
          </Button>
        </div>
      </div>
    );
  };

  const Iec61850ServerForm = ({ onSubmit }: { onSubmit: (data: any) => void }) => {
    const [formData, setFormData] = useState({
      name: '',
      description: '',
      config: createDefaultConfig('IEC61850_SERVER')
    });

    return (
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label>节点名称 *</Label>
            <Input
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="输入节点名称"
            />
          </div>
          <div>
            <Label>描述</Label>
            <Input
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="节点描述"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label>绑定地址 *</Label>
            <Input
              value={formData.config.bindAddress}
              onChange={(e) => setFormData({
                ...formData,
                config: { ...formData.config, bindAddress: e.target.value }
              })}
              placeholder="0.0.0.0"
            />
          </div>
          <div>
            <Label>MMS端口 *</Label>
            <Input
              type="number"
              value={formData.config.mmsPort}
              onChange={(e) => setFormData({
                ...formData,
                config: { ...formData.config, mmsPort: parseInt(e.target.value) || 102 }
              })}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label>GOOSE端口</Label>
            <Input
              type="number"
              value={formData.config.goosePort}
              onChange={(e) => setFormData({
                ...formData,
                config: { ...formData.config, goosePort: parseInt(e.target.value) || 0 }
              })}
            />
          </div>
          <div>
            <Label>SV端口</Label>
            <Input
              type="number"
              value={formData.config.svPort}
              onChange={(e) => setFormData({
                ...formData,
                config: { ...formData.config, svPort: parseInt(e.target.value) || 0 }
              })}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label>IED名称 *</Label>
            <Input
              value={formData.config.iedName}
              onChange={(e) => setFormData({
                ...formData,
                config: { ...formData.config, iedName: e.target.value }
              })}
              placeholder="IED设备名称"
            />
          </div>
          <div>
            <Label>最大连接数</Label>
            <Input
              type="number"
              value={formData.config.maxConnections}
              onChange={(e) => setFormData({
                ...formData,
                config: { ...formData.config, maxConnections: parseInt(e.target.value) || 10 }
              })}
            />
          </div>
        </div>

        <div>
          <Label>ICD文件路径</Label>
          <Input
            value={formData.config.icdFile}
            onChange={(e) => setFormData({
              ...formData,
              config: { ...formData.config, icdFile: e.target.value }
            })}
            placeholder="/path/to/device.icd"
          />
        </div>

        <div className="flex justify-end space-x-2 pt-4">
          <Button variant="outline" onClick={() => setIsAdding(false)}>取消</Button>
          <Button onClick={() => onSubmit(formData)} disabled={!formData.name || !formData.config.iedName}>
            添加节点
          </Button>
        </div>
      </div>
    );
  };

  const Iec61850ClientForm = ({ onSubmit }: { onSubmit: (data: any) => void }) => {
    const [formData, setFormData] = useState({
      name: '',
      description: '',
      config: createDefaultConfig('IEC61850_CLIENT')
    });

    return (
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label>节点名称 *</Label>
            <Input
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="输入节点名称"
            />
          </div>
          <div>
            <Label>描述</Label>
            <Input
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="节点描述"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label>主机地址 *</Label>
            <Input
              value={formData.config.host}
              onChange={(e) => setFormData({
                ...formData,
                config: { ...formData.config, host: e.target.value }
              })}
              placeholder="IP地址或域名"
            />
          </div>
          <div>
            <Label>MMS端口 *</Label>
            <Input
              type="number"
              value={formData.config.mmsPort}
              onChange={(e) => setFormData({
                ...formData,
                config: { ...formData.config, mmsPort: parseInt(e.target.value) || 102 }
              })}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label>IED名称 *</Label>
            <Input
              value={formData.config.iedName}
              onChange={(e) => setFormData({
                ...formData,
                config: { ...formData.config, iedName: e.target.value }
              })}
              placeholder="目标IED设备名称"
            />
          </div>
          <div>
            <Label>重连间隔(ms)</Label>
            <Input
              type="number"
              value={formData.config.reconnectInterval}
              onChange={(e) => setFormData({
                ...formData,
                config: { ...formData.config, reconnectInterval: parseInt(e.target.value) || 5000 }
              })}
            />
          </div>
        </div>

        <div>
          <Label>ICD文件路径</Label>
          <Input
            value={formData.config.icdFile}
            onChange={(e) => setFormData({
              ...formData,
              config: { ...formData.config, icdFile: e.target.value }
            })}
            placeholder="/path/to/target.icd"
          />
        </div>

        <div className="flex items-center space-x-2">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={formData.config.autoReconnect}
              onChange={(e) => setFormData({
                ...formData,
                config: { ...formData.config, autoReconnect: e.target.checked }
              })}
              className="mr-2"
            />
            自动重连
          </label>
        </div>

        <div className="flex justify-end space-x-2 pt-4">
          <Button variant="outline" onClick={() => setIsAdding(false)}>取消</Button>
          <Button onClick={() => onSubmit(formData)} disabled={!formData.name || !formData.config.host || !formData.config.iedName}>
            添加节点
          </Button>
        </div>
      </div>
    );
  };

  // Render protocol form based on selection
  const renderProtocolForm = () => {
    switch (selectedProtocol) {
      case 'MODBUS_TCP':
        return <ModbusTcpClientForm onSubmit={addNode} />;
      case 'MODBUS_RTU':
        return <ModbusRtuClientForm onSubmit={addNode} />;
      case 'MODBUS_TCP_SERVER':
        return <ModbusTcpServerForm onSubmit={addNode} />;
      case 'MODBUS_RTU_SERVER':
        return <ModbusRtuServerForm onSubmit={addNode} />;
      case 'DLT645_RTU':
        return <Dlt645RtuForm onSubmit={addNode} />;
      case 'DLT645_TCP':
        return <Dlt645TcpForm onSubmit={addNode} />;
      case 'IEC104_SERVER':
        return <Iec104ServerForm onSubmit={addNode} />;
      case 'IEC104_CLIENT':
        return <Iec104ClientForm onSubmit={addNode} />;
      case 'IEC61850_SERVER':
        return <Iec61850ServerForm onSubmit={addNode} />;
      case 'IEC61850_CLIENT':
        return <Iec61850ClientForm onSubmit={addNode} />;
      default:
        return <ModbusTcpClientForm onSubmit={addNode} />;
    }
  };

  const openViewDialog = (node: CommunicationNode) => {
    setViewingNode(node);
    setEditingNode(null);
    setIsEditMode(false);
    setDialogOpen(true);
  };

  const openEditDialog = (node: CommunicationNode) => {
    setEditingNode(node);
    setViewingNode(null);
    setIsEditMode(true);
    setDialogOpen(true);
  };

  const handleDialogClose = () => {
    setDialogOpen(false);
    setViewingNode(null);
    setEditingNode(null);
  };

  const handleSaveNode = (node: CommunicationNode) => {
    updateNode(node);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">通信节点配置</h3>
        <Button onClick={() => setIsAdding(!isAdding)} variant="outline">
          <Plus className="mr-2 h-4 w-4" />
          {isAdding ? '取消' : '添加节点'}
        </Button>
      </div>

      {isAdding && (
        <Card className="p-6">
          <CardHeader>
            <CardTitle>添加新节点</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="mb-4">
              <Label>选择协议类型 *</Label>
              <Select value={selectedProtocol} onValueChange={(value) => setSelectedProtocol(value as ProtocolType)}>
                <SelectTrigger>
                  <SelectValue placeholder="选择协议类型" />
                </SelectTrigger>
                <SelectContent>
                  <Tabs defaultValue="MODBUS">
                    <TabsList className="grid w-full grid-cols-4 mb-2">
                      <TabsTrigger value="MODBUS">MODBUS</TabsTrigger>
                      <TabsTrigger value="DLT645">DLT645</TabsTrigger>
                      <TabsTrigger value="IEC104">IEC104</TabsTrigger>
                      <TabsTrigger value="IEC61850">IEC61850</TabsTrigger>
                    </TabsList>
                    <TabsContent value="MODBUS">
                      <SelectItem value="MODBUS_TCP">MODBUS TCP 客户端</SelectItem>
                      <SelectItem value="MODBUS_RTU">MODBUS RTU 客户端</SelectItem>
                      <SelectItem value="MODBUS_TCP_SERVER">MODBUS TCP 服务端</SelectItem>
                      <SelectItem value="MODBUS_RTU_SERVER">MODBUS RTU 服务端</SelectItem>
                    </TabsContent>
                    <TabsContent value="DLT645">
                      <SelectItem value="DLT645_RTU">DLT645 RTU</SelectItem>
                      <SelectItem value="DLT645_TCP">DLT645 TCP</SelectItem>
                    </TabsContent>
                    <TabsContent value="IEC104">
                      <SelectItem value="IEC104_SERVER">IEC104 服务端</SelectItem>
                      <SelectItem value="IEC104_CLIENT">IEC104 客户端</SelectItem>
                    </TabsContent>
                    <TabsContent value="IEC61850">
                      <SelectItem value="IEC61850_SERVER">IEC61850 服务端</SelectItem>
                      <SelectItem value="IEC61850_CLIENT">IEC61850 客户端</SelectItem>
                    </TabsContent>
                  </Tabs>
                </SelectContent>
              </Select>
            </div>
            {renderProtocolForm()}
          </CardContent>
        </Card>
      )}

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">#</TableHead>
              <TableHead>节点名称</TableHead>
              <TableHead>协议类型</TableHead>
              <TableHead>描述</TableHead>
              <TableHead>状态</TableHead>
              <TableHead className="w-32">操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {nodes.map((node, index) => (
              <TableRow key={node.id}>
                <TableCell className="font-medium">{index + 1}</TableCell>
                <TableCell className="font-medium">{node.name}</TableCell>
                <TableCell>
                  <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                    {getProtocolDisplayName(node.protocolType)}
                  </span>
                </TableCell>
                <TableCell>{node.description || '-'}</TableCell>
                <TableCell>
                  <span className={`font-medium ${getStatusColor(node.status)}`}>
                    {node.status}
                  </span>
                </TableCell>
                <TableCell>
                  <div className="flex space-x-1">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => openViewDialog(node)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => openEditDialog(node)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteNode(node.id)}
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => moveNodeUp(index)}
                      disabled={index === 0}
                    >
                      <ArrowUp className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => moveNodeDown(index)}
                      disabled={index === nodes.length - 1}
                    >
                      <ArrowDown className="h-4 w-4" />
                    </Button>
                    <div className="relative">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => exportNode(node)}
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                      <label className="cursor-pointer">
                        <Upload className="h-4 w-4 opacity-0 absolute inset-0" />
                        <input
                          type="file"
                          accept=".json"
                          onChange={importNode}
                          className="hidden"
                        />
                      </label>
                    </div>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {nodes.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          暂无通信节点，请添加节点开始配置
        </div>
      )}

      {/* 节点配置弹窗 */}
      <NodeConfigDialog
        node={isEditMode ? editingNode! : viewingNode!}
        isOpen={dialogOpen}
        onClose={handleDialogClose}
        onSave={handleSaveNode}
        isEditMode={isEditMode}
      />
    </div>
  );
};

export default NodeConfig;