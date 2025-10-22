"use client";

import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import VariableCategoryManager, { VariableCategory } from '@/components/variable-logic/VariableCategoryManager';
import VariableLogicForm, { VariableLogic } from '@/components/variable-logic/VariableLogicForm';
import VariableLogicList from '@/components/variable-logic/VariableLogicList';
import { ProtocolType, InputPoint, OutputPoint } from '@/types';

const VariableLogicConfig = () => {
  const [categories, setCategories] = useState<VariableCategory[]>([
    { id: 'default', name: '默认', description: '默认分类' }
  ]);
  const [logics, setLogics] = useState<VariableLogic[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingLogic, setEditingLogic] = useState<VariableLogic | null>(null);
  const [activeTab, setActiveTab] = useState('all');
  const [variableCounts, setVariableCounts] = useState<Record<string, number>>({});

  // Mock data for input/output points
  const inputPoints: InputPoint[] = [];
  const outputPoints: OutputPoint[] = [];

  // 计算每个分类的变量数量
  useEffect(() => {
    const counts: Record<string, number> = {};
    categories.forEach(cat => {
      counts[cat.id] = logics.filter(logic => logic.categoryId === cat.id).length;
    });
    setVariableCounts(counts);
  }, [categories, logics]);

  return (
    <div className="space-y-6">
      <VariableCategoryManager 
        categories={categories}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onAddCategory={(category) => {
          const newCategory = {
            ...category,
            id: Date.now().toString()
          };
          setCategories([...categories, newCategory]);
        }}
        onDeleteCategory={(id) => {
          setCategories(categories.filter(c => c.id !== id));
        }}
        variableCounts={variableCounts}
      />
      
      <Card className="p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium">变量逻辑配置</h3>
          <Button onClick={() => setShowForm(true)}>
            <Plus className="mr-2" size={16} />
            添加逻辑
          </Button>
        </div>
        
        {showForm ? (
          <VariableLogicForm
            isEditing={!!editingLogic}
            variable={editingLogic}
            categories={categories}
            inputPoints={inputPoints}
            outputPoints={outputPoints}
            variables={logics}
            onSave={(variable) => {
              if (editingLogic && 'id' in variable) {
                setLogics(logics.map(l => l.id === variable.id ? variable as VariableLogic : l));
              } else {
                const newVariable: VariableLogic = {
                  ...variable,
                  id: Date.now().toString()
                } as VariableLogic;
                setLogics([...logics, newVariable]);
              }
              setShowForm(false);
              setEditingLogic(null);
            }}
            onCancel={() => {
              setShowForm(false);
              setEditingLogic(null);
            }}
          />
        ) : (
          <VariableLogicList
            variables={logics}
            categories={categories}
            inputPoints={inputPoints}
            outputPoints={outputPoints}
            onEdit={(variable) => {
              setEditingLogic(variable);
              setShowForm(true);
            }}
            onDelete={(id) => {
              setLogics(logics.filter(l => l.id !== id));
            }}
          />
        )}
      </Card>
    </div>
  );
};

export default VariableLogicConfig;