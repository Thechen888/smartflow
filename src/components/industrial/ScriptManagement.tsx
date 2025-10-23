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
  const flowScripts = scripts
    .filter(script => script.scriptType === 'FLOW')
    .sort((a, b) => (a.priority || 0) - (b.priority || 0));

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

  // Priority management functions - using positive integers starting from 1
  const movePriorityUp = (id: string) => {
    const flowScriptsSorted = scripts
      .filter(script => script.scriptType === 'FLOW')
      .sort((a, b) => (a.priority || 0) - (b.priority || 0));
    
    const scriptIndex = flowScriptsSorted.findIndex(s => s.id === id);
    if (scriptIndex > 0) {
      // Swap priorities with the script above
      const newScripts = scripts.map(script => {
        if (script.id === id) {
          return { ...script, priority: flowScriptsSorted[scriptIndex - 1].priority };
        } else if (script.id === flowScriptsSorted[scriptIndex - 1].id) {
          return { ...script, priority: flowScriptsSorted[scriptIndex].priority };
        }
        return script;
      });
      setScripts(newScripts);
    }
  };

  const movePriorityDown = (id: string) => {
    const flowScriptsSorted = scripts
      .filter(script => script.scriptType === 'FLOW')
      .sort((a, b) => (a.priority || 0) - (b.priority || 0));
    
    const scriptIndex = flowScriptsSorted.findIndex(s => s.id === id);
    if (scriptIndex < flowScriptsSorted.length - 1) {
      // Swap priorities with the script below
      const newScripts = scripts.map(script => {
        if (script.id === id) {
          return { ...script, priority: flowScriptsSorted[scriptIndex + 1].priority };
        } else if (script.id === flowScriptsSorted[scriptIndex + 1].id) {
          return { ...script, priority: flowScriptsSorted[scriptIndex].priority };
        }
        return script;
      });
      setScripts(newScripts);
    }
  };

  const moveToTop = (id: string) => {
    const flowScriptsSorted = scripts
      .filter(script => script.scriptType === 'FLOW')
      .sort((a, b) => (a.priority || 0) - (b.priority || 0));
    
    if (flowScriptsSorted.length === 0) return;
    
    // Find the minimum priority value
    const minPriority = Math.min(...flowScriptsSorted.map(s => s.priority || 1));
    
    // Set this script to have the minimum priority
    const newScripts = scripts.map(script => {
      if (script.id === id) {
        return { ...script, priority: minPriority };
      } else if (script.scriptType === 'FLOW' && script.priority !== undefined) {
        // Adjust other priorities to maintain order
        const currentIndex = flowScriptsSorted.findIndex(s => s.id === script.id);
        const targetIndex = flowScriptsSorted.findIndex(s => s.id === id);
        if (currentIndex < targetIndex) {
          return { ...script, priority: (script.priority || 1) + 1 };
        }
      }
      return script;
    });
    setScripts(newScripts);
  };

  const moveToBottom = (id: string) => {
    const flowScriptsSorted = scripts
      .filter(script => script.scriptType === 'FLOW')
      .sort((a, b) => (a.priority || 0) - (b.priority || 0));
    
    if (flowScriptsSorted.length === 0) return;
    
    // Find the maximum priority value
    const maxPriority = Math.max(...flowScriptsSorted.map(s => s.priority || 1));
    
    // Set this script to have the maximum priority
    const newScripts = scripts.map(script => {
      if (script.id === id) {
        return { ...script, priority: maxPriority };
      } else if (script.scriptType === 'FLOW' && script.priority !== undefined) {
        // Adjust other priorities to maintain order
        const currentIndex = flowScriptsSorted.findIndex(s => s.id === script.id);
        const targetIndex = flowScriptsSorted.findIndex(s => s.id === id);
        if (currentIndex > targetIndex) {
          return { ...script, priority: (script.priority || 1) - 1 };
        }
      }
      return script;
    });
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
      ) : (
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