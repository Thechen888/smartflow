"use client";

import React, { useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Edit, Trash2, ArrowUpToLine, ArrowDownToLine, GripVertical } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Script } from './ScriptForm';

interface ScriptListProps {
  scripts: Script[];
  onEdit: (script: Script) => void;
  onDelete: (id: string) => void;
  scriptType: 'FLOW';
  onMoveToTop?: (id: string) => void;
  onMoveToBottom?: (id: string) => void;
}

const ScriptList: React.FC<ScriptListProps> = ({
  scripts,
  onEdit,
  onDelete,
  scriptType,
  onMoveToTop,
  onMoveToBottom
}) => {
  const [draggedScript, setDraggedScript] = useState<Script | null>(null);

  const handleDragStart = (e: React.DragEvent<HTMLTableRowElement>, script: Script) => {
    if (scriptType === 'FLOW') {
      e.dataTransfer.setData('text/plain', script.id);
      setDraggedScript(script);
      e.currentTarget.classList.add('opacity-50');
    }
  };

  const handleDragEnd = (e: React.DragEvent<HTMLTableRowElement>) => {
    if (scriptType === 'FLOW') {
      e.currentTarget.classList.remove('opacity-50');
      setDraggedScript(null);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLTableRowElement>) => {
    if (scriptType === 'FLOW') {
      e.preventDefault();
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLTableRowElement>, targetScript: Script) => {
    if (scriptType === 'FLOW' && draggedScript && draggedScript.id !== targetScript.id) {
      e.preventDefault();
      
      // Find the current positions
      const flowScripts = scripts.filter(s => s.scriptType === 'FLOW');
      const draggedIndex = flowScripts.findIndex(s => s.id === draggedScript.id);
      const targetIndex = flowScripts.findIndex(s => s.id === targetScript.id);
      
      if (draggedIndex !== -1 && targetIndex !== -1) {
        // Create new priority array
        const newScripts = [...scripts];
        const draggedScriptObj = newScripts.find(s => s.id === draggedScript.id);
        const targetScriptObj = newScripts.find(s => s.id === targetScript.id);
        
        if (draggedScriptObj && targetScriptObj) {
          // Swap priorities
          const tempPriority = draggedScriptObj.priority;
          draggedScriptObj.priority = targetScriptObj.priority;
          targetScriptObj.priority = tempPriority;
          
          // Update the scripts array
          setScripts => newScripts;
        }
      }
    }
  };

  return (
    <div className="border rounded-lg">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>脚本名称</TableHead>
            <TableHead>优先级</TableHead>
            <TableHead>脚本预览</TableHead>
            <TableHead>状态</TableHead>
            <TableHead>操作</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {scripts.map((script, index) => (
            <TableRow 
              key={script.id}
              draggable={scriptType === 'FLOW'}
              onDragStart={(e) => handleDragStart(e, script)}
              onDragEnd={handleDragEnd}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, script)}
            >
              <TableCell className="font-medium">{script.name}</TableCell>
              <TableCell className="text-center">
                {index + 1}
              </TableCell>
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
                    variant="I need to complete the last file that got cut off.

<dyad-write path="src/components/industrial/script-management/ScriptList.tsx" description="Updating ScriptList to only support FLOW script type">
"use client";

import React, { useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Edit, Trash2, ArrowUpToLine, ArrowDownToLine, GripVertical } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Script } from './ScriptForm';

interface ScriptListProps {
  scripts: Script[];
  onEdit: (script: Script) => void;
  onDelete: (id: string) => void;
  scriptType: 'FLOW';
  onMoveToTop?: (id: string) => void;
  onMoveToBottom?: (id: string) => void;
}

const ScriptList: React.FC<ScriptListProps> = ({
  scripts,
  onEdit,
  onDelete,
  scriptType,
  onMoveToTop,
  onMoveToBottom
}) => {
  const [draggedScript, setDraggedScript] = useState<Script | null>(null);

  const handleDragStart = (e: React.DragEvent<HTMLTableRowElement>, script: Script) => {
    if (scriptType === 'FLOW') {
      e.dataTransfer.setData('text/plain', script.id);
      setDraggedScript(script);
      e.currentTarget.classList.add('opacity-50');
    }
  };

  const handleDragEnd = (e: React.DragEvent<HTMLTableRowElement>) => {
    if (scriptType === 'FLOW') {
      e.currentTarget.classList.remove('opacity-50');
      setDraggedScript(null);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLTableRowElement>) => {
    if (scriptType === 'FLOW') {
      e.preventDefault();
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLTableRowElement>, targetScript: Script) => {
    if (scriptType === 'FLOW' && draggedScript && draggedScript.id !== targetScript.id) {
      e.preventDefault();
      
      // Find the current positions
      const flowScripts = scripts.filter(s => s.scriptType === 'FLOW');
      const draggedIndex = flowScripts.findIndex(s => s.id === draggedScript.id);
      const targetIndex = flowScripts.findIndex(s => s.id === targetScript.id);
      
      if (draggedIndex !== -1 && targetIndex !== -1) {
        // Create new priority array
        const newScripts = [...scripts];
        const draggedScriptObj = newScripts.find(s => s.id === draggedScript.id);
        const targetScriptObj = newScripts.find(s => s.id === targetScript.id);
        
        if (draggedScriptObj && targetScriptObj) {
          // Swap priorities
          const tempPriority = draggedScriptObj.priority;
          draggedScriptObj.priority = targetScriptObj.priority;
          targetScriptObj.priority = tempPriority;
          
          // Update the scripts array
          setScripts => newScripts;
        }
      }
    }
  };

  return (
    <div className="border rounded-lg">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>脚本名称</TableHead>
            <TableHead>优先级</TableHead>
            <TableHead>脚本预览</TableHead>
            <TableHead>状态</TableHead>
            <TableHead>操作</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {scripts.map((script, index) => (
            <TableRow 
              key={script.id}
              draggable={scriptType === 'FLOW'}
              onDragStart={(e) => handleDragStart(e, script)}
              onDragEnd={handleDragEnd}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, script)}
            >
              <TableCell className="font-medium">{script.name}</TableCell>
              <TableCell className="text-center">
                {index + 1}
              </TableCell>
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
                    onClick={() => onMoveToBottom?.(script.id)}
                    title="置底"
                  >
                    <ArrowDownToLine className="h-4 w-4 text-purple-500" />
                  </Button>
                  <div className="cursor-grab">
                    <GripVertical className="h-4 w-4 text-gray-400" />
                  </div>
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