import React from 'react';
import styled from 'styled-components';
import { colors } from '../styles/GlobalStyles';

const DiagramContainer = styled.div`
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  overflow: auto;
  margin: 1rem 0;
`;

const DiagramTitle = styled.h3`
  text-align: center;
  margin-bottom: 1rem;
  color: ${colors.primary};
  font-size: 1.25rem;
`;

const DiagramSvg = styled.svg`
  width: 100%;
  height: auto;
  max-width: 800px;
  margin: 0 auto;
  display: block;
  
  .joint-circle {
    cursor: pointer;
    transition: all 0.2s ease;
    stroke-width: 2;
    
    &.normal {
      fill: #e0e0e0;
      stroke: #bdbdbd;
    }
    
    &.swollen {
      fill: #ffcdd2;
      stroke: #f44336;
    }
    
    &.tender {
      fill: #fff3e0;
      stroke: #ff9800;
    }
    
    &.both {
      fill: #ffebee;
      stroke: #e91e63;
      stroke-width: 3;
    }
    
    &:hover {
      stroke-width: 3;
      filter: brightness(0.9);
    }
  }
  
  .joint-label {
    font-size: 10px;
    font-weight: 500;
    text-anchor: middle;
    dominant-baseline: middle;
    fill: #333;
    pointer-events: none;
    user-select: none;
  }
  
  .body-outline {
    fill: none;
    stroke: #ccc;
    stroke-width: 2;
  }
`;

const Legend = styled.div`
  display: flex;
  justify-content: center;
  gap: 1.5rem;
  margin-top: 1rem;
  flex-wrap: wrap;
  
  @media (max-width: 768px) {
    gap: 1rem;
    justify-content: space-around;
  }
`;

const LegendItem = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  
  .legend-circle {
    width: 16px;
    height: 16px;
    border-radius: 50%;
    border: 2px solid;
    
    &.normal {
      background-color: #e0e0e0;
      border-color: #bdbdbd;
    }
    
    &.swollen {
      background-color: #ffcdd2;
      border-color: #f44336;
    }
    
    &.tender {
      background-color: #fff3e0;
      border-color: #ff9800;
    }
    
    &.both {
      background-color: #ffebee;
      border-color: #e91e63;
      border-width: 3px;
    }
  }
`;

const InstructionText = styled.p`
  text-align: center;
  color: ${colors.textSecondary};
  font-size: 0.875rem;
  margin-bottom: 1rem;
  font-style: italic;
