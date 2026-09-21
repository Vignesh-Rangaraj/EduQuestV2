import React from 'react';
import { JourneyStage } from '../../types';

interface JourneyMapProps {
  stages: JourneyStage[];
}

export const JourneyMap: React.FC<JourneyMapProps> = ({ stages }) => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-bold text-gray-900 text-base flex items-center gap-2">
            <span>🗺️</span> Learning Journey Map
          </h3>
          <p className="text-xs text-gray-500">Travel through stages by gaining XP</p>
        </div>
      </div>

      <div className="relative py-4">
        {/* Connection Line */}
        <div className="absolute top-1/2 left-8 right-8 h-1 bg-gray-200 -translate-y-1/2 z-0" />

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4 relative z-10">
          {stages.map((st) => (
            <div
              key={st.stageIndex}
              className={`flex flex-col items-center p-3 rounded-xl border transition-all text-center ${
                st.isCurrent
                  ? 'bg-amber-50 border-amber-400 ring-2 ring-amber-400 shadow-md scale-105'
                  : st.isUnlocked
                  ? 'bg-emerald-50/60 border-emerald-200'
                  : 'bg-gray-50 border-gray-200 opacity-60'
              }`}
            >
              <div
                className={`w-12 h-12 rounded-full flex items-center justify-center text-2xl mb-2 shadow ${
                  st.isCurrent
                    ? 'bg-amber-400 text-white animate-pulse'
                    : st.isUnlocked
                    ? 'bg-emerald-500 text-white'
                    : 'bg-gray-300 text-gray-500'
                }`}
              >
                {st.icon}
              </div>

              <h4 className="font-bold text-xs text-gray-900">{st.name}</h4>
              <p className="text-[10px] text-gray-500 mt-0.5">{st.minXp} XP</p>

              {st.isCurrent && (
                <span className="mt-2 text-[9px] font-extrabold uppercase bg-amber-500 text-white px-2 py-0.5 rounded-full">
                  Current Stage
                </span>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
