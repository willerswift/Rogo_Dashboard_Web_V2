"use client";

import { useState, useEffect, useRef } from "react";
import { Modal, SecondaryButton, PrimaryButton } from "@/features/shared/ui";
import { cn } from "@/lib/utils/cn";

interface ColorConfigDialogProps {
  open: boolean;
  onClose: () => void;
  initialColor: string;
  onSave: (color: string) => void;
}

function hexToRgb(hex: string) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : { r: 0, g: 0, b: 0 };
}

function rgbToHex(r: number, g: number, b: number) {
  return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1).padStart(6, '0').toUpperCase();
}

function hsvToRgb(h: number, s: number, v: number) {
  s = s / 100;
  v = v / 100;
  let r = 0, g = 0, b = 0;
  const i = Math.floor(h / 60);
  const f = h / 60 - i;
  const p = v * (1 - s);
  const q = v * (1 - f * s);
  const t = v * (1 - (1 - f) * s);
  switch (i % 6) {
    case 0: r = v; g = t; b = p; break;
    case 1: r = q; g = v; b = p; break;
    case 2: r = p; g = v; b = t; break;
    case 3: r = p; g = q; b = v; break;
    case 4: r = t; g = p; b = v; break;
    case 5: r = v; g = p; b = q; break;
  }
  return {
    r: Math.round(r * 255),
    g: Math.round(g * 255),
    b: Math.round(b * 255)
  };
}

function rgbToHsv(r: number, g: number, b: number) {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h = 0, s = 0, v = max;
  const d = max - min;
  s = max === 0 ? 0 : d / max;
  if (max !== min) {
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h /= 6;
  }
  return { h: h * 360, s: s * 100, v: v * 100 };
}

