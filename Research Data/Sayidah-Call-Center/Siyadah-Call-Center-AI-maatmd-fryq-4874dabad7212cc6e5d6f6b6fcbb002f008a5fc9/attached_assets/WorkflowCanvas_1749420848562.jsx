// src/pages/workflow-automation-builder/components/WorkflowCanvas.jsx
import React, { useState, useRef, useEffect } from 'react';
import Icon from 'components/AppIcon';

const WorkflowCanvas = ({ 
  workflow, 
  selectedNode, 
  onNodeSelect, 
  onNodeUpdate, 
  onWorkflowUpdate,
  selectedAIAgent,
  className 
}) => {
  const canvasRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [draggedNode, setDraggedNode] = useState(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [canvasOffset, setCanvasOffset] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectionStart, setConnectionStart] = useState(null);
  const [temporaryConnection, setTemporaryConnection] = useState(null);
  const [showHints, setShowHints] = useState(true);
  const [showNodeContextMenu, setShowNodeContextMenu] = useState(false);
  const [contextMenuPosition, setContextMenuPosition] = useState({ x: 0, y: 0 });
  const [contextMenuNode, setContextMenuNode] = useState(null);
  const [hoveredNode, setHoveredNode] = useState(null);
  const [dragOverNode, setDragOverNode] = useState(null);
  const [dragStartTime, setDragStartTime] = useState(null);
  const [showQuickCreate, setShowQuickCreate] = useState(false);
  const [quickCreatePosition, setQuickCreatePosition] = useState({ x: 0, y: 0 });

  // Node types with configurations
  const nodeTypes = {
    trigger: {
      label: 'المشغل',
      icon: 'Zap',
      color: 'accent',
      description: 'نقطة بداية سير العمل'
    },
    condition: {
      label: 'الشرط',
      icon: 'GitBranch',
      color: 'warning',
      description: 'نقطة قرار منطقية'
    },
    action: {
      label: 'الإجراء',
      icon: 'Play',
      color: 'primary',
      description: 'تنفيذ مهمة معينة'
    },
    ai_agent: {
      label: 'وكيل ذكي',
      icon: 'Bot',
      color: 'secondary',
      description: 'تعيين مهمة لوكيل ذكي'
    },
    delay: {
      label: 'تأخير',
      icon: 'Clock',
      color: 'muted',
      description: 'انتظار لفترة زمنية'
    },
    notification: {
      label: 'إشعار',
      icon: 'Bell',
      color: 'info',
      description: 'إرسال إشعار أو رسالة'
    }
  };

  // Hide hints after 15 seconds or first interaction
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowHints(false);
    }, 15000);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    // Hide context menu when clicking outside
    const handleClickOutside = () => {
      setShowNodeContextMenu(false);
    };
    
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  // Handle mouse move for temporary connection drawing
  useEffect(() => {
    if (isConnecting && canvasRef.current) {
      const handleMouseMove = (e) => {
        const rect = canvasRef.current.getBoundingClientRect();
        const position = {
          x: (e.clientX - rect.left - canvasOffset.x) / zoom,
          y: (e.clientY - rect.top - canvasOffset.y) / zoom
        };
        setTemporaryConnection(position);
      };
      
      document.addEventListener('mousemove', handleMouseMove);
      return () => document.removeEventListener('mousemove', handleMouseMove);
    }
  }, [isConnecting, canvasOffset, zoom]);

  const getColorClasses = (color) => {
    const colors = {
      accent: 'border-accent bg-accent/20 text-accent',
      primary: 'border-primary bg-primary/20 text-primary',
      secondary: 'border-secondary bg-secondary/20 text-secondary',
      warning: 'border-warning bg-warning/20 text-warning',
      muted: 'border-text-secondary bg-surface text-text-secondary',
      info: 'border-blue-400 bg-blue-400/20 text-blue-400'
    };
    return colors[color] || colors.muted;
  };

  const createNode = (type, position) => {
    // Set an auto-increasing position if multiple nodes are created
    const newPosition = position || {
      x: 100 + (workflow.nodes?.length || 0) * 50,
      y: 100 + (workflow.nodes?.length || 0) * 50
    };

    // Show hints if this is the first node
    if (!workflow.nodes?.length) {
      setShowHints(true);
    }

    const newNode = {
      id: `node_${Date.now()}`,
      type,
      position: newPosition,
      data: {
        label: nodeTypes[type]?.label || 'Unknown',
        config: {},
        assignedAgent: selectedAIAgent
      },
      inputs: type !== 'trigger' ? 1 : 0,
      outputs: type !== 'notification' ? 1 : 0
    };

    onWorkflowUpdate(prev => ({
      ...prev,
      nodes: [...(prev.nodes || []), newNode]
    }));
    
    // Select the newly created node
    onNodeSelect(newNode);
  };

  const handleNodeDragStart = (e, node) => {
    e.stopPropagation();
    setIsDragging(true);
    setDraggedNode(node);
    setDragStartTime(Date.now());
    const rect = canvasRef.current.getBoundingClientRect();
    setDragOffset({
      x: e.clientX - rect.left - node.position.x,
      y: e.clientY - rect.top - node.position.y
    });
  };

  const handleNodeDrag = (e) => {
    if (!isDragging || !draggedNode) return;
    
    const rect = canvasRef.current.getBoundingClientRect();
    const newPosition = {
      x: e.clientX - rect.left - dragOffset.x,
      y: e.clientY - rect.top - dragOffset.y
    };

    // Add snap to grid functionality
    const gridSize = 20;
    const snappedPosition = {
      x: Math.round(newPosition.x / gridSize) * gridSize,
      y: Math.round(newPosition.y / gridSize) * gridSize
    };

    const updatedNode = {
      ...draggedNode,
      position: snappedPosition
    };

    onNodeUpdate(updatedNode);
    
    // Check if dragging over another node to suggest connection
    const hoveredNodes = workflow.nodes?.filter(n => {
      if (n.id === draggedNode.id) return false;
      
      const nodeRect = {
        left: n.position.x,
        right: n.position.x + 128, // Approximate node width
        top: n.position.y,
        bottom: n.position.y + 80 // Approximate node height
      };
      
      return (
        snappedPosition.x + 64 > nodeRect.left && 
        snappedPosition.x + 64 < nodeRect.right && 
        snappedPosition.y + 40 > nodeRect.top && 
        snappedPosition.y + 40 < nodeRect.bottom
      );
    });
    
    setDragOverNode(hoveredNodes?.[0] || null);
  };

  const handleNodeDragEnd = (e) => {
    if (isDragging && draggedNode && dragOverNode) {
      // If dropped on another node, create a connection
      const dragDuration = Date.now() - dragStartTime;
      
      // Only create connection if the drag was short (to differentiate from regular movement)
      if (dragDuration < 500) {
        // Determine which node should be source and which should be target
        const canBeSource = draggedNode.outputs > 0;
        const canBeTarget = dragOverNode.inputs > 0;
        
        if (canBeSource && canBeTarget) {
          createConnection(draggedNode.id, dragOverNode.id);
        } else if (!canBeSource && dragOverNode.outputs > 0) {
          createConnection(dragOverNode.id, draggedNode.id);
        }
      }
    }
    
    setIsDragging(false);
    setDraggedNode(null);
    setDragOverNode(null);
  };

  const createConnection = (sourceId, targetId) => {
    // Check if connection already exists
    const connectionExists = workflow.connections?.some(
      conn => conn.source === sourceId && conn.target === targetId
    );
    
    if (!connectionExists) {
      const newConnection = {
        id: `conn_${Date.now()}`,
        source: sourceId,
        target: targetId,
        animated: true
      };
      
      onWorkflowUpdate(prev => ({
        ...prev,
        connections: [...(prev.connections || []), newConnection]
      }));
    }
  };

  const handleConnectionStart = (e, nodeId, isOutput = true) => {
    e.stopPropagation();
    
    if (isConnecting) {
      // End connection
      if (connectionStart && connectionStart.nodeId !== nodeId) {
        const sourceId = isOutput ? connectionStart.nodeId : nodeId;
        const targetId = isOutput ? nodeId : connectionStart.nodeId;
        
        createConnection(sourceId, targetId);
      }
      setIsConnecting(false);
      setConnectionStart(null);
      setTemporaryConnection(null);
    } else {
      // Start connection
      setIsConnecting(true);
      setConnectionStart({ nodeId, isOutput });
      setShowHints(false); // Hide hints when user starts interacting
    }
  };

  const handleCanvasClick = (e) => {
    if (e.target === canvasRef.current) {
      // Single click on canvas deselects node
      onNodeSelect(null);
      if (isConnecting) {
        setIsConnecting(false);
        setConnectionStart(null);
        setTemporaryConnection(null);
      }
      
      // Double click on canvas shows quick create menu
      if (e.detail === 2) {
        const rect = canvasRef.current.getBoundingClientRect();
        const position = {
          x: (e.clientX - rect.left - canvasOffset.x) / zoom,
          y: (e.clientY - rect.top - canvasOffset.y) / zoom
        };
        
        setQuickCreatePosition(position);
        setShowQuickCreate(true);
      }
    }
  };

  const handleCanvasDrop = (e) => {
    e.preventDefault();
    const nodeType = e.dataTransfer.getData('text/plain');
    const rect = canvasRef.current.getBoundingClientRect();
    const position = {
      x: (e.clientX - rect.left - canvasOffset.x) / zoom,
      y: (e.clientY - rect.top - canvasOffset.y) / zoom
    };
    createNode(nodeType, position);
    setShowHints(false); // Hide hints when user drops a node
  };

  const handleCanvasDragOver = (e) => {
    e.preventDefault();
  };
  
  const handleNodeContextMenu = (e, node) => {
    e.preventDefault();
    e.stopPropagation();
    setContextMenuNode(node);
    setContextMenuPosition({ x: e.clientX, y: e.clientY });
    setShowNodeContextMenu(true);
  };
  
  const handleDeleteNode = () => {
    if (contextMenuNode) {
      onWorkflowUpdate(prev => ({
        ...prev,
        nodes: prev.nodes.filter(n => n.id !== contextMenuNode.id),
        connections: prev.connections.filter(c => 
          c.source !== contextMenuNode.id && c.target !== contextMenuNode.id
        )
      }));
      setShowNodeContextMenu(false);
      
      // If the deleted node was selected, deselect it
      if (selectedNode?.id === contextMenuNode.id) {
        onNodeSelect(null);
      }
    }
  };
  
  const handleDuplicateNode = () => {
    if (contextMenuNode) {
      const newNode = {
        ...contextMenuNode,
        id: `node_${Date.now()}`,
        position: {
          x: contextMenuNode.position.x + 50,
          y: contextMenuNode.position.y + 50
        }
      };
      
      onWorkflowUpdate(prev => ({
        ...prev,
        nodes: [...prev.nodes, newNode]
      }));
      
      onNodeSelect(newNode);
      setShowNodeContextMenu(false);
    }
  };

  const renderNode = (node) => {
    const nodeConfig = nodeTypes[node.type] || nodeTypes.action;
    const isSelected = selectedNode?.id === node.id;
    const isHovered = hoveredNode?.id === node.id;
    const isDraggedOver = dragOverNode?.id === node.id;
    
    return (
      <div
        key={node.id}
        className={`
          absolute cursor-move glass-effect border-2 rounded-xl p-4 transition-all duration-300 group min-w-32
          ${getColorClasses(nodeConfig.color)}
          ${isSelected ? 'shadow-glow-accent scale-105' : 'hover:scale-102'}
          ${isDraggedOver ? 'border-accent border-dashed' : ''}
        `}
        style={{
          left: node.position.x,
          top: node.position.y,
          transform: `scale(${zoom})`,
          transformOrigin: 'top left',
          zIndex: isSelected ? 10 : 1
        }}
        onMouseDown={(e) => handleNodeDragStart(e, node)}
        onMouseEnter={() => setHoveredNode(node)}
        onMouseLeave={() => setHoveredNode(null)}
        onClick={(e) => {
          e.stopPropagation();
          onNodeSelect(node);
        }}
        onContextMenu={(e) => handleNodeContextMenu(e, node)}
      >
        {/* Node Header */}
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-2">
            <Icon name={nodeConfig.icon} size={16} />
            <span className="text-sm font-medium">{node.data.label}</span>
          </div>
          
          {/* Quick Actions (visible on hover) */}
          <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex space-x-1">
            <button 
              className="p-1 hover:bg-surface/70 rounded-full text-text-secondary hover:text-text-primary transition-colors duration-300"
              onClick={(e) => {
                e.stopPropagation();
                handleDuplicateNode(node);
              }}
            >
              <Icon name="Copy" size={12} />
            </button>
            <button 
              className="p-1 hover:bg-error/20 rounded-full text-text-secondary hover:text-error transition-colors duration-300"
              onClick={(e) => {
                e.stopPropagation();
                handleDeleteNode(node);
              }}
            >
              <Icon name="Trash" size={12} />
            </button>
          </div>
        </div>

        {/* Node Content */}
        <div className="text-xs opacity-75 mb-3">
          {node.data.assignedAgent ? (
            <div className="flex items-center space-x-1">
              <Icon name="User" size={12} />
              <span>{node.data.assignedAgent.name}</span>
            </div>
          ) : (
            node.data.config?.description || nodeConfig.description
          )}
        </div>

        {/* Connection Points */}
        {node.inputs > 0 && (
          <div
            className={`absolute -top-2 left-1/2 transform -translate-x-1/2 w-4 h-4 bg-surface border-2 border-white/20 rounded-full cursor-pointer hover:border-accent transition-colors duration-300 ${isConnecting && !connectionStart?.isOutput ? 'border-accent animate-pulse' : ''}`}
            onClick={(e) => handleConnectionStart(e, node.id, false)}
          />
        )}
        
        {node.outputs > 0 && (
          <div
            className={`absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-4 h-4 bg-surface border-2 border-white/20 rounded-full cursor-pointer hover:border-accent transition-colors duration-300 ${isConnecting && connectionStart?.isOutput ? 'border-accent animate-pulse' : ''}`}
            onClick={(e) => handleConnectionStart(e, node.id, true)}
          />
        )}

        {/* Node Status Indicator */}
        <div className={`absolute -top-1 -right-1 w-3 h-3 rounded-full ${node.status === 'active' ? 'bg-success' : node.status === 'error' ? 'bg-error' : node.status === 'running'? 'bg-warning animate-pulse' : 'bg-surface border border-white/20'}`} />
      </div>
    );
  };

  const renderConnections = () => {
    return workflow.connections?.map((connection) => {
      const sourceNode = workflow.nodes.find(n => n.id === connection.source);
      const targetNode = workflow.nodes.find(n => n.id === connection.target);
      
      if (!sourceNode || !targetNode) return null;

      const sourcePoint = {
        x: sourceNode.position.x + 64, // Center of node
        y: sourceNode.position.y + 80  // Bottom of node
      };
      
      const targetPoint = {
        x: targetNode.position.x + 64, // Center of node
        y: targetNode.position.y       // Top of node
      };

      // Calculate control points for a nicer curve
      const deltaY = Math.abs(targetPoint.y - sourcePoint.y);
      const controlPointOffset = Math.min(80, deltaY * 0.5);

      return (
        <svg
          key={connection.id}
          className="absolute top-0 left-0 pointer-events-none"
          style={{ zIndex: 0, width: '100%', height: '100%' }}
        >
          <defs>
            <marker
              id={`arrowhead-${connection.id}`}
              markerWidth="10"
              markerHeight="7"
              refX="9"
              refY="3.5"
              orient="auto"
            >
              <polygon
                points="0 0, 10 3.5, 0 7"
                className="fill-accent"
              />
            </marker>
          </defs>
          <path
            d={`M ${sourcePoint.x} ${sourcePoint.y} C ${sourcePoint.x} ${sourcePoint.y + controlPointOffset}, ${targetPoint.x} ${targetPoint.y - controlPointOffset}, ${targetPoint.x} ${targetPoint.y}`}
            stroke="#06FFA5"
            strokeWidth="2"
            fill="none"
            markerEnd={`url(#arrowhead-${connection.id})`}
            className={connection.animated ? 'animate-pulse' : ''}
          />
        </svg>
      );
    }) || [];
  };

  const renderTemporaryConnection = () => {
    if (!isConnecting || !connectionStart || !temporaryConnection) return null;
    
    const sourceNode = workflow.nodes.find(n => n.id === connectionStart.nodeId);
    if (!sourceNode) return null;
    
    // Calculate source point
    const sourcePoint = connectionStart.isOutput 
      ? { x: sourceNode.position.x + 64, y: sourceNode.position.y + 80 } // bottom center
      : { x: sourceNode.position.x + 64, y: sourceNode.position.y }; // top center
    
    // The target point is the current mouse position
    const targetPoint = temporaryConnection;
    
    // Calculate control points for a nicer curve
    const deltaY = Math.abs(targetPoint.y - sourcePoint.y);
    const controlPointOffset = Math.min(80, deltaY * 0.5);
    
    return (
      <svg
        className="absolute top-0 left-0 pointer-events-none"
        style={{ zIndex: 5, width: '100%', height: '100%' }}
      >
        <path
          d={connectionStart.isOutput 
            ? `M ${sourcePoint.x} ${sourcePoint.y} C ${sourcePoint.x} ${sourcePoint.y + controlPointOffset}, ${targetPoint.x} ${targetPoint.y - controlPointOffset}, ${targetPoint.x} ${targetPoint.y}`
            : `M ${targetPoint.x} ${targetPoint.y} C ${targetPoint.x} ${targetPoint.y + controlPointOffset}, ${sourcePoint.x} ${sourcePoint.y - controlPointOffset}, ${sourcePoint.x} ${sourcePoint.y}`
          }
          stroke="#06FFA5"
          strokeWidth="2"
          strokeDasharray="5,5"
          fill="none"
        />
      </svg>
    );
  };
  
  const renderNodeContextMenu = () => {
    if (!showNodeContextMenu || !contextMenuNode) return null;
    
    return (
      <div 
        className="fixed z-50 glass-effect border border-white/20 rounded-lg shadow-lg overflow-hidden"
        style={{ left: contextMenuPosition.x, top: contextMenuPosition.y }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-2 text-sm text-text-secondary border-b border-white/10">
          {contextMenuNode.data?.label || 'Node Actions'}
        </div>
        <div className="py-1">
          <button
            className="w-full text-left px-4 py-2 text-sm text-text-primary hover:bg-surface/50 transition-colors duration-300 flex items-center space-x-2"
            onClick={handleDuplicateNode}
          >
            <Icon name="Copy" size={14} />
            <span>نسخ العنصر</span>
          </button>
          <button
            className="w-full text-left px-4 py-2 text-sm text-error hover:bg-error/10 transition-colors duration-300 flex items-center space-x-2"
            onClick={handleDeleteNode}
          >
            <Icon name="Trash" size={14} />
            <span>حذف العنصر</span>
          </button>
        </div>
      </div>
    );
  };
  
  const renderQuickCreatePanel = () => {
    if (!showQuickCreate) return null;
    
    return (
      <div 
        className="absolute glass-effect border border-white/20 rounded-lg p-2 z-10 flex flex-wrap gap-2 max-w-md"
        style={{ 
          left: quickCreatePosition.x, 
          top: quickCreatePosition.y,
          transform: 'translate(-50%, -50%)'
        }}
      >
        {Object.entries(nodeTypes).map(([type, config]) => (
          <button
            key={type}
            onClick={() => {
              createNode(type, quickCreatePosition);
              setShowQuickCreate(false);
            }}
            className={`flex items-center space-x-1 px-3 py-2 rounded-lg transition-all duration-300 ${getColorClasses(config.color)}`}
          >
            <Icon name={config.icon} size={14} />
            <span className="text-xs">{config.label}</span>
          </button>
        ))}
        <button 
          className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 bg-surface p-1 rounded-full border border-white/20 text-text-secondary"
          onClick={() => setShowQuickCreate(false)}
        >
          <Icon name="X" size={12} />
        </button>
      </div>
    );
  };

  return (
    <div className={`flex flex-col h-full ${className}`}>
      {/* Toolbar */}
      <div className="border-b border-white/10 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h3 className="text-lg font-semibold text-text-primary">
              {workflow.name}
            </h3>
            {selectedAIAgent && (
              <div className="flex items-center space-x-2 px-3 py-1 bg-secondary/20 rounded-lg">
                <img
                  src={selectedAIAgent.avatar}
                  alt={selectedAIAgent.name}
                  className="w-6 h-6 rounded-full"
                />
                <span className="text-sm text-secondary">{selectedAIAgent.name}</span>
              </div>
            )}
          </div>

          <div className="flex items-center space-x-2">
            {/* Zoom Controls */}
            <div className="flex items-center space-x-1 glass-effect rounded-lg p-1">
              <button
                onClick={() => setZoom(Math.max(0.5, zoom - 0.1))}
                className="p-2 rounded glass-hover"
              >
                <Icon name="Minus" size={16} className="text-text-secondary" />
              </button>
              <span className="px-2 text-sm text-text-secondary min-w-12 text-center">
                {Math.round(zoom * 100)}%
              </span>
              <button
                onClick={() => setZoom(Math.min(2, zoom + 0.1))}
                className="p-2 rounded glass-hover"
              >
                <Icon name="Plus" size={16} className="text-text-secondary" />
              </button>
            </div>

            {/* View Controls */}
            <button
              onClick={() => {
                setZoom(1);
                setCanvasOffset({ x: 0, y: 0 });
              }}
              className="p-2 glass-effect rounded-lg glass-hover"
            >
              <Icon name="Home" size={16} className="text-text-secondary" />
            </button>
          </div>
        </div>

        {/* Node Palette */}
        <div className="flex items-center space-x-2 mt-4 overflow-x-auto node-palette">
          {Object.entries(nodeTypes).map(([type, config]) => (
            <div
              key={type}
              draggable
              onDragStart={(e) => {
                e.dataTransfer.setData('text/plain', type);
                setShowHints(false); // Hide hints when user starts dragging
              }}
              className={`
                flex items-center space-x-2 px-3 py-2 rounded-lg cursor-move transition-all duration-300 whitespace-nowrap
                glass-effect border hover:scale-105 ${getColorClasses(config.color)}
              `}
            >
              <Icon name={config.icon} size={16} />
              <span className="text-sm">{config.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Canvas */}
      <div className="flex-1 relative overflow-hidden bg-gradient-to-br from-background to-surface/50">
        <div
          ref={canvasRef}
          className="w-full h-full relative cursor-crosshair"
          onMouseMove={handleNodeDrag}
          onMouseUp={handleNodeDragEnd}
          onClick={handleCanvasClick}
          onDrop={handleCanvasDrop}
          onDragOver={handleCanvasDragOver}
          style={{
            transform: `translate(${canvasOffset.x}px, ${canvasOffset.y}px)`
          }}
        >
          {/* Grid Pattern */}
          <div 
            className="absolute inset-0 opacity-10"
            style={{
              backgroundImage: `
                radial-gradient(circle, #06FFA5 1px, transparent 1px)
              `,
              backgroundSize: `${40 * zoom}px ${40 * zoom}px`
            }}
          />

          {/* Connections */}
          {renderConnections()}
          {renderTemporaryConnection()}

          {/* Nodes */}
          {workflow.nodes?.map(renderNode) || []}
          
          {/* Quick Create Panel */}
          {renderQuickCreatePanel()}

          {/* Hint Tooltips */}
          {showHints && (
            <div className="absolute inset-0 pointer-events-none flex items-center justify-center z-30">
              <div className="glass-effect border border-white/20 rounded-xl p-6 max-w-md text-center">
                <div className="w-16 h-16 bg-accent/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Icon name="Lightbulb" size={24} className="text-accent" />
                </div>
                <h3 className="text-xl font-semibold text-text-primary mb-2">
                  لنبدأ بإنشاء سير العمل
                </h3>
                <p className="text-text-secondary mb-4">
                  اسحب العناصر من الشريط العلوي وأفلتها هنا، أو انقر نقراً مزدوجاً لإضافة عنصر جديد بسرعة.
                </p>
                <div className="flex space-x-2 justify-center">
                  <button 
                    onClick={() => setShowHints(false)}
                    className="px-4 py-2 glass-effect border border-white/10 rounded-lg text-text-secondary hover:text-text-primary transition-colors duration-300"
                  >
                    فهمت
                  </button>
                  <button 
                    onClick={() => {
                      createNode('trigger', { x: 100, y: 100 });
                      setShowHints(false);
                    }}
                    className="px-4 py-2 bg-accent hover:bg-accent-600 text-background rounded-lg transition-colors duration-300"
                  >
                    إضافة نقطة بداية
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Empty State */}
          {(!workflow.nodes || workflow.nodes.length === 0) && !showHints && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <div className="w-20 h-20 bg-accent/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Icon name="GitBranch" size={32} className="text-accent" />
                </div>
                <h3 className="text-xl font-semibold text-text-primary mb-2">
                  ابدأ في بناء سير العمل
                </h3>
                <p className="text-text-secondary max-w-md">
                  اسحب العناصر من الشريط العلوي أو اختر قالباً جاهزاً من الشريط الجانبي
                </p>
                <div className="flex flex-wrap gap-2 justify-center mt-4">
                  {Object.entries(nodeTypes).slice(0, 3).map(([type, config]) => (
                    <button
                      key={type}
                      onClick={() => createNode(type)}
                      className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-all duration-300 ${getColorClasses(config.color)}`}
                    >
                      <Icon name={config.icon} size={16} />
                      <span>إضافة {config.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Context Menu */}
      {renderNodeContextMenu()}
    </div>
  );
};

export default WorkflowCanvas;