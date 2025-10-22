"use client";

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Save, X } from 'lucide-react';
import { Label } from '@/components/ui/label';

export interface Script {
  id: string;
  name: string;
  scriptContent: string;
}

interface ScriptFormProps {
  isEditing: boolean;
  script: Omit<Script, 'id'> | Script | null;
  onSave: (script: Omit<Script, 'id'> | Script) => void;
  onCancel: () => void;
}

const ScriptForm: React.FC<ScriptFormProps> = ({
  isEditing,
  script,
  onSave,
  onCancel
}) => {
  const [formData, setFormData] = useState<Omit<Script, 'id'> | Script>(script || {
    name: '',
    scriptContent: ''
  });

  const handleSave = () => {
    onSave(formData);
  };

  return (
    <Card className="p-6 bg-gradient-to-r from-purple-50 to-blue-50">
      <CardHeader>
        <CardTitle>{isEditing ? '编辑脚本' : '添加新脚本'}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="mb-4">
          <Label>脚本名称 *</Label>
          <Input
            placeholder="脚本名称"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          />
        </div>

        <div className="mb-4">
          <Label>Python脚本 *</Label>
          <div className="text-xs text-gray-500 mb-2">
            通过 dev1.get("别名") 获取变量值，通过 dev1.set("输出变量", 值) 设置输出值
          </div>
          <div className="text-xs text-green-600 mb-2 font-medium">
            可用字典: localvars (当前脚本), globalvars (全局共享)
          </div>
          <Textarea
            placeholder={`# 示例脚本
# 获取输入值
temp1 = dev1.get("TEMP1")
temp2 = dev1.get("TEMP2")

# 使用localvars存储临时变量
localvars["last_temp"] = temp1

# 使用globalvars设置全局状态
globalvars["system_status"] = "running"

# 设置输出值
dev1.set("MOTOR_CONTROL", temp1 > 100)

# 或返回结果值（如果需要）
result = (temp1 + temp2) / 2`}
            value={formData.scriptContent}
            onChange={(e) => setFormData({ ...formData, scriptContent: e.target.value })}
            rows={12}
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
            {isEditing ? '保存更改' : '添加脚本'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ScriptForm;