"use client";

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import NodeConfig from '@/components/industrial/NodeConfig';
import InputPointConfig from '@/components/industrial/InputPointConfig';
import OutputPointConfig from '@/components/industrial/OutputPointConfig';
import ScriptManagement from '@/components/industrial/ScriptManagement';

const IndustrialConfig = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);

  const steps = [
    { id: 1, name: '节点配置', component: <NodeConfig /> },
    { id: 2, name: '输入点位', component: <InputPointConfig /> },
    { id: 3, name: '输出点位', component: <OutputPointConfig /> },
    { id: 4, name: '脚本管理', component: <ScriptManagement /> }
  ];

  const handleNext = () => {
    if (currentStep < 4) {
      if (!completedSteps.includes(currentStep)) {
        setCompletedSteps([...completedSteps, currentStep]);
      }
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrev = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleStepClick = (step: number) => {
    if (step <= Math.max(...completedSteps, 0) + 1) {
      setCurrentStep(step);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">工业通信配置系统</h1>
          <p className="text-gray-600">支持 IEC104 / IEC61850 / MODBUS 协议配置</p>
        </div>

        {/* 配置向导步骤指示器 */}
        <div className="flex items-center justify-center mb-8">
          <div className="flex items-center space-x-4">
            {steps.map((step, index) => (
              <React.Fragment key={step.id}>
                <button
                  onClick={() => handleStepClick(step.id)}
                  disabled={step.id > Math.max(...completedSteps, 0) + 1}
                  className={`flex flex-col items-center px-4 py-2 rounded-lg transition-all ${
                    currentStep === step.id
                      ? 'bg-blue-600 text-white'
                      : completedSteps.includes(step.id)
                      ? 'bg-green-100 text-green-700'
                      : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                  } ${step.id > Math.max(...completedSteps, 0) + 1 ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                >
                  <span className="font-medium">{step.id}</span>
                  <span className="text-xs mt-1">{step.name}</span>
                </button>
                {index < steps.length - 1 && (
                  <ChevronRight className="text-gray-400" size={20} />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* 主配置内容 */}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-xl font-semibold">
              {steps.find(s => s.id === currentStep)?.name} 配置
            </CardTitle>
          </CardHeader>
          <CardContent>
            {steps.find(s => s.id === currentStep)?.component}
          </CardContent>
        </Card>

        {/* 导航按钮 */}
        <div className="flex justify-between mt-6">
          <Button
            onClick={handlePrev}
            disabled={currentStep === 1}
            variant="outline"
            className="flex items-center"
          >
            <ChevronLeft className="mr-2" size={16} />
            上一步
          </Button>
          <Button
            onClick={handleNext}
            disabled={currentStep === 4}
            className="flex items-center"
          >
            下一步
            <ChevronRight className="ml-2" size={16} />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default IndustrialConfig;