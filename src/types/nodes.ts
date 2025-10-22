import { ProtocolType, ProtocolConfig } from './protocols';

export interface BaseNode {
  id: string;
  name: string;
  protocolType: ProtocolType;
  description?: string;
  enabled: boolean;
  status: 'ONLINE' | 'OFFLINE' | 'ERROR' | 'CONNECTING';
}

export interface ModbusTcpClientNode extends BaseNode {
  protocolType: 'MODBUS_TCP';
  config: import('./protocols').ModbusTcpClientConfig;
}

export interface ModbusTcpServerNode extends BaseNode {
  protocolType: 'MODBUS_TCP_SERVER';
  config: import('./protocols').ModbusTcpServerConfig;
}

export interface ModbusRtuClientNode extends BaseNode {
  protocolType: 'MODBUS_RTU';
  config: import('./protocols').ModbusRtuClientConfig;
}

export interface ModbusRtuServerNode extends BaseNode {
  protocolType: 'MODBUS_RTU_SERVER';
  config: import('./protocols').ModbusRtuServerConfig;
}

export interface Dlt645RtuNode extends BaseNode {
  protocolType: 'DLT645_RTU';
  config: import('./protocols').Dlt645RtuConfig;
}

export interface Dlt645TcpNode extends BaseNode {
  protocolType: 'DLT645_TCP';
  config: import('./protocols').Dlt645TcpConfig;
}

export interface Iec104ServerNode extends BaseNode {
  protocolType: 'IEC104_SERVER';
  config: import('./protocols').Iec104ServerConfig;
}

export interface Iec104ClientNode extends BaseNode {
  protocolType: 'IEC104_CLIENT';
  config: import('./protocols').Iec104ClientConfig;
}

export interface Iec61850ServerNode extends BaseNode {
  protocolType: 'IEC61850_SERVER';
  config: import('./protocols').Iec61850ServerConfig;
}

export interface Iec61850ClientNode extends BaseNode {
  protocolType: 'IEC61850_CLIENT';
  config: import('./protocols').Iec61850ClientConfig;
}

export type Node = 
  | ModbusTcpClientNode 
  | ModbusTcpServerNode
  | ModbusRtuClientNode 
  | ModbusRtuServerNode
  | Dlt645RtuNode 
  | Dlt645TcpNode 
  | Iec104ServerNode 
  | Iec104ClientNode 
  | Iec61850ServerNode 
  | Iec61850ClientNode;