`;

// Joint positions and mappings for the DAS28 joints
const JOINT_POSITIONS = {
  // Shoulders
  'Left Shoulder': { x: 120, y: 140, side: 'left' },
  'Right Shoulder': { x: 280, y: 140, side: 'right' },
  
  // Elbows
  'Left Elbow': { x: 100, y: 200, side: 'left' },
  'Right Elbow': { x: 300, y: 200, side: 'right' },
  
  // Wrists
  'Left Wrist': { x: 85, y: 280, side: 'left' },
  'Right Wrist': { x: 315, y: 280, side: 'right' },
  
  // MCP joints (Metacarpophalangeal) - hand joints
  'Left MCP 1': { x: 75, y: 300, side: 'left' },
  'Left MCP 2': { x: 80, y: 305, side: 'left' },
  'Left MCP 3': { x: 85, y: 310, side: 'left' },
  'Left MCP 4': { x: 90, y: 305, side: 'left' },
  'Left MCP 5': { x: 95, y: 300, side: 'left' },
  
  'Right MCP 1': { x: 325, y: 300, side: 'right' },
  'Right MCP 2': { x: 320, y: 305, side: 'right' },
  'Right MCP 3': { x: 315, y: 310, side: 'right' },
  'Right MCP 4': { x: 310, y: 305, side: 'right' },
  'Right MCP 5': { x: 305, y: 300, side: 'right' },
  
  // PIP joints (Proximal Interphalangeal) - finger joints
  'Left PIP 2': { x: 78, y: 320, side: 'left' },
  'Left PIP 3': { x: 83, y: 325, side: 'left' },
  'Left PIP 4': { x: 88, y: 320, side: 'left' },
  'Left PIP 5': { x: 93, y: 315, side: 'left' },
  
  'Right PIP 2': { x: 322, y: 320, side: 'right' },
  'Right PIP 3': { x: 317, y: 325, side: 'right' },
  'Right PIP 4': { x: 312, y: 320, side: 'right' },
  'Right PIP 5': { x: 307, y: 315, side: 'right' },
  
  // Knees
  'Left Knee': { x: 160, y: 450, side: 'left' },
  'Right Knee': { x: 240, y: 450, side: 'right' }
};

const JointDiagram = ({ counts, onJointClick }) => {
  const getJointStatus = (jointName) => {
    const joint = counts[jointName];
    if (!joint) return 'normal';
    
    if (joint.is_swollen && joint.is_tender) return 'both';
    if (joint.is_swollen) return 'swollen';
    if (joint.is_tender) return 'tender';
    return 'normal';
  };

  const handleJointClick = (jointName, event) => {
    event.preventDefault();
    
    // Determine what type of click this should be based on modifier keys
    // Shift + Click = toggle swollen
    // Ctrl/Cmd + Click = toggle tender
    // Regular click = cycle through states (normal -> tender -> swollen -> both -> normal)
    
    const currentStatus = getJointStatus(jointName);
    let newState = { is_swollen: false, is_tender: false };
    
    if (event.shiftKey) {
      // Toggle swollen
      newState = {
        is_swollen: !counts[jointName]?.is_swollen,
        is_tender: counts[jointName]?.is_tender || false
      };
    } else if (event.ctrlKey || event.metaKey) {
      // Toggle tender
      newState = {
        is_swollen: counts[jointName]?.is_swollen || false,
        is_tender: !counts[jointName]?.is_tender
      };
    } else {
      // Cycle through states
      switch (currentStatus) {
        case 'normal':
          newState = { is_swollen: false, is_tender: true };
          break;
        case 'tender':
          newState = { is_swollen: true, is_tender: false };
          break;
        case 'swollen':
          newState = { is_swollen: true, is_tender: true };
          break;
        case 'both':
          newState = { is_swollen: false, is_tender: false };
          break;
        default:
          newState = { is_swollen: false, is_tender: false };
      }
    }
    
    onJointClick(jointName, newState);
  };

  return (
    <DiagramContainer>
      <DiagramTitle>🫁 Interactive Joint Diagram</DiagramTitle>
      <InstructionText>
        Click joints to cycle through states: Normal → Tender → Swollen → Both → Normal<br/>
        Hold Shift + Click to toggle swollen | Hold Ctrl + Click to toggle tender
      </InstructionText>
      
      <DiagramSvg viewBox="0 0 400 500" xmlns="http://www.w3.org/2000/svg">
        {/* Body outline - simplified human figure */}
        <g className="body-outline">
          {/* Head */}
          <circle cx="200" cy="60" r="25" />
          
          {/* Torso */}
          <rect x="175" y="85" width="50" height="80" rx="10" />
          
          {/* Arms */}
          <line x1="175" y1="110" x2="120" y2="140" strokeWidth="8" strokeLinecap="round" />
          <line x1="225" y1="110" x2="280" y2="140" strokeWidth="8" strokeLinecap="round" />
          
          {/* Forearms */}
          <line x1="120" y1="140" x2="100" y2="200" strokeWidth="6" strokeLinecap="round" />
          <line x1="280" y1="140" x2="300" y2="200" strokeWidth="6" strokeLinecap="round" />
          
          {/* Hands */}
          <line x1="100" y1="200" x2="85" y2="280" strokeWidth="4" strokeLinecap="round" />
          <line x1="300" y1="200" x2="315" y2="280" strokeWidth="4" strokeLinecap="round" />
          
          {/* Fingers outline */}
          <path d="M 75,300 L 85,330" strokeWidth="2" />
          <path d="M 80,305 L 78,330" strokeWidth="2" />
          <path d="M 85,310 L 83,335" strokeWidth="2" />
          <path d="M 90,305 L 88,330" strokeWidth="2" />
          <path d="M 95,300 L 93,325" strokeWidth="2" />
          
          <path d="M 325,300 L 315,330" strokeWidth="2" />
          <path d="M 320,305 L 322,330" strokeWidth="2" />
          <path d="M 315,310 L 317,335" strokeWidth="2" />
          <path d="M 310,305 L 312,330" strokeWidth="2" />
          <path d="M 305,300 L 307,325" strokeWidth="2" />
          
          {/* Legs */}
          <rect x="185" y="165" width="15" height="60" rx="7" />
          <rect x="200" y="165" width="15" height="60" rx="7" />
          
          {/* Thighs */}
          <line x1="192" y1="225" x2="160" y2="350" strokeWidth="8" strokeLinecap="round" />
          <line x1="208" y1="225" x2="240" y2="350" strokeWidth="8" strokeLinecap="round" />
          
          {/* Lower legs */}
          <line x1="160" y1="350" x2="160" y2="480" strokeWidth="6" strokeLinecap="round" />
          <line x1="240" y1="350" x2="240" y2="480" strokeWidth="6" strokeLinecap="round" />
        </g>
        
        {/* Joint markers */}
        {Object.entries(JOINT_POSITIONS).map(([jointName, position]) => {
          const status = getJointStatus(jointName);
          const radius = status === 'both' ? 8 : 6;
          
          return (
            <g key={jointName}>
              <circle
                cx={position.x}
                cy={position.y}
                r={radius}
                className={`joint-circle ${status}`}
                onClick={(e) => handleJointClick(jointName, e)}
                title={`${jointName} - ${status}`}
              />
              {/* Joint labels for major joints only */}
              {(jointName.includes('Shoulder') || jointName.includes('Elbow') || 
                jointName.includes('Wrist') || jointName.includes('Knee')) && (
                <text
                  x={position.x}
                  y={position.y + (jointName.includes('Knee') ? 20 : 
                       jointName.includes('Shoulder') ? -15 : -12)}
                  className="joint-label"
                >
                  {jointName.replace('Left ', 'L ').replace('Right ', 'R ')}
                </text>
              )}
            </g>
          );
        })}
      </DiagramSvg>
      
      <Legend>
        <LegendItem>
          <div className="legend-circle normal"></div>
          <span>Normal</span>
        </LegendItem>
        <LegendItem>
          <div className="legend-circle tender"></div>
          <span>Tender</span>
        </LegendItem>
        <LegendItem>
          <div className="legend-circle swollen"></div>
          <span>Swollen</span>
        </LegendItem>
        <LegendItem>
          <div className="legend-circle both"></div>
          <span>Both</span>
        </LegendItem>
      </Legend>
    </DiagramContainer>
  );
};

export default JointDiagram;
