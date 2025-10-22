"use client";

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Trash2 } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

export interface VariableCategory {
  id: string;
  name: string;
  description?: string;
}

interface VariableCategoryManagerProps {
  categories: VariableCategory[];
  activeTab: string;
  onTabChange: (tab: string) => void;
  onAddCategory: (category: Omit<VariableCategory, 'id'>) => void;
  onDeleteCategory: (id: string) => void;
  variableCounts: Record<string, number>;
}

const VariableCategoryManager: React.FC<VariableCategoryManagerProps> = ({
  categories,
  activeTab,
  onTabChange,
  onAddCategory,
  onDeleteCategory,
  variableCounts
}) => {
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [newCategory, setNewCategory] = useState({ name: '', description: '' });
  const [categoryToDelete, setCategoryToDelete] = useState<VariableCategory | null>(null);

  const handleAddCategory = () => {
    if (newCategory.name) {
      onAddCategory(newCategory);
      setNewCategory({ name: '', description: '' });
      setIsAddingCategory(false);
    }
  };

  const handleDeleteCategory = () => {
    if (categoryToDelete) {
      onDeleteCategory(categoryToDelete.id);
      setCategoryToDelete(null);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>变量分类管理</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-2 mb-4">
          <Tabs value={activeTab} onValueChange={onTabChange}>
            <TabsList className="flex flex-wrap gap-2">
              <TabsTrigger value="all" className="px-3 py-1.5 text-sm">
                全部 ({Object.values(variableCounts).reduce((sum, count) => sum + count, 0)})
              </TabsTrigger>
              {categories.map(category => (
                <TabsTrigger 
                  key={category.id} 
                  value={category.id} 
                  className="px-3 py-1.5 text-sm flex items-center gap-2"
                >
                  {category.name} ({variableCounts[category.id] || 0})
                  <Dialog open={categoryToDelete?.id === category.id} onOpenChange={(open) => !open && setCategoryToDelete(null)}>
                    <DialogTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-4 w-4 p-0 ml-1 hover:bg-red-100"
                        onClick={(e) => {
                          e.stopPropagation();
                          setCategoryToDelete(category);
                        }}
                      >
                        <Trash2 className="h-3 w-3 text-red-500" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>确认删除分类</DialogTitle>
                        <DialogDescription>
                          确定要删除分类 "{category.name}" 吗？此操作无法撤销。
                          {variableCounts[category.id] > 0 && (
                            <div className="mt-2 text-red-600 font-medium">
                              注意：此分类下有 {variableCounts[category.id]} 个变量，删除分类后这些变量将变为未分类。
                            </div>
                          )}
                        </DialogDescription>
                      </DialogHeader>
                      <DialogFooter>
                        <Button variant="outline" onClick={() => setCategoryToDelete(null)}>取消</Button>
                        <Button variant="destructive" onClick={handleDeleteCategory}>删除</Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </div>
        
        {isAddingCategory ? (
          <div className="flex gap-2 mb-4">
            <Input
              placeholder="分类名称"
              value={newCategory.name}
              onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
              className="flex-1"
            />
            <Input
              placeholder="分类描述"
              value={newCategory.description}
              onChange={(e) => setNewCategory({ ...newCategory, description: e.target.value })}
              className="flex-1"
            />
            <Button onClick={handleAddCategory} size="sm">添加</Button>
            <Button onClick={() => setIsAddingCategory(false)} size="sm" variant="outline">取消</Button>
          </div>
        ) : (
          <Button 
            onClick={() => setIsAddingCategory(true)} 
            variant="outline" 
            size="sm"
            className="mb-4"
          >
            <Plus className="mr-1 h-3 w-3" />
            添加分类
          </Button>
        )}
      </CardContent>
    </Card>
  );
};

export default VariableCategoryManager;