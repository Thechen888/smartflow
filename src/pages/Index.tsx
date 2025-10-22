// Update this page (the content is just a fallback if you fail to update the page)

import { MadeWithDyad } from "@/components/made-with-dyad";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const Index = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">工业通信配置系统</h1>
        <p className="text-xl text-gray-600 mb-8">
          支持 IEC104 / IEC61850 / MODBUS 协议配置
        </p>
        <div className="space-y-4">
          <Link to="/industrial-config">
            <Button size="lg" className="text-lg px-8 py-4">
              通用配置向导
            </Button>
          </Link>
          <Link to="/modbus-config">
            <Button size="lg" variant="secondary" className="text-lg px-8 py-4">
              MODBUS 专用配置
            </Button>
          </Link>
        </div>
      </div>
      <MadeWithDyad />
    </div>
  );
};

export default Index;