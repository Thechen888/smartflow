"use client";

import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Edit, Trash2, ArrowUp, ArrowDown, ArrowUpToLine, ArrowDownToLine } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Script } from './ScriptForm';

interface ScriptListProps {
  scripts: Script[];
  onEdit: (script: Script) => void;
  onDelete: (id: string) => void;
  scriptType: 'CYCLIC' | 'FLOW';
  onMoveUp?: (id: string) => void;
  onMoveDown?: (id: string) => void;
  onMoveToTop?: (id: string) => void;
  onMoveToBottom?: (id: string) => void;
}

const ScriptList: React.FC<ScriptListProps> = ({
  scripts,
  onEdit,
  onDelete,
  scriptType,
  onMoveUp,
  onMoveDown,
  onMoveToTop,
  onMoveToBottom
}) => {
  return (
    <div className="border rounded-lg">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>脚本名称</TableHead>
            {scriptType === 'FLOW' && <TableHead>优先级</TableHead>}
            <TableHead>脚本预览</TableHead>
            <TableHead>状态</TableHead>
            <TableHead>操作</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {scripts.map((script, index) => (
            <TableRow key={script.id}>
              <TableCell className="font-medium">{script.name}</TableCell>
              {scriptType === 'FLOW' && (
                <TableCell className="text-center">
                  {index + 1}
                </TableCell>
              )}
              <TableCell className="font-mono text-sm max-w-xs truncate">
                {script.scriptContent.substring(0, 50) + (script.scriptContent.length > 50 ? '...' : '')}
              </TableCell>
              <TableCell>
                <Badge variant="default">启用</Badge>
              </TableCell>
              <TableCell>
                <div className="flex space-x-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onEdit(script)}
                  >
                    <Edit className="h-4 w-4 text-blue-500" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onDelete(script.id)}
                  >
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>
                  {scriptType === 'FLOW' && (
                    <>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onMoveToTop?.(script.id)}
                        title="置顶"
                      >
                        <ArrowUpToLine className="h-4 w-4 text-purple-500" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onMoveUp?.(script.id)}
                        title="上调"
                        disabled={!onMoveUp || index === 0}
                      >
                        <ArrowUp className="h-4 w-4 text-green-500" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onMoveDown?.(script.id)}
                        title="下调"
                        disabled={!onMoveDown || index === scripts.length - 1}
                      >
                        <ArrowDown className="h-4 w-4 text-yellow-500" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onMoveToBottom?.(script.id)}
                        title="置底"
                      >
                        <ArrowDownToLine className="h-4 w-4 text-purple-500" />
                      </Button>
                    </>
                  )}
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default ScriptList;