export type ProtocolType = 
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

export interface BaseProtocolConfig {
  timeout: number;
  retryCount: number;
}

export interface ModbusTcpClientConfig extends BaseProtocolConfig {
  host: string;
  port: number;
  slaveId: number;
  connectionMode: 'TCP' | 'TCP_RTU_OVER_TCP';
}

export interface ModbusTcpServerConfig extends BaseProtocolConfig {
  port: number;
  slaveId: number;
  bindAddress: string;
}

export interface ModbusRtuClientConfig extends BaseProtocolConfig {
  portName: string;
  baudRate: number;
  dataBits: number;
  stopBits: number;
  parity: 'NONE' | 'ODD' | 'EVEN';
  slaveId: number;
}

export interface ModbusRtuServerConfig extends BaseProtocolConfig {
  portName: string;
  baudRate: number;
  dataBits: number;
  stopBits: number;
  parity: 'NONE' | 'ODD' | 'EVEN';
  slaveId: number;
}

export interface Dlt645RtuConfig extends BaseProtocolConfig {
  portName: string;
  baudRate: number;
  dataBits: number;
  stopBits: number;
  parity: 'NONE' | 'ODD' | 'EVEN';
  deviceAddress: string;
}

export interface Dlt645TcpConfig extends BaseProtocolConfig {
  host: string;
  port: number;
  deviceAddress: string;
}

export interface Iec104ServerConfig extends BaseProtocolConfig {
  port: number;
  bindAddress: string;
  commonAddress: number;
  maxConnections: number;
}

export interface Iec104ClientConfig extends BaseProtocolConfig {
  host: string;
  port: number;
  commonAddress: number;
  originatorAddress: number;
}

export interface Iec61850ServerConfig extends BaseProtocolConfig {
  port: number;
  bindAddress: string;
  iedName: string;
  maxConnections: number;
}

export interface Iec61850ClientConfig extends BaseProtocolConfig {
  host: string;
  port: number;
  iedName: string;
}

export type ProtocolConfig = 
  | ModbusTcpClientConfig 
  | ModbusTcpServerConfig
  | ModbusRtuClientConfig 
  | ModbusRtuServerConfig
  | Dlt645RtuConfig 
  | Dlt645TcpConfig 
  | Iec104ServerConfig 
  | Iec104ClientConfig 
  | Iec61850ServerConfig 
  | Iec61850ClientConfig;