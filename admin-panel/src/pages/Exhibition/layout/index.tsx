import React, { useState, useEffect } from 'react';
import { Button, Card, Col, Row, Spin, Typography, message } from 'antd';
import { SaveOutlined } from '@ant-design/icons';
import { highPerformanceController } from './components/LayoutCanvasUtils';
import { useLayoutData } from './hooks/useLayoutData';
import { useLayoutSave } from './hooks/useLayoutSave';
import { useLayoutInteractions } from './hooks/useLayoutInteractions';
import SelectionView from './components/SelectionView';
import WorkspaceView from './components/WorkspaceView';
import SpaceModal from './components/modals/SpaceModal';
import HallModal from './components/modals/HallModal';
import StallModal from './components/modals/StallModal';
import FixtureModal from './components/modals/FixtureModal';
import { ViewMode } from './types/layout-types';

const { Title, Text } = Typography;

const ExhibitionLayout: React.FC = () => {
  // State management
  const [viewMode, setViewMode] = useState<ViewMode>('selection');
  const [spaceModalVisible, setSpaceModalVisible] = useState(false);
  const [spaceModalMode, setSpaceModalMode] = useState<'create' | 'edit'>('create');
  const [hallModalVisible, setHallModalVisible] = useState(false);
  const [hallModalMode, setHallModalMode] = useState<'create' | 'edit'>('create');
  const [editingHall, setEditingHall] = useState<any>(null);
  const [stallModalVisible, setStallModalVisible] = useState(false);
  const [stallModalMode, setStallModalMode] = useState<'create' | 'edit'>('create');
  const [editingStall, setEditingStall] = useState<any>(null);
  const [fixtureModalVisible, setFixtureModalVisible] = useState(false);
  const [selectedHallForStalls, setSelectedHallForStalls] = useState<string | null>(null);
  const [selectedHallIdForDelete, setSelectedHallIdForDelete] = useState<string | null>(null);

  // Data loading hook
  const {
    exhibition,
    layout,
    setLayout,
    loading,
    layoutExistsInBackend,
    setLayoutExistsInBackend,
    reload
  } = useLayoutData();

  // Save operations hook
  const { handleSave, autoSave, saving } = useLayoutSave(
    layout,
    layoutExistsInBackend,
    setLayoutExistsInBackend
  );

  // Interaction handling hook with high-performance optimizations
  const {
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
    handleWheel,
    handleCenterView,
    handlePositionUpdate,
    handleDragComplete,
    cleanup: cleanupInteractions
  } = useLayoutInteractions(layout, setLayout, autoSave);

  // Initialize performance monitoring
  useEffect(() => {
    if (layout?.space?.halls) {
      const totalStalls = layout.space.halls.reduce((count, hall) => count + hall.stalls.length, 0);
      if (totalStalls > 100) {
        console.log('🚀 High-Performance Layout System Active:', {
          totalStalls,
          halls: layout.space.halls.length,
          optimizationLevel: totalStalls > 1000 ? 'Ultra' : totalStalls > 500 ? 'High' : 'Medium'
        });
        
        // Initialize high-performance controller
        highPerformanceController.initialize(totalStalls);
      }
    }
  }, [layout?.space?.halls]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cleanupInteractions();
      highPerformanceController.cleanup();
    };
  }, [cleanupInteractions]);

  // Auto-center view when any modal opens (like frontend behavior)
  useEffect(() => {
    const isAnyModalOpen = stallModalVisible || hallModalVisible || spaceModalVisible || fixtureModalVisible;
    
    if (isAnyModalOpen && layout?.space) {
      // Center the view when modal opens
      handleCenterView();
    }
  }, [stallModalVisible, hallModalVisible, spaceModalVisible, fixtureModalVisible, layout?.space, handleCenterView]);

  // View mode handlers
  const handleViewModeChange = (mode: ViewMode) => {
    // Enforce step-by-step workflow
    if (mode === 'hall' && !layout?.space) {
      message.warning('Please create Exhibition Space first');
      return;
    }
    if (mode === 'stall' && (!layout?.space || layout.space.halls.length === 0)) {
      message.warning('Please create at least one Hall first');
      return;
    }
    
    // Reset hall selection when switching modes
    setSelectedHallForStalls(null);
    setViewMode(mode);
  };

  const handleBackToSelection = () => {
    setViewMode('selection');
  };

  // Modal handlers
  const handleModalClose = () => {
    setSpaceModalVisible(false);
    setHallModalVisible(false);
    setStallModalVisible(false);
    setFixtureModalVisible(false);
    // Reset edit state
    setEditingStall(null);
    setStallModalMode('create');
    setEditingHall(null);
    setHallModalMode('create');
    setSpaceModalMode('create');
  };

  const handleShowSpaceModal = () => {
    if (layout?.space) {
      setSpaceModalMode('edit');
    } else {
      setSpaceModalMode('create');
    }
    setSpaceModalVisible(true);
  };

  const handleShowHallModal = () => {
    if (!layout?.space) {
      message.warning('Please create Exhibition Space first');
      return;
    }
    setHallModalVisible(true);
  };

  const handleEditHall = (hallId: string) => {
    if (layout?.space?.halls) {
      const hallToEdit = layout.space.halls.find(hall => hall.id === hallId);
      if (hallToEdit) {
        // Ensure widthSqm and heightSqm are calculated if missing
        const editingHallData = {
          ...hallToEdit,
          widthSqm: hallToEdit.widthSqm || Math.round((hallToEdit.width / layout.pixelsPerSqm) * 10) / 10,
          heightSqm: hallToEdit.heightSqm || Math.round((hallToEdit.height / layout.pixelsPerSqm) * 10) / 10
        };
        
        setEditingHall(editingHallData);
        setHallModalMode('edit');
        setHallModalVisible(true);
      }
    }
  };

  const handleShowStallModal = () => {
    if (!layout?.space) {
      message.warning('Please create Exhibition Space first');
      return;
    }
    if (layout.space.halls.length === 0) {
      message.warning('Please create at least one Hall first');
      return;
    }
    if (!selectedHallForStalls) {
      message.warning('Please select a hall first by clicking on it');
      return;
    }
    setStallModalMode('create');
    setEditingStall(null);
    setStallModalVisible(true);
  };

  // Add handler for editing existing stall
  const handleEditStall = (stallId: string) => {
    if (!layout?.space) return;
    
    // Find the stall to edit
    let stallToEdit = null;
    let parentHall = null;
    
    for (const hall of layout.space.halls) {
      const stall = hall.stalls.find(s => s.id === stallId);
      if (stall) {
        stallToEdit = stall;
        parentHall = hall;
        break;
      }
    }
    
    if (stallToEdit && parentHall) {
          console.log('=== HANDLE EDIT STALL DEBUG ===');
    console.log('stallToEdit ID:', stallToEdit.id, 'Number:', stallToEdit.number);
    console.log('stallToEdit.stallType:', stallToEdit.stallType);
    console.log('stallToEdit.type:', stallToEdit.type);
    console.log('stallToEdit keys:', Object.keys(stallToEdit));
      
      setStallModalMode('edit');
      setEditingStall({
        ...stallToEdit,
        hallId: parentHall.id,
        hallName: parentHall.name
      });
      setStallModalVisible(true);
    } else {
      message.error('Stall not found');
    }
  };

  // Add handler for hall selection in stall mode
  const handleHallSelect = (hallId: string) => {
    setSelectedHallForStalls(hallId);
    const selectedHall = layout?.space?.halls.find(h => h.id === hallId);
    if (selectedHall) {
      message.success(`Hall "${selectedHall.name}" selected. Now you can add stalls to it.`);
    }
  };

  const handleShowFixtureModal = () => {
    setFixtureModalVisible(true);
  };

  // Data handlers
  const handleSpaceSave = (spaceData: any) => {
    if (layout) {
      let updatedLayout;
      
      if (spaceModalMode === 'edit' && layout.space) {
        // Edit mode: preserve existing space data, only update dimensions and name
        updatedLayout = { 
          ...layout, 
          space: {
            ...layout.space, // Preserve existing space data including ID, position, halls, etc.
            name: spaceData.name,
            widthSqm: spaceData.widthSqm,
            heightSqm: spaceData.heightSqm,
            width: spaceData.widthSqm * layout.pixelsPerSqm,
            height: spaceData.heightSqm * layout.pixelsPerSqm,
            // Keep existing: id, x, y, color, halls
          }
        };
        message.success('Exhibition Space updated successfully!');
      } else {
        // Create mode: create new space
        updatedLayout = { 
          ...layout, 
          space: {
            ...spaceData,
            id: `space_${Date.now()}`,
            x: 0, // Start at center
            y: 0, // Start at center
            width: spaceData.widthSqm * layout.pixelsPerSqm,
            height: spaceData.heightSqm * layout.pixelsPerSqm,
            color: '#e6f7ff',
            halls: []
          }
        };
        message.success('Exhibition Space created successfully! You can now proceed to create Halls.');
      }
      
      setLayout(updatedLayout);
      autoSave(updatedLayout);
      handleModalClose();
    }
  };

  // Add space delete handler
  const handleSpaceDelete = async () => {
    if (layout?.space) {
      const updatedLayout = {
        ...layout,
        space: null
      };
      setLayout(updatedLayout);
      await autoSave(updatedLayout);
      handleModalClose();
      message.success('Exhibition Space deleted successfully.');
    }
  };

  // Add stall delete handler
  const handleStallDelete = async (stallId: string) => {
    if (layout?.space) {
      const updatedHalls = layout.space.halls.map(hall => ({
        ...hall,
        stalls: hall.stalls.filter(stall => stall.id !== stallId)
      }));
      
      const updatedLayout = {
        ...layout,
        space: { ...layout.space, halls: updatedHalls }
      };
      
      setLayout(updatedLayout);
      await autoSave(updatedLayout);
      handleModalClose();
      message.success('Stall deleted successfully.');
    }
  };

  // Add hall delete handler
  const handleHallDelete = async (hallId: string) => {
    if (layout?.space) {
      const hallToDelete = layout.space.halls.find(h => h.id === hallId);
      if (!hallToDelete) {
        message.error('Hall not found!');
        return;
      }

      const stallCount = hallToDelete.stalls.length;
      if (stallCount > 0) {
        message.error(`Cannot delete hall "${hallToDelete.name}" because it contains ${stallCount} stall(s). Please delete all stalls first.`);
        return;
      }

      const updatedHalls = layout.space.halls.filter(hall => hall.id !== hallId);
      
      const updatedLayout = {
        ...layout,
        space: { ...layout.space, halls: updatedHalls }
      };
      
      setLayout(updatedLayout);
      await autoSave(updatedLayout);
      message.success(`Hall "${hallToDelete.name}" deleted successfully.`);
    }
  };

  // Keyboard event handler for deleting selected elements
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Delete' && selectedHallIdForDelete && viewMode === 'hall') {
        event.preventDefault();
        const hallToDelete = layout?.space?.halls.find(h => h.id === selectedHallIdForDelete);
        if (hallToDelete) {
          const stallCount = hallToDelete.stalls.length;
          if (stallCount > 0) {
            message.warning(`Cannot delete hall "${hallToDelete.name}" because it contains ${stallCount} stall(s). Please delete all stalls first.`);
          } else {
            handleHallDelete(selectedHallIdForDelete);
            setSelectedHallIdForDelete(null);
          }
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [selectedHallIdForDelete, viewMode, layout?.space?.halls]);

  const handleHallSave = (hallData: any) => {
    if (layout?.space) {
      if (hallModalMode === 'edit' && editingHall) {
        // Edit mode: update existing hall
        const updatedLayout = {
          ...layout,
          space: {
            ...layout.space,
            halls: layout.space.halls.map(hall => 
              hall.id === editingHall.id 
                ? { ...hall, ...hallData, id: editingHall.id, x: hall.x, y: hall.y, stalls: hall.stalls }
                : hall
            )
          }
        };
        
        setLayout(updatedLayout);
        autoSave(updatedLayout);
        handleModalClose();
        message.success('Hall updated successfully!');
        return;
      }
      
      // Create mode: Smart positioning algorithm
      const findOptimalPosition = () => {
        const space = layout.space;
        if (!space) return null;
        
        const padding = 20; // 20 pixels padding from edges
        const hallWidth = hallData.width;
        const hallHeight = hallData.height;
        
        // Ensure hall fits within space boundaries
        const maxX = space.width - hallWidth - padding;
        const maxY = space.height - hallHeight - padding;
        
        if (maxX < padding || maxY < padding) {
          message.error('Hall is too large for the available exhibition space!');
          return null;
        }

        // Try to find a position that doesn't overlap with existing halls
        const existingHalls = space.halls;
        
        // Start from center and spiral outward
        const centerX = (space.width - hallWidth) / 2;
        const centerY = (space.height - hallHeight) / 2;
        
        // Check if center position is free
        const isPositionFree = (x: number, y: number) => {
          return !existingHalls.some(hall => {
            return !(
              x >= hall.x + hall.width ||
              x + hallWidth <= hall.x ||
              y >= hall.y + hall.height ||
              y + hallHeight <= hall.y
            );
          });
        };
        
        // Try center first
        if (isPositionFree(centerX, centerY)) {
          return { x: centerX, y: centerY };
        }
        
        // Spiral search for free position
        const gridSize = 30; // Search in 30px increments
        for (let radius = gridSize; radius <= Math.max(space.width, space.height) / 2; radius += gridSize) {
          for (let angle = 0; angle < 360; angle += 45) {
            const x = centerX + radius * Math.cos(angle * Math.PI / 180);
            const y = centerY + radius * Math.sin(angle * Math.PI / 180);
            
            if (x >= padding && y >= padding && x <= maxX && y <= maxY) {
              if (isPositionFree(x, y)) {
                return { x: Math.round(x), y: Math.round(y) };
              }
            }
          }
        }
        
        // Fallback: find any free position in a grid
        for (let y = padding; y <= maxY; y += gridSize) {
          for (let x = padding; x <= maxX; x += gridSize) {
            if (isPositionFree(x, y)) {
              return { x, y };
            }
          }
        }
        
        // Last resort: place at top-left with padding
        return { x: padding, y: padding };
      };

      const position = findOptimalPosition();
      if (!position) return; // Hall too large, error already shown

      const newHall = {
        ...hallData,
        id: `hall_${Date.now()}`,
        spaceId: layout.space.id,
        x: position.x,
        y: position.y,
        // hallData already contains: width, height, widthSqm, heightSqm, color
        stalls: []
      };
      
      const updatedHalls = [...layout.space.halls, newHall];
      const updatedLayout = {
        ...layout,
        space: { ...layout.space, halls: updatedHalls }
      };
      setLayout(updatedLayout);
      autoSave(updatedLayout);
      handleModalClose();
      message.success(`Hall "${hallData.name}" created successfully! Position: ${Math.round(position.x/layout.pixelsPerSqm)}m, ${Math.round(position.y/layout.pixelsPerSqm)}m`);
    }
  };

  const handleStallSave = (stallData: any) => {
    console.log('=== HANDLE STALL SAVE DEBUG ===');
    console.log('Received stallData:', stallData);
    console.log('stallData.type:', stallData.type);
    console.log('stallData.stallType:', stallData.stallType);
    
    if (layout?.space) {
      // For edit mode, use the hall ID from the editing stall
      // For create mode, use the selected hall
      const targetHallId = stallData.isEdit ? stallData.hallId : selectedHallForStalls;
      const targetHall = layout.space.halls.find(hall => hall.id === targetHallId);
      if (!targetHall) {
        message.error('Target hall not found!');
        return;
      }

      if (stallData.isEdit) {
        // Handle edit mode - update existing stall
        const updatedHalls = layout.space.halls.map(hall => ({
          ...hall,
          stalls: hall.stalls.map(stall => 
            stall.id === stallData.id 
              ? {
                  ...stall,
                  number: stallData.number,
                  widthSqm: stallData.widthSqm,
                  heightSqm: stallData.heightSqm,
                  width: stallData.width,
                  height: stallData.height,
                  stallType: stallData.stallType || stallData.type, // Use stallType field
                  type: stallData.type, // Keep type for compatibility
                  status: stallData.status,
                  color: stallData.color,
                  price: stallData.price,
                  description: stallData.description,
                  // Keep existing position
                  x: stall.x,
                  y: stall.y
                }
              : stall
          )
        }));
        
        console.log('Edit mode - Updated stall with stallType:', stallData.stallType || stallData.type);
        
        const updatedLayout = {
          ...layout,
          space: { ...layout.space, halls: updatedHalls }
        };
        setLayout(updatedLayout);
        autoSave(updatedLayout);
        handleModalClose();
        message.success(`Stall "${stallData.number}" updated successfully!`);
      } else {
        // Handle create mode - create new stall
        // Smart positioning algorithm within the hall
        const findOptimalStallPosition = () => {
          const padding = 10; // 10 pixels padding from hall edges
          const stallWidth = stallData.width;
          const stallHeight = stallData.height;
          
          // Calculate available space within the hall
          const maxX = targetHall.width - stallWidth - padding;
          const maxY = targetHall.height - stallHeight - padding;
          
          if (maxX < padding || maxY < padding) {
            message.error('Stall is too large for the selected hall!');
            return null;
          }

          // Check for overlap with existing stalls in this hall
          const existingStalls = targetHall.stalls || [];
          
          const isPositionFree = (x: number, y: number) => {
            return !existingStalls.some(stall => {
              return !(
                x >= stall.x + stall.width ||
                x + stallWidth <= stall.x ||
                y >= stall.y + stall.height ||
                y + stallHeight <= stall.y
              );
            });
          };
          
          // Start from top-left and search systematically
          const gridSize = 20; // Search in 20px increments
          
          // Try rows from top to bottom, columns from left to right
          for (let y = padding; y <= maxY; y += gridSize) {
            for (let x = padding; x <= maxX; x += gridSize) {
              if (isPositionFree(x, y)) {
                return { x: Math.round(x), y: Math.round(y) };
              }
            }
          }
          
          // If no grid position works, try finer search
          for (let y = padding; y <= maxY; y += 5) {
            for (let x = padding; x <= maxX; x += 5) {
              if (isPositionFree(x, y)) {
                return { x: Math.round(x), y: Math.round(y) };
              }
            }
          }
          
          // Last resort: place at top-left corner with padding
          return { x: padding, y: padding };
        };

        const position = findOptimalStallPosition();
        if (!position) return; // Stall too large, error already shown

        const newStall = {
          ...stallData,
          id: `stall_${Date.now()}`,
          x: position.x,
          y: position.y,
          hallId: targetHallId, // Ensure hallId is set correctly
          stallType: stallData.stallType || stallData.type, // Ensure stallType is set
          // stallData already contains: width, height, widthSqm, heightSqm, type, status, color, price
        };

        console.log('Created newStall object:', newStall);
        console.log('newStall.type:', newStall.type);
        console.log('newStall.stallType:', newStall.stallType);

        const updatedHalls = layout.space.halls.map(hall => {
          if (hall.id === targetHallId) {
            return { ...hall, stalls: [...hall.stalls, newStall] };
          }
          return hall;
        });
        
        const updatedLayout = {
          ...layout,
          space: { ...layout.space, halls: updatedHalls }
        };
        
        console.log('Final updatedLayout with new stall:', updatedLayout);
        
        setLayout(updatedLayout);
        autoSave(updatedLayout);
        handleModalClose();
        
        // Calculate position in meters for user feedback
        const positionInMeters = {
          x: Math.round(position.x / layout.pixelsPerSqm * 10) / 10,
          y: Math.round(position.y / layout.pixelsPerSqm * 10) / 10
        };
        
        message.success(`Stall "${stallData.number}" created in ${targetHall.name}! Position: ${positionInMeters.x}m, ${positionInMeters.y}m from hall origin.`);
      }
    }
  };

  const handleFixtureSave = (fixtureData: any) => {
    if (layout) {
      const newFixture = {
        ...fixtureData,
        id: `fixture_${Date.now()}`,
        x: 200,
        y: 200,
        color: '#f9f0ff'
      };
      
      const updatedLayout = {
        ...layout,
        fixtures: [...layout.fixtures, newFixture]
      };
      setLayout(updatedLayout);
      autoSave(updatedLayout);
      handleModalClose();
      message.success('Fixture added successfully!');
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <Spin size="large" />
      </div>
    );
  }

  if (!layout) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <Title level={4}>Unable to load layout</Title>
        <Button onClick={reload}>Retry</Button>
      </div>
    );
  }

  return (
    <div style={{ padding: '24px' }}>
      {/* Header - only show on selection view */}
      {viewMode === 'selection' && (
        <Row gutter={[16, 16]}>
          <Col span={24}>
            <Card>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <Title level={3} style={{ margin: 0 }}>
                    {exhibition.name} - Layout Builder
                  </Title>
                  <Text type="secondary">
                    Choose a builder to start creating your exhibition layout
                  </Text>
                </div>
                <Button
                  type="primary"
                  icon={<SaveOutlined />}
                  loading={saving}
                  onClick={handleSave}
                  size="large"
                >
                  Save Layout
                </Button>
              </div>
            </Card>
          </Col>
        </Row>
      )}

      {/* Main Content */}
      {viewMode === 'selection' ? (
        <SelectionView
          layout={layout}
          onViewModeChange={handleViewModeChange}
          onShowSpaceModal={handleShowSpaceModal}
          onShowHallModal={handleShowHallModal}
          onShowStallModal={handleShowStallModal}
          onShowFixtureModal={handleShowFixtureModal}
        />
      ) : (
        <WorkspaceView
          exhibition={exhibition}
          layout={layout}
          viewMode={viewMode}
          saving={saving}
          onBackToSelection={handleBackToSelection}
          onSave={handleSave}
          onShowSpaceModal={handleShowSpaceModal}
          onShowHallModal={handleShowHallModal}
          onShowStallModal={handleShowStallModal}
          onShowFixtureModal={handleShowFixtureModal}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onWheel={handleWheel}
          onEditStall={handleEditStall}
          onEditHall={handleEditHall}
          selectedHallForStalls={selectedHallForStalls}
          onHallSelect={handleHallSelect}
          onHallSelectForDelete={setSelectedHallIdForDelete}
          onPositionUpdate={handlePositionUpdate}
          onDragComplete={handleDragComplete}
          isModalOpen={stallModalVisible || hallModalVisible || spaceModalVisible || fixtureModalVisible}
        />
      )}

      {/* Modals */}
      <SpaceModal
        visible={spaceModalVisible}
        exhibition={exhibition}
        onCancel={handleModalClose}
        onSubmit={handleSpaceSave}
        onDelete={handleSpaceDelete}
        existingSpace={layout?.space}
        mode={spaceModalMode}
      />
      
      <HallModal
        visible={hallModalVisible}
        onCancel={handleModalClose}
        onSubmit={handleHallSave}
        exhibitionSpace={layout?.space ? {
          widthSqm: layout.space.widthSqm,
          heightSqm: layout.space.heightSqm,
          pixelsPerSqm: layout.pixelsPerSqm
        } : undefined}
        editingHall={editingHall}
        mode={hallModalMode}
        onDelete={handleHallDelete}
      />
      
      <StallModal
        visible={stallModalVisible}
        layout={layout}
        onCancel={handleModalClose}
        onSubmit={handleStallSave}
        exhibitionId={exhibition?._id}
        editingStall={editingStall}
        stallModalMode={stallModalMode}
        onEditStall={handleEditStall}
        selectedHallId={stallModalMode === 'create' ? selectedHallForStalls : undefined}
        onDelete={handleStallDelete}
      />
      
      <FixtureModal
        visible={fixtureModalVisible}
        onCancel={handleModalClose}
        onSubmit={handleFixtureSave}
      />
    </div>
  );
};

export default ExhibitionLayout; 