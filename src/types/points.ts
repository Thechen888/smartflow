import { ProtocolType } from './protocols';

export interface BasePoint {
  id: string;
  name: string;
  nodeId: string;
  protocolType: ProtocolType;
  address: string;
  dataType: string;
  description?: string;
  enabled: boolean;
}

export interface InputPoint extends BasePoint {
  scanRate?: number;
  deadband?: number;
  scalingFactor?: number;
  offset?: number;
  unit?: string;
}

export interface OutputPoint extends BasePoint {
  defaultValue?: string | number | boolean;
  minValue?: number;
  maxValue?: number;
  scalingFactor?: number;
  offset?: number;
  unit?: string;
}

export interface ModbusInputPoint extends InputPoint {
  functionCode: 1 | 2 | 3 | 4;
  registerAddress: number;
  registerCount?: number;
  bitIndex?: number;
}

export interface ModbusOutputPoint extends OutputPoint {
  functionCode: 5 | 6 | 15 | 16;
  registerAddress: number;
  registerCount?: number;
  bitIndex?: number;
}

export interface Iec104Point extends BasePoint {
  informationObjectAddress: number;
  typeId: number;
  causeOfTransmission?: number;
}

export interface Iec61850Point extends BasePoint {
  logicalDeviceName: string;
  logicalNodeName: string;
  dataObjectName: string;
  attributeName?: string;
}

export interface Dlt645Point extends BasePoint {
  dataIdentifier: string;
  dataFormat: 'HEX' | 'BCD' | 'ASCII';
  dataLength: number;
}