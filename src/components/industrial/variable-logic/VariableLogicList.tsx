"use client";

import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Edit, Trash2, Settings, Link, FileCode } from 'lucide-react';
import { VariableCategory } from './VariableCategoryManager';
import { VariableLogic } from './VariableLogicForm';

interface VariableLogicListProps {
  variables: VariableLogic[];
  categories: VariableCategory[];
  onEdit: (variable: VariableLogic) => void;
  onDelete: (id: string) => void;
  inputPoints: { id: string; name: string }[];
  outputPoints: { id: string; name: string }[];
}

const VariableLogicList: React.FC<VariableLogicListProps> = ({
  variables,
  categories,
  onEdit,
  onDelete,
  inputPoints,
  outputPoints
}) => {
  return (
    <div className="border rounded-lg">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>变量名称</TableHead>
            <TableHead>分类</TableHead>
            <TableHead>结果类型</TableHead>
            <TableHead>逻辑类型</TableHead>
            <TableHead>脚本预览</TableHead>
            <TableHead>执行频率(ms)</TableHead>
            <TableHead>状态</TableHead>
            <TableHead>操作</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {variables.map((variable) => (
            <TableRow key={variable.id}>
              <TableCell className="font-medium">
                <div>{variable.name}</div>
                {variable.description && (
                  <div className="text-xs text-gray-500 mt-1">{variable.description}</div>
                )}
              </TableCell>
              <TableCell>
                <Badge variant="secondary">
                  {categories.find(c => c.id === variable.categoryId)?.name || '未知分类'}
                </Badge>
              </TableCell>
              <TableCell>{variable.resultType}</TableCell>
              <TableCell>
                {variable.logicType === 'GENERATE' && (
                  <div className="flex items-center">
                    <Settings className="mr-1 h-3 w-3" />
                    <span className="text-xs">生成变量</span>
                  </div>
                )}
                {variable.logicType === 'BIND_OUTPUT' && (
                  <div className="flex items-center">
                    <Link className="mr-1 h-3 w-3" />
                    <span className="text-xs">绑定输出</span>
                  </div>
                )}
                {variable.logicType === 'SCRIPT_ONLY' && (
                  <div className="flex items-center">
                    <FileCode className="mr-1 h-3 w-3" />
                    <span className="text-xs">纯脚本</span>
                  </div>
                )}
              </TableCell>
              <TableCell className="font-mono text-sm max-w-xs truncate">
                {variable.scriptContent.substring(0, 50) + (variable.scriptContent.length > 50 ? '...' : '')}
              </TableCell>
              <TableCell>{variable.executeRate}</TableCell>
              <TableCell>
                <Badge variant={variable.enabled ? "default" : "secondary"}>
                  {variable.enabled ? '启用' : '禁用'}
                </Badge>
              </TableCell>
              <TableCell>
                <div className="flex space-x-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onEdit(variable)}
                  >
                    <Edit className="h-4 w-4 text-blue-500" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onDelete(variable.id)}
                  >
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default VariableLogicList;