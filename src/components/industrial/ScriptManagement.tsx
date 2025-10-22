"use client";

import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import ScriptForm from './script-management/ScriptForm';
import ScriptList from './script-management/ScriptList';

interface Script {
  id: string;
  name: string;
  scriptContent: string;
}

const ScriptManagement = () => {
  const [scripts, setScripts] = useState<Script[]>([
    {
      id: '1',
      name: '平均温度计算',
      scriptContent: '# 计算两个温度传感器的平均值\nTEMP1 = dev1.get("TEMP1")\nTEMP2 = dev1.get("TEMP2")\nresult = (TEMP1 + TEMP2) / 2'
    },
    {
      id: '2',
      name: '电机控制逻辑',
      scriptContent: '# 控制电机启停\ninput_temp = dev1.get("TEMPERATURE")\n# 如果温度过高，停止电机\ndev1.set("MOTOR_CONTROL", input_temp <= 100)'
    },
    {
      id: '3',
      name: '报警处理脚本',
      scriptContent: '# 报警处理脚本\npressure = dev1.get("PRESSURE")\ntemperature = dev1.get("TEMPERATURE")\n\nif pressure > 100:\n    dev1.set("HIGH_PRESSURE_ALARM", True)\n    print(f"High pressure alarm: {pressure}")\n\nif temperature > 150:\n    dev1.set("HIGH_TEMP_ALARM", True)\n    print(f"High temperature alarm: {temperature}")'
    }
  ]);

  const [showForm, setShowForm] = useState(false);
  const [editingScript, setEditingScript] = useState<Script | null>(null);

  const addScript = (script: Omit<Script, 'id'>) => {
    const newScript: Script = {
      ...script,
      id: Date.now().toString()
    };
    setScripts([...scripts, newScript]);
    setShowForm(false);
  };

  const updateScript = (updatedScript: Script) => {
    setScripts(scripts.map(s => s.id === updatedScript.id ? updatedScript : s));
    setShowForm(false);
    setEditingScript(null);
  };

  const deleteScript = (id: string) => {
    setScripts(scripts.filter(script => script.id !== id));
  };

  const editScript = (script: Script) => {
    setEditingScript(script);
    setShowForm(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">脚本管理</h3>
        <Button onClick={() => setShowForm(true)} variant="outline">
          <Plus className="mr-2 h-4 w-4" />
          添加脚本
        </Button>
      </div>

      {showForm ? (
        <ScriptForm
          isEditing={!!editingScript}
          script={editingScript}
          onSave={editingScript ? updateScript : addScript}
          onCancel={() => {
            setShowForm(false);
            setEditingScript(null);
          }}
        />
      ) : (
        <Card>
          <ScriptList
            scripts={scripts}
            onEdit={editScript}
            onDelete={deleteScript}
          />
        </Card>
      )}

      {scripts.length === 0 && !showForm && (
        <div className="text-center py-8 text-gray-500">
          暂无脚本，请添加脚本开始配置
        </div>
      )}
    </div>
  );
};

export default ScriptManagement;