export function ColorConfigDialog({ open, onClose, initialColor, onSave }: ColorConfigDialogProps) {
  const [color, setColor] = useState(initialColor);
  const [rgb, setRgb] = useState(hexToRgb(initialColor));
  const [hsv, setHsv] = useState(rgbToHsv(rgb.r, rgb.g, rgb.b));
  
  const svAreaRef = useRef<HTMLDivElement>(null);
  const hueAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open) {
      const timer = setTimeout(() => {
        setColor(initialColor);
        const newRgb = hexToRgb(initialColor);
        setRgb(newRgb);
        setHsv(rgbToHsv(newRgb.r, newRgb.g, newRgb.b));
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [initialColor, open]);

  const updateFromHex = (newHex: string) => {
    setColor(newHex);
    if (/^#[0-9A-F]{6}$/i.test(newHex)) {
      const newRgb = hexToRgb(newHex);
      setRgb(newRgb);
      setHsv(rgbToHsv(newRgb.r, newRgb.g, newRgb.b));
    }
  };

  const handleHexChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value;
    if (!value.startsWith("#")) value = "#" + value;
    updateFromHex(value);
  };

  const handleRgbChange = (key: keyof typeof rgb, value: string) => {
    const numValue = Math.min(255, Math.max(0, parseInt(value) || 0));
    const newRgb = { ...rgb, [key]: numValue };
    setRgb(newRgb);
    const newHex = rgbToHex(newRgb.r, newRgb.g, newRgb.b);
    setColor(newHex);
    setHsv(rgbToHsv(newRgb.r, newRgb.g, newRgb.b));
  };

  const handleSvPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (!svAreaRef.current) return;
    
    const updateSv = (clientX: number, clientY: number) => {
      if (!svAreaRef.current) return;
      const rect = svAreaRef.current.getBoundingClientRect();
      let x = clientX - rect.left;
      let y = clientY - rect.top;
      x = Math.max(0, Math.min(x, rect.width));
      y = Math.max(0, Math.min(y, rect.height));
      const s = (x / rect.width) * 100;
      const v = 100 - (y / rect.height) * 100;
      
      const newHsv = { ...hsv, s, v };
      setHsv(newHsv);
      const newRgb = hsvToRgb(newHsv.h, newHsv.s, newHsv.v);
      setRgb(newRgb);
      setColor(rgbToHex(newRgb.r, newRgb.g, newRgb.b));
    };
    updateSv(e.clientX, e.clientY);

    const handlePointerMove = (moveEvent: PointerEvent) => {
      updateSv(moveEvent.clientX, moveEvent.clientY);
    };
    const handlePointerUp = () => {
      document.removeEventListener('pointermove', handlePointerMove);
      document.removeEventListener('pointerup', handlePointerUp);
    };
    document.addEventListener('pointermove', handlePointerMove);
    document.addEventListener('pointerup', handlePointerUp);
  };

  const handleHuePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (!hueAreaRef.current) return;
    
    const updateHue = (clientY: number) => {
      if (!hueAreaRef.current) return;
      const rect = hueAreaRef.current.getBoundingClientRect();
      let y = clientY - rect.top;
      y = Math.max(0, Math.min(y, rect.height));
      const h = (y / rect.height) * 360;
      
      const newHsv = { ...hsv, h };
      setHsv(newHsv);
      const newRgb = hsvToRgb(newHsv.h, newHsv.s, newHsv.v);
      setRgb(newRgb);
      setColor(rgbToHex(newRgb.r, newRgb.g, newRgb.b));
    };
    updateHue(e.clientY);

    const handlePointerMove = (moveEvent: PointerEvent) => {
      updateHue(moveEvent.clientY);
    };
    const handlePointerUp = () => {
      document.removeEventListener('pointermove', handlePointerMove);
      document.removeEventListener('pointerup', handlePointerUp);
    };
    document.addEventListener('pointermove', handlePointerMove);
    document.addEventListener('pointerup', handlePointerUp);
  };

  const recommendedColors = [
    "#FD3566", "#E21B54", "#FFB2BA", "#281719", "#5A5A88"
  ];

  const hueColor = `hsl(${hsv.h}, 100%, 50%)`;

  return (
    <Modal open={open} onClose={onClose} title="Brand Color Configuration">
      <div className="space-y-6">
        <p className="text-sm text-neutral-500 -mt-4">Define your primary brand identity</p>
        
        {/* Interactive Color Picker */}
        <div className="flex gap-4 h-[240px]">
          {/* SV Area */}
          <div 
            ref={svAreaRef}
            onPointerDown={handleSvPointerDown}
            className="flex-1 rounded-2xl relative overflow-hidden cursor-crosshair touch-none shadow-inner"
            style={{ backgroundColor: hueColor }}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-white to-transparent pointer-events-none" />
            <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent pointer-events-none" />
            <div 
              className="absolute h-6 w-6 rounded-full border-[3px] border-white shadow-md pointer-events-none -ml-3 -mt-3 transition-transform"
              style={{
                left: `${hsv.s}%`,
                top: `${100 - hsv.v}%`,
                backgroundColor: color
              }}
            />
          </div>
          
          {/* Hue Slider */}
          <div 
            ref={hueAreaRef}
            onPointerDown={handleHuePointerDown}
            className="w-5 rounded-full relative cursor-pointer touch-none shadow-inner"
            style={{
              background: 'linear-gradient(to bottom, #f00 0%, #ff0 17%, #0f0 33%, #0ff 50%, #00f 67%, #f0f 83%, #f00 100%)'
            }}
          >
            <div 
              className="absolute -left-1 -right-1 h-3 rounded-full bg-white shadow-md border border-neutral-200 pointer-events-none -mt-1.5 transition-transform"
              style={{ top: `${(hsv.h / 360) * 100}%` }}
            />
          </div>
        </div>

        {/* HEX/RGB Inputs */}
        <div className="grid grid-cols-4 gap-4">
          <div className="space-y-1.5">
            <span className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider">Hex</span>
            <input 
              value={color}
              onChange={handleHexChange}
              className="w-full h-10 rounded-[6px] border border-[#E5E7EB] bg-white px-3 text-[14px] font-medium text-neutral-800 outline-none focus:border-primary-300 transition-all"
            />
          </div>
          <div className="space-y-1.5">
            <span className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider">R</span>
            <input 
              value={rgb.r}
              onChange={(e) => handleRgbChange("r", e.target.value)}
              className="w-full h-10 rounded-[6px] border border-[#E5E7EB] bg-white px-3 text-[14px] font-medium text-neutral-800 outline-none focus:border-primary-300 transition-all"
            />
          </div>
          <div className="space-y-1.5">
            <span className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider">G</span>
            <input 
              value={rgb.g}
              onChange={(e) => handleRgbChange("g", e.target.value)}
              className="w-full h-10 rounded-[6px] border border-[#E5E7EB] bg-white px-3 text-[14px] font-medium text-neutral-800 outline-none focus:border-primary-300 transition-all"
            />
          </div>
          <div className="space-y-1.5">
            <span className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider">B</span>
            <input 
              value={rgb.b}
              onChange={(e) => handleRgbChange("b", e.target.value)}
              className="w-full h-10 rounded-[6px] border border-[#E5E7EB] bg-white px-3 text-[14px] font-medium text-neutral-800 outline-none focus:border-primary-300 transition-all"
            />
          </div>
        </div>

        {/* Recommended Colors */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider">Recommended from logo</span>
            <div className="flex items-center gap-1">
              <span className="text-[10px] font-bold text-neutral-600 uppercase">Rogo</span>
              <div className="h-3 w-3 rounded-sm" style={{ backgroundColor: initialColor }} />
            </div>
          </div>
          <div className="flex gap-4">
            {recommendedColors.map((c) => (
              <button
                key={c}
                onClick={() => updateFromHex(c)}
                className={cn(
                  "flex flex-col items-center gap-2 group transition-transform",
                  color.toUpperCase() === c.toUpperCase() ? "scale-105" : "hover:scale-105"
                )}
              >
                <div 
                  className={cn(
                    "h-10 w-10 rounded-full border-2 transition-colors",
                    color.toUpperCase() === c.toUpperCase() ? "border-neutral-800 shadow-sm" : "border-transparent"
                  )}
                  style={{ backgroundColor: c }}
                />
                <span className="text-[10px] font-bold text-neutral-400 group-hover:text-neutral-600 uppercase tracking-wider">{c}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-4">
          <SecondaryButton onClick={() => updateFromHex("#FD3566")}>
            Reset to default
          </SecondaryButton>
          <PrimaryButton onClick={() => onSave(color)}>
            Save Changes
          </PrimaryButton>
        </div>
      </div>
    </Modal>
  );
}