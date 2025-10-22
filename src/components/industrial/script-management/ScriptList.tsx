"use client";

import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Edit, Trash2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Script } from './ScriptForm';

interface ScriptListProps {
  scripts: Script[];
  onEdit: (script: Script) => void;
  onDelete: (id: string) => void;
}

const ScriptList: React.FC<ScriptListProps> = ({
  scripts,
  onEdit,
  onDelete
}) => {
  return (
    <div className="border rounded-lg">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>脚本名称</TableHead>
            <TableHead>脚本预览</TableHead>
            <TableHead>状态</TableHead>
            <TableHead>操作</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {scripts.map((script) => (
            <TableRow key={script.id}>
              <TableCell className="font-medium">{script.name}</TableCell>
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