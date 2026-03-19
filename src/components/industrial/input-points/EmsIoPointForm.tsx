"use client";

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Pencil } from 'lucide-react';
import { Label } from '@/components/ui/label';

interface EmsIoPoint {
  id: string;
  name: string;
  pointType: 'DI' | 'DO';
  address: string;
  description?: string;
  enabled: boolean;
}

interface EmsIoPointFormProps {
  points: EmsIoPoint[];
  pointType: 'DI' | 'DO';
  onPointsChange: (points: EmsIoPoint[]) => void;
  hideActions?: boolean;
}

const EmsIoPointForm: React.FC<EmsIoPointFormProps> = ({
  points,
  pointType,
  onPointsChange,
  hideActions = false
}) => {
  const [editingPointId, setEditingPointId] = useState<string | null>(null);
  const [editingDescription, setEditingDescription] = useState<string>('');

  const startEditing = (point: EmsIoPoint) => {
    setEditingPointId(point.id);
    setEditingDescription(point.description || '');
  };

  const saveDescription = () => {
    if (editingPointId) {
      const updatedPoints = points.map(point => 
        point.id === editingPointId 
          ? { ...point, description: editingDescription }
          : point
      );
      onPointsChange(updatedPoints);
      setEditingPointId(null);
      setEditingDescription('');
    }
  };

  const cancelEditing = () => {
    setEditingPointId(null);
    setEditingDescription('');
  };

  return (
    <div className="space-y-4">
      {!hideActions && (
        <div className="flex justify-between items-center">
          <CardTitle>EMS IO {pointType === 'DI' ? 'DI' : 'DO'} 点位配置</CardTitle>
        </div>
      )}

      <Card>
        <CardContent>
          <div className="border rounded-lg overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>地址</TableHead>
                  <TableHead>路径</TableHead>
                  <TableHead>初始值</TableHead>
                  <TableHead>备注</TableHead>
                  <TableHead>操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {points.map((point) => (
                  <TableRow key={point.id}>
                    <TableCell className="font-mono">{point.address}</TableCell>
                    <TableCell className="font-medium">{point.name}</TableCell>
                    <TableCell>
                      {pointType === 'DI' 
                        ? (point.address === '1' ? '103' : '52')
                        : (point.address === '1' ? '103' : '52')}
                    </TableCell>
                    <TableCell>
                      {editingPointId === point.id ? (
                        <div className="flex items-center space-x-2">
                          <Input
                            value={editingDescription}
                            onChange={(e) => setEditingDescription(e.target.value)}
                            className="text-sm"
                            placeholder="输入备注"
                          />
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={saveDescription}
                            className="h-6 w-6 p-0"
                          >
                            <Pencil className="h-3 w-3" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={cancelEditing}
                            className="h-6 w-6 p-0"
                          >
                            ✕
                          </Button>
                        </div>
                      ) : (
                        <span className="text-sm">{point.description || '-'}</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => startEditing(point)}
                        className="h-6 w-6 p-0"
                      >
                        <Pencil className="h-3 w-3" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {points.length === 0 && (
            <div className="text-center py-4 text-gray-500">
              暂无{pointType === 'DI' ? 'DI' : 'DO'}点位
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default EmsIoPointForm;