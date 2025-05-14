
import { LockKeyhole } from "lucide-react";
import { Button } from "@/components/ui/button";

export function StoryBuilder() {
  return (
    <div className="flex flex-col items-center justify-center py-10 text-center relative">
      {/* Blurred dashboard-like background */}
      <div className="absolute inset-0 opacity-20 blur-sm pointer-events-none">
        <div className="bg-white/90 h-full w-full p-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-gray-200 h-40 rounded-lg"></div>
            <div className="bg-gray-200 h-40 rounded-lg"></div>
            <div className="bg-gray-200 h-40 rounded-lg"></div>
          </div>
          <div className="grid grid-cols-2 gap-6">
            <div className="bg-gray-200 h-60 rounded-lg"></div>
            <div className="bg-gray-200 h-60 rounded-lg"></div>
          </div>
        </div>
      </div>
      
      {/* Lock content */}
      <div className="z-10 w-full max-w-lg">
        <div className="bg-[#F8F8F8] rounded-full p-4 mb-6 w-24 h-24 flex items-center justify-center mx-auto">
          <LockKeyhole className="h-12 w-12 text-[#FF6B4A]" />
        </div>
        <h2 className="text-xl md:text-2xl font-semibold mb-3">Story Builder</h2>
        <p className="text-md mb-6">
          Discover your authentic origin story by exploring your deep motivational factors,
          professional desires, and the pivotal moments that pushed you to want more.
        </p>
        <div className="bg-[#FFF4EE] border border-[#FFDED0] rounded-md p-4 mb-6">
          <h3 className="font-medium text-[#FF6B4A] mb-2">Starter Plan Required</h3>
          <p className="text-sm">
            This feature is available on our Starter Plan at ƒ9,- per month.
            Upgrade now to unlock the Story Builder and find your authentic voice.
          </p>
        </div>
        <Button className="bg-[#FF6B4A] hover:bg-[#E55A3A]">
          Upgrade to Starter Plan
        </Button>
      </div>
    </div>
  );
}
