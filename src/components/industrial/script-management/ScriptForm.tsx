"use client";

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Save, X } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';

export interface Script {
  id: string;
  name: string;
  scriptContent: string;
  scriptType: 'FLOW';
  enabled?: boolean;
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
    scriptContent: '',
    scriptType: 'FLOW',
    enabled: true
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
            已配置的纯脚本变量名称：MODBUS TCP 服务端—电池健康度—SOH，MODBUS RTU 服务端—湿度—Humidity
          </div>
          <Textarea
            placeholder={`# 示例脚本
# 获取输入值
SOH = dev1.get("SOH")
Humidity = dev1.get("Humidity")

# 使用localvars存储临时变量
localvars["last_soh"] = SOH

# 使用globalvars设置全局状态
globalvars["system_status"] = "running"

# 设置输出值
dev1.set("MOTOR_CONTROL", SOH > 80)

# 或返回结果值（如果需要）
result = (SOH + Humidity) / 2`}
            value={formData.scriptContent}
            onChange={(e) => setFormData({ ...formData, scriptContent: e.target.value })}
            rows={12}
            className="font-mono text-sm"
          />
        </div>

        <div className="mb-4 flex items-center space-x-2">
          <Switch
            id="script-enabled"
            checked={formData.enabled !== false}
            onCheckedChange={(checked) => setFormData({ ...formData, enabled: checked })}
          />
          <Label htmlFor="script-enabled">启用脚本</Label>
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