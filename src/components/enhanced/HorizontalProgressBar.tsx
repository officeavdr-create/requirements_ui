/**
 * Enhanced Horizontal Progress Bar for AI Processing Stages
 * Story 7C.1: Horizontal AI Processing Progress Enhancement
 */
import React from 'react';
import { CheckCircle, Clock, AlertCircle, Loader2 } from 'lucide-react';

interface ProcessingStage {
  name: string;
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  description: string;
  progress?: number;
}

interface HorizontalProgressBarProps {
  stages: ProcessingStage[];
  currentStage?: string;
  overallProgress?: number;
  className?: string;
}

const HorizontalProgressBar: React.FC<HorizontalProgressBarProps> = ({
  stages,
  currentStage,
  overallProgress = 0,
  className = ''
}) => {
  const getStageIcon = (stage: ProcessingStage) => {
    switch (stage.status) {
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-400" />;
      case 'in_progress':
        return <Loader2 className="w-5 h-5 text-blue-400 animate-spin" />;
      case 'failed':
        return <AlertCircle className="w-5 h-5 text-red-400" />;
      default:
        return <Clock className="w-5 h-5 text-gray-500" />;
    }
  };

  const getStageStyle = (stage: ProcessingStage, index: number) => {
    const baseStyle = "flex-1 min-w-0 px-4 py-3 text-center transition-all duration-300";
    
    switch (stage.status) {
      case 'completed':
        return `${baseStyle} bg-green-500/20 border-green-500/50`;
      case 'in_progress':
        return `${baseStyle} bg-blue-500/20 border-blue-500/50 shadow-md`;
      case 'failed':
        return `${baseStyle} bg-red-500/20 border-red-500/50`;
      default:
        return `${baseStyle} bg-gray-700/50 border-gray-600`;
    }
  };

  const getConnectorStyle = (currentStage: ProcessingStage, nextStage?: ProcessingStage) => {
    if (currentStage.status === 'completed' && nextStage) {
      return "bg-green-400";
    }
    if (currentStage.status === 'in_progress') {
      return "bg-blue-400";
    }
    return "bg-gray-600";
  };

  return (
    <div className={`bg-gray-800 rounded-lg p-4 ${className}`}>
      {/* Overall Progress Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white">AI Processing Pipeline</h3>
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-300">Overall Progress</span>
          <span className="text-sm font-semibold text-white">{Math.round(overallProgress)}%</span>
        </div>
      </div>

      {/* Overall Progress Bar */}
      <div className="w-full bg-gray-700 rounded-full h-2 mb-6">
        <div 
          className="bg-gradient-to-r from-blue-500 to-green-500 h-2 rounded-full transition-all duration-500 ease-out"
          style={{ width: `${overallProgress}%` }}
        />
      </div>

      {/* Stage Pipeline */}
      <div className="flex items-center space-x-2">
        {stages.map((stage, index) => (
          <React.Fragment key={stage.name}>
            {/* Stage Card */}
            <div className={`${getStageStyle(stage, index)} border rounded-lg relative group`}>
              {/* Stage Icon */}
              <div className="flex justify-center mb-2">
                {getStageIcon(stage)}
              </div>
              
              {/* Stage Name */}
              <div className="font-medium text-white text-sm capitalize mb-1">
                {stage.name}
              </div>
              
              {/* Stage Progress (if in progress) */}
              {stage.status === 'in_progress' && stage.progress !== undefined && (
                <div className="text-xs text-blue-300 font-semibold">
                  {Math.round(stage.progress)}%
                </div>
              )}

              {/* Hover Tooltip */}
              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10 whitespace-nowrap">
                {stage.description}
                <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
              </div>
            </div>

            {/* Connector Line */}
            {index < stages.length - 1 && (
              <div className="flex items-center">
                <div className={`h-1 w-8 transition-all duration-300 ${getConnectorStyle(stage, stages[index + 1])}`} />
              </div>
            )}
          </React.Fragment>
        ))}
      </div>

      {/* Current Stage Details */}
      {currentStage && (
        <div className="mt-4 p-3 bg-gray-700/50 rounded-lg">
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-300">Current Stage:</span>
            <span className="text-sm font-semibold text-white capitalize">{currentStage}</span>
            {stages.find(s => s.name === currentStage)?.status === 'in_progress' && (
              <Loader2 className="w-4 h-4 text-blue-400 animate-spin" />
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default HorizontalProgressBar;