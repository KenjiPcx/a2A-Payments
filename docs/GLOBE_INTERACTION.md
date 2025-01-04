# Globe Visualization Interaction Guide

## Overview
The globe visualization is a central interactive element of our application that displays user nodes across a 3D globe. It's designed to be both visually appealing and functionally interactive, serving as a dynamic background while maintaining full interactivity.

## Key Components

### 1. Layout Structure
```tsx
// Index.tsx
<div className="min-h-screen relative w-full overflow-hidden">
  {/* Globe Background */}
  <div className="fixed inset-0 w-full h-full">
    <GlobeVisualization userNodes={userNodes} />
  </div>
  
  {/* Content Overlay */}
  <div className="relative z-20 w-full">
    // Other UI components
  </div>
</div>
```

The globe uses a two-layer approach:
- Bottom layer: Full-screen globe visualization
- Top layer: UI components with z-index control

### 2. Globe Container
```tsx
// GlobeVisualization.tsx
<div className="w-full h-full relative">
  <div className="absolute inset-0">
    <Globe userNodes={userNodes} />
  </div>
  // Partners overlay
</div>
```

Critical styling points:
- `w-full h-full`: Ensures the globe fills its container
- `relative` + `absolute inset-0`: Prevents any box effect during zoom
- No fixed height constraints to maintain proper scaling

## Interaction Design

### 1. Mouse Controls
- **Rotation**: Click and drag to rotate the globe
- **Zoom**: Mouse wheel to zoom in/out
- **Node Selection**: Click on nodes to view user details

### 2. Layer Management
- Globe must stay behind all UI components (`z-20` for overlay content)
- Interactive elements (Partners, Nodes) use `pointer-events-auto`
- Globe background uses `pointer-events-none` where needed

### 3. Partner Integration
```tsx
// GlobeVisualization.tsx
<div className="absolute bottom-8 left-8 pointer-events-auto">
  <div className="glass-panel p-4">
    // Partner content
  </div>
</div>
```

Partners panel:
- Positioned absolutely within the globe container
- Maintains interactivity with `pointer-events-auto`
- Aligned with Builder Signups component

## Event System

### 1. Partner Selection
```typescript
const handlePartnerClick = (partner: Partner) => {
  const event = new CustomEvent('partnerSelected', { 
    detail: { partner }
  });
  window.dispatchEvent(event);
};
```

### 2. Node List Updates
```typescript
// NodeList.tsx
useEffect(() => {
  const handlePartnerSelected = (event: CustomEvent) => {
    // Update node list based on partner selection
  };
  
  window.addEventListener('partnerSelected', handlePartnerSelected);
  return () => window.removeEventListener('partnerSelected', handlePartnerSelected);
}, []);
```

## Critical Considerations

1. **Layout Hierarchy**
   - Never add fixed heights to the globe container
   - Maintain the two-layer structure (globe background + UI overlay)
   - Keep z-index relationships intact

2. **Interaction Preservation**
   - Always use `pointer-events-auto` for interactive elements
   - Ensure globe rotation and zoom remain functional
   - Maintain event system for component communication

3. **Positioning Guidelines**
   - Partners panel: Aligned with Builder Signups (`left-8 bottom-8`)
   - Node List: Aligned with Register button (`right-0 top-6rem`)
   - Globe: Full viewport coverage without cutoff

4. **Performance**
   - Globe renders in background layer
   - UI updates should not affect globe performance
   - Event listeners properly cleaned up

## Common Pitfalls to Avoid

1. ❌ Adding fixed height constraints to globe container
2. ❌ Breaking the z-index hierarchy
3. ❌ Disabling pointer events globally
4. ❌ Removing the two-layer structure
5. ❌ Positioning elements with margins instead of absolute positioning

## Testing Checklist

1. [ ] Globe fills entire viewport
2. [ ] Smooth rotation and zoom
3. [ ] Partner panel clicks trigger node updates
4. [ ] No visual box effect during zoom
5. [ ] All UI components remain interactive
6. [ ] Proper alignment of all components
7. [ ] No globe cutoff at any viewport size
