"use client";

import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import ScriptForm from './script-management/ScriptForm';
import ScriptList from './script-management/ScriptList';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface Script {
  id: string;
  name: string;
  scriptContent: string;
  scriptType: 'CYCLIC' | 'FLOW';
  executeRate?: number;
  priority?: number;
}

const ScriptManagement = () => {
  const [scripts, setScripts] = useState<Script[]>([
    {
      id: '1',
      name: '平均温度计算',
      scriptContent: '# 计算两个温度传感器的平均值\nTEMP1 = dev1.get("TEMP1")\nTEMP2 = dev1.get("TEMP2")\nresult = (TEMP1 + TEMP2) / 2',
      scriptType: 'CYCLIC',
      executeRate: 1000
    },
    {
      id: '2',
      name: '电机控制逻辑',
      scriptContent: '# 控制电机启停\ninput_temp = dev1.get("TEMPERATURE")\n# 如果温度过高，停止电机\ndev1.set("MOTOR_CONTROL", input_temp <= 100)',
      scriptType: 'FLOW',
      priority: 1
    },
    {
      id: '3',
      name: '报警处理脚本',
      scriptContent: '# 报警处理脚本\npressure = dev1.get("PRESSURE")\ntemperature = dev1.get("TEMPERATURE")\n\nif pressure > 100:\n    dev1.set("HIGH_PRESSURE_ALARM", True)\n    print(f"High pressure alarm: {pressure}")\n\nif temperature > 150:\n    dev1.set("HIGH_TEMP_ALARM", True)\n    print(f"High temperature alarm: {temperature}")',
      scriptType: 'FLOW',
      priority: 2
    }
  ]);

  const [showForm, setShowForm] = useState(false);
  const [editingScript, setEditingScript] = useState<Script | null>(null);
  const [activeTab, setActiveTab] = useState<'CYCLIC' | 'FLOW'>('CYCLIC');

  const cyclicScripts = scripts.filter(script => script.scriptType === 'CYCLIC');
  const flowScripts = scripts.filter(script => script.scriptType === 'FLOW');

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

  // Priority management functions - now based on array position
  const movePriorityUp = (id: string) => {
    const scriptIndex = flowScripts.findIndex(s => s.id === id);
    if (scriptIndex > 0) {
      const newScripts = [...scripts];
      const targetIndex = newScripts.findIndex(s => s.id === flowScripts[scriptIndex - 1].id);
      const currentIndex = newScripts.findIndex(s => s.id === id);
      [newScripts[targetIndex], newScripts[currentIndex]] = [newScripts[currentIndex], newScripts[targetIndex]];
      setScripts(newScripts);
    }
  };

  const movePriorityDown = (id: string) => {
    const scriptIndex = flowScripts.findIndex(s => s.id === id);
    if (scriptIndex < flowScripts.length - 1) {
      const newScripts = [...scripts];
      const targetIndex = newScripts.findIndex(s => s.id === flowScripts[scriptIndex + 1].id);
      const currentIndex = newScripts.findIndex(s => s.id === id);
      [newScripts[currentIndex], newScripts[targetIndex]] = [newScripts[targetIndex], newScripts[currentIndex]];
      setScripts(newScripts);
    }
  };

  const moveToTop = (id: string) => {
    const newScripts = scripts.filter(s => s.scriptType !== 'FLOW');
    const targetScript = scripts.find(s => s.id === id);
    const otherFlowScripts = flowScripts.filter(s => s.id !== id);
    if (targetScript) {
      newScripts.push(targetScript, ...otherFlowScripts);
    } else {
      newScripts.push(...flowScripts);
    }
    setScripts(newScripts);
  };

  const moveToBottom = (id: string) => {
    const newScripts = scripts.filter(s => s.scriptType !== 'FLOW');
    const targetScript = scripts.find(s => s.id === id);
    const otherFlowScripts = flowScripts.filter(s => s.id !== id);
    if (targetScript) {
      newScripts.push(...otherFlowScripts, targetScript);
    } else {
      newScripts.push(...flowScripts);
    }
    setScripts(newScripts);
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

      {/* Script type tabs */}
      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'CYCLIC' | 'FLOW')}>
        <TabsList>
          <TabsTrigger value="CYCLIC">循环脚本</TabsTrigger>
          <TabsTrigger value="FLOW">流脚本</TabsTrigger>
        </TabsList>
      </Tabs>

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
      ) else (
        <Card>
          <ScriptList
            scripts={activeTab === 'CYCLIC' ? cyclicScripts : flowScripts}
            onEdit={editScript}
            onDelete={deleteScript}
            scriptType={activeTab}
            onMoveUp={movePriorityUp}
            onMoveDown={movePriorityDown}
            onMoveToTop={moveToTop}
            onMoveToBottom={moveToBottom}
          />
        </Card>
      )}

      {scripts.filter(s => s.scriptType === activeTab).length === 0 && !showForm && (
        <div className="text-center py-8 text-gray-500">
          {activeTab === 'CYCLIC' ? '暂无循环脚本，请添加循环脚本开始配置' : '暂无流脚本，请添加流脚本开始配置'}
        </div>
      )}
    </div>
  );
};

export default ScriptManagement;