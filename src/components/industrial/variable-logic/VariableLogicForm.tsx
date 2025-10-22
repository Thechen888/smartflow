"use client";

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Save, X, FileCode, Link, Settings } from 'lucide-react';
import { Label } from '@/components/ui/label';
import VariableAliasSelector, { VariableAlias } from './VariableAliasSelector';

interface InputPoint {
  id: string;
  name: string;
  nodeId: string;
  protocolType: string;
  address: string;
  dataType: string;
}

interface OutputPoint {
  id: string;
  name: string;
  nodeId: string;
  protocolType: string;
  address: string;
  dataType: string;
}

interface VariableCategory {
  id: string;
  name: string;
  description?: string;
}

export interface VariableLogic {
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

interface VariableLogicFormProps {
  isEditing: boolean;
  variable: Omit<VariableLogic, 'id'> | VariableLogic | null;
  categories: VariableCategory[];
  inputPoints: InputPoint[];
  outputPoints: OutputPoint[];
  variables: VariableLogic[];
  onSave: (variable: Omit<VariableLogic, 'id'> | VariableLogic) => void;
  onCancel: () => void;
}

const VariableLogicForm: React.FC<VariableLogicFormProps> = ({
  isEditing,
  variable,
  categories,
  inputPoints,
  outputPoints,
  variables,
  onSave,
  onCancel
}) => {
  const [formData, setFormData] = useState<Omit<VariableLogic, 'id'> | VariableLogic>(variable || {
    name: '',
    resultType: 'FLOAT',
    logicType: 'GENERATE',
    scriptContent: '',
    executeRate: 1000,
    categoryId: categories[0]?.id || 'default',
    description: '',
    enabled: true
  });

  const [aliases, setAliases] = useState<VariableAlias[]>([]);

  const getScriptExamples = () => {
    const examples = {
      GENERATE: `# 生成新变量示例
# 使用已定义的别名获取值
temp1 = dev1.get("TEMP1")
temp2 = dev1.get("TEMP2")

# 使用localvars在当前脚本中存储临时变量
localvars["last_temp"] = temp1
localvars["temp_history"] = localvars.get("temp_history", []) + [temp1, temp2]

# 使用globalvars在全局共享变量
globalvars["system_status"] = "running"

# 计算平均温度
result = (temp1 + temp2) / 2

# 或返回复杂对象
result = {
    "avg_temp": (temp1 + temp2) / 2,
    "max_temp": max(temp1, temp2),
    "min_temp": min(temp1, temp2),
    "status": globalvars.get("system_status", "unknown")
}`,
      BIND_OUTPUT: `# 绑定输出变量示例
# 获取输入值
input_value = dev1.get("INPUT_TEMP")

# 使用localvars存储中间计算结果
localvars["filtered_value"] = localvars.get("filtered_value", 0) * 0.8 + input_value * 0.2

# 使用globalvars获取全局状态
system_ready = globalvars.get("system_ready", False)

# 简单转换
output_value = localvars["filtered_value"] > 100 and system_ready

# 设置输出变量
dev1.set("MOTOR_CONTROL", output_value)

# 注意：此类型不需要返回result变量`,
      SCRIPT_ONLY: `# 纯脚本示例（不返回值）
# 获取多个输入值
temp = dev1.get("TEMPERATURE")
pressure = dev1.get("PRESSURE")
flow = dev1.get("FLOW_RATE")

# 使用localvars记录历史数据
localvars["temp_history"] = localvars.get("temp_history", []) + [temp]
localvars["pressure_history"] = localvars.get("pressure_history", []) + [pressure]

# 使用globalvars设置全局状态
if temp > 150 and pressure > 10:
    # 触发报警
    dev1.set("ALARM_HIGH", True)
    # 设置全局报警状态
    globalvars["high_alarm_active"] = True
    # 记录日志
    print(f"High temp: {temp}, High pressure: {pressure}")
elif flow < 5:
    # 调节阀门
    dev1.set("VALVE_POSITION", 80)
    # 更新全局状态
    globalvars["valve_position"] = 80
    
# 此类型不返回任何值，仅执行操作`
    };

    return examples[formData.logicType] || examples.GENERATE;
  };

  const handleSave = () => {
    onSave(formData);
  };

  return (
    <Card className="p-6 bg-gradient-to-r from-purple-50 to-blue-50">
      <CardHeader>
        <CardTitle>{isEditing ? '编辑变量逻辑' : '添加新变量逻辑'}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <Label>变量名称 *</Label>
            <Input
              placeholder="变量名称"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
          </div>
          <div>
            <Label>分类 *</Label>
            <Select
              value={formData.categoryId}
              onValueChange={(value) => setFormData({ ...formData, categoryId: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="选择分类" />
              </SelectTrigger>
              <SelectContent>
                {categories.map(category => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <Label>逻辑类型 *</Label>
            <Select
              value={formData.logicType}
              onValueChange={(value) => setFormData({ 
                ...formData, 
                logicType: value as 'GENERATE' | 'BIND_OUTPUT' | 'SCRIPT_ONLY',
                scriptContent: ''
              })}
            >
              <SelectTrigger>
                <SelectValue placeholder="逻辑类型" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="GENERATE">
                  <div className="flex items-center">
                    <Settings className="mr-2 h-4 w-4" />
                    生成变量
                  </div>
                </SelectItem>
                <SelectItem value="BIND_OUTPUT">
                  <div className="flex items-center">
                    <Link className="mr-2 h-4 w-4" />
                    绑定输出值
                  </div>
                </SelectItem>
                <SelectItem value="SCRIPT_ONLY">
                  <div className="flex items-center">
                    <FileCode className="mr-2 h-4 w-4" />
                    纯脚本（不返回）
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
          {formData.logicType !== 'SCRIPT_ONLY' && (
            <div>
              <Label>结果类型 *</Label>
              <Select
                value={formData.resultType}
                onValueChange={(value) => setFormData({ ...formData, resultType: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="结果类型" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="BOOLEAN">BOOLEAN</SelectItem>
                  <SelectItem value="INT16">INT16</SelectItem>
                  <SelectItem value="INT32">INT32</SelectItem>
                  <SelectItem value="FLOAT">FLOAT</SelectItem>
                  <SelectItem value="STRING">STRING</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
        </div>

        {formData.logicType !== 'SCRIPT_ONLY' && (
          <div className="mb-4">
            <Label>执行频率(ms)</Label>
            <Input
              type="number"
              value={formData.executeRate}
              onChange={(e) => setFormData({ ...formData, executeRate: parseInt(e.target.value) || 1000 })}
            />
          </div>
        )}

        <div className="mb-4">
          <Label>描述</Label>
          <Input
            placeholder="变量描述"
            value={formData.description || ''}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          />
        </div>

        {/* 变量别名配置 */}
        <VariableAliasSelector
          inputPoints={inputPoints}
          outputPoints={outputPoints}
          categories={categories}
          variables={variables}
          aliases={aliases}
          onAliasesChange={setAliases}
        />

        {/* 脚本编辑器 */}
        <div className="mb-4">
          <Label>Python脚本 *</Label>
          <div className="text-xs text-gray-500 mb-2">
            {formData.logicType === 'GENERATE' && '通过 dev1.get("别名") 获取变量值，结果赋值给 result 变量'}
            {formData.logicType === 'BIND_OUTPUT' && '通过 dev1.get("别名") 获取输入值，通过 dev1.set("输出变量", 值) 设置输出值'}
            {formData.logicType === 'SCRIPT_ONLY' && '通过 dev1.get("别名") 获取变量值，执行任意逻辑，无需返回值'}
          </div>
          <div className="text-xs text-blue-600 mb-2 font-medium">
            已定义的别名: {aliases.length > 0 ? aliases.map(a => `"${a.alias}"`).join(', ') : '暂无别名'}
          </div>
          <div className="text-xs text-green-600 mb-2 font-medium">
            可用字典: localvars (当前脚本), globalvars (全局共享)
          </div>
          <Textarea
            placeholder={getScriptExamples()}
            value={formData.scriptContent}
            onChange={(e) => setFormData({ ...formData, scriptContent: e.target.value })}
            rows={8}
            className="font-mono text-sm"
          />
        </div>

        <div className="flex justify-end space-x-2">
          <Button variant="outline" onClick={onCancel}>
            <X className="mr-1 h-4 w-4" />
            取消
          </Button>
          <Button 
            onClick={handleSave} 
            disabled={!formData.name || !formData.scriptContent}
          >
            <Save className="mr-1 h-4 w-4" />
            {isEditing ? '保存更改' : '添加变量'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default VariableLogicForm;