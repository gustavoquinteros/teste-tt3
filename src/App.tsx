/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef } from "react";
import { motion } from "motion/react";
import { 
  Move, 
  Plus, 
  Trash2, 
  Type, 
  Image as ImageIcon, 
  Square, 
  Circle,
  MousePointer2,
} from "lucide-react";

interface WindowData {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  title: string;
  color: string;
  content: string;
  zIndex: number;
}

const ToolButton: React.FC<{ 
  icon: React.ReactNode; 
  active?: boolean; 
  onClick?: () => void;
  className?: string;
}> = ({ 
  icon, 
  active = false, 
  onClick, 
  className = "" 
}) => {
  return (
    <button 
      onClick={onClick}
      className={`tool-item ${active ? "active" : ""} ${className}`}
    >
      {icon}
    </button>
  );
};

const Window: React.FC<{ 
  data: WindowData; 
  onUpdate: (updates: Partial<WindowData>) => void;
  onRemove: () => void;
  onFocus: () => void;
}> = ({ 
  data, 
  onUpdate, 
  onRemove,
  onFocus
}) => {
  const [isResizing, setIsResizing] = useState(false);

  const handleResizeStart = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setIsResizing(true);
    onFocus();

    const startX = e.clientX;
    const startY = e.clientY;
    const startWidth = data.width;
    const startHeight = data.height;

    const onMouseMove = (moveE: MouseEvent) => {
      const newWidth = Math.max(150, startWidth + (moveE.clientX - startX));
      const newHeight = Math.max(100, startHeight + (moveE.clientY - startY));
      onUpdate({ width: newWidth, height: newHeight });
    };

    const onMouseUp = () => {
      setIsResizing(false);
      document.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseup", onMouseUp);
    };

    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseup", onMouseUp);
  };

  return (
    <motion.div
      drag
      dragMomentum={false}
      onDragStart={onFocus}
      onDragEnd={(_, info) => {
        onUpdate({ 
          x: data.x + info.offset.x, 
          y: data.y + info.offset.y 
        });
      }}
      initial={false}
      animate={{ 
        x: data.x, 
        y: data.y,
        zIndex: data.zIndex
      }}
      style={{ 
        width: data.width, 
        height: data.height,
        position: "absolute",
        pointerEvents: "auto"
      }}
      className={`window-shadow rounded-lg overflow-hidden flex flex-col bg-white border-2 border-[var(--accent)] group
        ${isResizing ? "select-none" : ""}`}
    >
      {/* Header / Drag Handle */}
      <div className="h-9 bg-[#f9fafb] border-b border-[var(--border)] flex items-center justify-between px-3 cursor-move">
        <div className="flex items-center gap-2">
          <span className="text-[12px] font-semibold text-[var(--text-primary)]">{data.title}</span>
        </div>
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button 
            onClick={(e) => { e.stopPropagation(); onRemove(); }}
            className="p-1 hover:bg-red-50 text-gray-400 hover:text-red-500 rounded transition-colors"
          >
            <Trash2 size={12} />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 p-4 flex flex-col gap-2">
        <textarea
          className="w-full h-full resize-none border-none focus:ring-0 text-[13px] text-[var(--text-primary)] bg-transparent placeholder-gray-300 leading-relaxed"
          value={data.content}
          onChange={(e) => onUpdate({ content: e.target.value })}
          placeholder="Digite algo..."
          onFocus={onFocus}
        />
      </div>

      {/* Resize Handle */}
      <div 
        className="absolute bottom-0 right-0 w-3 h-3 cursor-nwse-resize bg-[var(--accent)] rounded-tl"
        onMouseDown={handleResizeStart}
      />
    </motion.div>
  );
};

