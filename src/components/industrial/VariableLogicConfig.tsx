"use client";

import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import VariableCategoryManager from './variable-logic/VariableCategoryManager';
import VariableLogicForm from './variable-logic/VariableLogicForm';
import VariableLogicList from './variable-logic/VariableLogicList';

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
  | 'IEC61850_CLIENT';

interface InputPoint {
  id: string;
  name: string;
  nodeId: string;
  protocolType: ProtocolType;
  address: string;
  dataType: string;
}

interface OutputPoint {
  id: string;
  name: string;
  nodeId: string;
  protocolType: ProtocolType;
  address: string;
  dataType: string;
}

interface VariableCategory {
  id: string;
  name: string;
  description?: string;
}

interface VariableLogic {
  id: string;
  name: string;
  resultType: string;
  logicType: 'GENERATE' | 'BIND_OUTPUT' | 'SCRIPT_ONLY';
  inputVariableId?: string;
  outputVariableId?: string;
  scriptContent: string;
  executeRate: number;
  categoryId: string;
  description?: string;
  enabled: boolean;
}

const VariableLogicConfig = () => {
  const [variables, setVariables] = useState<VariableLogic[]>([
    {
      id: '1',
      name: '平均温度',
      resultType: 'FLOAT',
      logicType: 'GENERATE',
      scriptContent: '# 计算两个温度传感器的平均值\nTEMP1 = dev1.get("TEMP1")\nTEMP2 = dev1.get("TEMP2")\nresult = (TEMP1 + TEMP2) / 2',
      executeRate: 1000,
      categoryId: 'temp-category',
      description: '计算两个温度传感器的平均值',
      enabled: true
    },
    {
      id: '2',
      name: '电机控制',
      resultType: 'BOOLEAN',
      logicType: 'BIND_OUTPUT',
      scriptContent: '# 控制电机启停\ninput_temp = dev1.get("TEMPERATURE")\n# 如果温度过高，停止电机\ndev1.set("MOTOR_CONTROL", input_temp <= 100)',
      executeRate: 1000,
      categoryId: 'control-category',
      description: '根据温度控制电机',
      enabled: true
    },
    {
      id: '3',
      name: '报警处理',
      resultType: 'STRING',
      logicType: 'SCRIPT_ONLY',
      scriptContent: '# 报警处理脚本\npressure = dev1.get("PRESSURE")\ntemperature = dev1.get("TEMPERATURE")\n\nif pressure > 100:\n    dev1.set("HIGH_PRESSURE_ALARM", True)\n    print(f"High pressure alarm: {pressure}")\n\nif temperature > 150:\n    dev1.set("HIGH_TEMP_ALARM", True)\n    print(f"High temperature alarm: {temperature}")',
      executeRate: 5000,
      categoryId: 'alarm-category',
      description: '处理高压和高温报警',
      enabled: true
    }
  ]);

  const [categories, setCategories] = useState<VariableCategory[]>([
    { id: 'temp-category', name: '温度计算', description: '温度相关的计算逻辑' },
    { id: 'control-category', name: '控制输出', description: '控制命令输出逻辑' },
    { id: 'alarm-category', name: '报警处理', description: '报警和事件处理逻辑' }
  ]);

  const [isAdding, setIsAdding] = useState(false);
  const [isEditing, setIsEditing] = useState<VariableLogic | null>(null);
  const [activeTab, setActiveTab] = useState('all');

  // 模拟输入点位数据（实际应该从全局状态获取）
  const [inputPoints, setInputPoints] = useState<InputPoint[]>([
    { id: 'input-1', name: '温度传感器1', nodeId: 'modbus-tcp-1', protocolType: 'MODBUS_TCP', address: '40001', dataType: 'FLOAT' },
    { id: 'input-2', name: '温度传感器2', nodeId: 'modbus-tcp-1', protocolType: 'MODBUS_TCP', address: '40002', dataType: 'FLOAT' },
    { id: 'input-3', name: '压力传感器', nodeId: 'iec61850-client-1', protocolType: 'IEC61850_CLIENT', address: 'LD1/LLN0.MX.Press', dataType: 'FLOAT32' },
    { id: 'input-4', name: '流量计', nodeId: 'dlt645-tcp-1', protocolType: 'DLT645_TCP', address: '000000000004', dataType: 'FLOAT' }
  ]);

  // 模拟输出点位数据（实际应该从全局状态获取）
  const [outputPoints, setOutputPoints] = useState<OutputPoint[]>([
    { id: '1', name: '电机启停', nodeId: 'modbus-tcp-server-1', protocolType: 'MODBUS_TCP_SERVER', address: '00001', dataType: 'BOOLEAN' },
    { id: '2', name: '高压报警', nodeId: 'modbus-tcp-server-1', protocolType: 'MODBUS_TCP_SERVER', address: '00002', dataType: 'BOOLEAN' },
    { id: '3', name: '高温报警', nodeId: 'modbus-tcp-server-1', protocolType: 'MODBUS_TCP_SERVER', address: '00003', dataType: 'BOOLEAN' }
  ]);

  // 计算每个分类的变量数量
  const variableCounts = variables.reduce((acc, variable) => {
    acc[variable.categoryId] = (acc[variable.categoryId] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const addVariable = (variable: Omit<VariableLogic, 'id'>) => {
    const newVariable: VariableLogic = {
      ...variable,
      id: Date.now().toString()
    };
    setVariables([...variables, newVariable]);
    setIsAdding(false);
  };

  const updateVariable = (updatedVariable: VariableLogic) => {
    setVariables(variables.map(v => v.id === updatedVariable.id ? updatedVariable : v));
    setIsEditing(null);
  };

  const deleteVariable = (id: string) => {
    setVariables(variables.filter(variable => variable.id !== id));
  };

  const addCategory = (category: Omit<VariableCategory, 'id'>) => {
    const newCategory: VariableCategory = {
      ...category,
      id: Date.now().toString()
    };
    setCategories([...categories, newCategory]);
  };

  const deleteCategory = (id: string) => {
    setCategories(categories.filter(cat => cat.id !== id));
    // 将该分类下的变量移动到默认分类或第一个分类
    const defaultCategoryId = categories[0]?.id || 'default';
    setVariables(variables.map(variable => 
      variable.categoryId === id ? { ...variable, categoryId: defaultCategoryId } : variable
    ));
  };

  // 过滤变量基于当前tab
  const filteredVariables = activeTab === 'all' 
    ? variables 
    : variables.filter(v => v.categoryId === activeTab);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">中间变量逻辑配置</h3>
        <Button onClick={() => setIsAdding(!isAdding)} variant="outline">
          <Plus className="mr-2 h-4 w-4" />
          {isAdding ? '取消' : '添加变量'}
        </Button>
      </div>

      {/* 分类管理 */}
      <VariableCategoryManager
        categories={categories}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onAddCategory={addCategory}
        onDeleteCategory={deleteCategory}
        variableCounts={variableCounts}
      />

      {/* 添加/编辑变量表单 */}
      {(isAdding || isEditing) && (
        <VariableLogicForm
          isEditing={!!isEditing}
          variable={isEditing || null}
          categories={categories}
          inputPoints={inputPoints}
          outputPoints={outputPoints}
          variables={variables}
          onSave={isEditing ? updateVariable : addVariable}
          onCancel={() => {
            setIsAdding(false);
            setIsEditing(null);
          }}
        />
      )}

      {/* 变量列表 */}
      {!isAdding && !isEditing && (
        <Card>
          <VariableLogicList
            variables={filteredVariables}
            categories={categories}
            onEdit={setIsEditing}
            onDelete={deleteVariable}
            inputPoints={inputPoints}
            outputPoints={outputPoints}
          />
        </Card>
      )}

      {filteredVariables.length === 0 && !isAdding && !isEditing && (
        <div className="text-center py-8 text-gray-500">
          {activeTab === 'all' ? '暂无中间变量，请添加变量开始配置' : `分类 "${categories.find(c => c.id === activeTab)?.name}" 中暂无变量`}
        </div>
      )}
    </div>
  );
};

export default VariableLogicConfig;