export default function App() {
  const [windows, setWindows] = useState<WindowData[]>([
    {
      id: "1",
      x: 60,
      y: 60,
      width: 300,
      height: 200,
      title: "Janela de Texto A",
      color: "#ffffff",
      content: "Conteúdo da Janela A",
      zIndex: 1,
    },
    {
      id: "2",
      x: 400,
      y: 120,
      width: 240,
      height: 320,
      title: "Notas de Design B",
      color: "#ffffff",
      content: "Conteúdo da Janela B",
      zIndex: 2,
    },
  ]);

  const [maxZIndex, setMaxZIndex] = useState(2);
  const [selectedWindowId, setSelectedWindowId] = useState<string | null>(null);

  const addWindow = () => {
    const newId = Math.random().toString(36).substr(2, 9);
    const newZ = maxZIndex + 1;
    setMaxZIndex(newZ);
    setWindows([
      ...windows,
      {
        id: newId,
        x: 100 + Math.random() * 100,
        y: 100 + Math.random() * 100,
        width: 300,
        height: 200,
        title: `Nova Janela`,
        color: "#ffffff",
        content: "",
        zIndex: newZ,
      },
    ]);
    setSelectedWindowId(newId);
  };

  const removeWindow = (id: string) => {
    setWindows(windows.filter((w) => w.id !== id));
    if (selectedWindowId === id) setSelectedWindowId(null);
  };

  const bringToFront = (id: string) => {
    const newZ = maxZIndex + 1;
    setMaxZIndex(newZ);
    setWindows(
      windows.map((w) => (w.id === id ? { ...w, zIndex: newZ } : w))
    );
    setSelectedWindowId(id);
  };

  const updateWindow = (id: string, updates: Partial<WindowData>) => {
    setWindows(windows.map((w) => (w.id === id ? { ...w, ...updates } : w)));
  };

  const selectedWindow = windows.find(w => w.id === selectedWindowId);

  return (
    <div className="w-screen h-screen p-4 grid grid-cols-[80px_1fr_280px] grid-rows-[64px_1fr] gap-4 bg-[var(--bg)]">
      {/* Header */}
      <header className="col-span-3 bento-card flex items-center justify-between px-6">
        <div className="flex items-center gap-2 font-extrabold text-lg">
          <div className="w-6 h-6 bg-[var(--accent)] rounded" />
          <span>Canvas Flow</span>
          <span className="text-[var(--text-secondary)] font-normal ml-2">/ Projeto Beta</span>
        </div>
        <div className="flex gap-3">
          <ToolButton icon={<MousePointer2 size={18} />} active />
          <ToolButton icon={<Type size={18} />} />
          <ToolButton icon={<ImageIcon size={18} />} />
        </div>
      </header>

      {/* Palette */}
      <aside className="row-start-2 bento-card flex flex-col items-center py-4 gap-3">
        <ToolButton icon={<Square size={20} />} />
        <ToolButton icon={<Circle size={20} />} />
        <ToolButton icon={<Plus size={20} />} onClick={addWindow} className="bg-[var(--accent)] text-white border-none" />
      </aside>

      {/* Workspace */}
      <main className="row-start-2 bento-card relative overflow-hidden canvas-grid">
        <div className="absolute inset-0 pointer-events-none">
          {windows.map((win) => (
            <Window 
              key={win.id} 
              data={win} 
              onUpdate={(updates) => updateWindow(win.id, updates)}
              onRemove={() => removeWindow(win.id)}
              onFocus={() => bringToFront(win.id)}
            />
          ))}
        </div>
      </main>

      {/* Inspector */}
      <section className="row-start-2 bento-card p-5 flex flex-col gap-6">
        <div>
          <p className="inspector-section-title">Dimensões</p>
          <div className="grid grid-cols-2 gap-2">
            <div className="prop-box"><strong>W</strong> {selectedWindow ? `${Math.round(selectedWindow.width)}px` : "-"}</div>
            <div className="prop-box"><strong>H</strong> {selectedWindow ? `${Math.round(selectedWindow.height)}px` : "-"}</div>
            <div className="prop-box"><strong>X</strong> {selectedWindow ? `${Math.round(selectedWindow.x)}pt` : "-"}</div>
            <div className="prop-box"><strong>Y</strong> {selectedWindow ? `${Math.round(selectedWindow.y)}pt` : "-"}</div>
          </div>
        </div>

        <div>
          <p className="inspector-section-title">Paleta de Cores</p>
          <div className="grid grid-cols-2 gap-2">
            <div className="prop-box"><div className="color-swatch bg-[#4f46e5]" />Indigo</div>
            <div className="prop-box"><div className="color-swatch bg-[#10b981]" />Emerald</div>
            <div className="prop-box"><div className="color-swatch bg-[#f59e0b]" />Amber</div>
            <div className="prop-box"><div className="color-swatch bg-[#ef4444]" />Rose</div>
          </div>
        </div>

        <p className="text-[12px] text-[var(--text-secondary)] italic mt-auto">
          Arraste as bordas das janelas para ajustar o tamanho ou mova-as pelo workspace.
        </p>
      </section>
    </div>
  );
}
