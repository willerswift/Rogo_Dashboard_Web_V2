"use client";

import { useState, useEffect, useRef } from "react";
import { Modal, SecondaryButton, PrimaryButton } from "@/features/shared/ui";
import { cn } from "@/lib/utils/cn";
import NextImage from "next/image";
import { rgbToHex, extractColorsFromLogo, hsvToRgb, rgbToHsv } from "@/lib/utils/colors";

interface ColorConfigDialogProps {
  open: boolean;
  onClose: () => void;
  initialColor: string;
  onSave: (color: string) => void;
  logoUrl?: string;
  recommendedColors?: string[];
}

function hexToRgb(hex: string) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : { r: 0, g: 0, b: 0 };
}

export function ColorConfigDialog({ 
  open, 
  onClose, 
  initialColor, 
  onSave, 
  logoUrl, 
  recommendedColors: propRecommendedColors 
}: ColorConfigDialogProps) {
  const [color, setColor] = useState(initialColor);
  const [rgb, setRgb] = useState(hexToRgb(initialColor));
  const [hsv, setHsv] = useState(rgbToHsv(rgb.r, rgb.g, rgb.b));
  const [recommendedColors, setRecommendedColors] = useState<string[]>(propRecommendedColors || [
    "#FD3566", "#E21B54", "#FFB2BA", "#281719", "#5A5A88"
  ]);

  const svAreaRef = useRef<HTMLDivElement>(null);
  const hueAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (propRecommendedColors && propRecommendedColors.length > 0) {
      const timer = setTimeout(() => {
        setRecommendedColors(propRecommendedColors);
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [propRecommendedColors]);

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

  // Extract colors from logo if not provided by props
  useEffect(() => {
    if (!logoUrl || (propRecommendedColors && propRecommendedColors.length > 0)) return;

    extractColorsFromLogo(logoUrl).then(colors => {
      if (colors.length > 0) {
        setRecommendedColors(colors);
      }
    });
  }, [logoUrl, propRecommendedColors]);

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

  const hueColor = `hsl(${hsv.h}, 100%, 50%)`;

  return (
    <Modal open={open} onClose={onClose} title="Brand Color Configuration">
      <div className="space-y-6">
        <p className="text-sm text-neutral-500 -mt-4">Define your primary brand identity</p>

        {/* Current Primary Logo Preview */}
        {logoUrl && (
          <div className="flex items-center gap-3 rounded-xl border border-neutral-100 bg-white p-3 w-fit min-w-[140px]">
            <div className="relative h-8 w-8 overflow-hidden rounded-md border border-neutral-100 p-1 flex items-center justify-center">
              <NextImage 
                src={logoUrl} 
                alt="Preview" 
                width={32}
                height={32}
                className="object-contain"
              />
            </div>
            <span className="text-[12px] font-medium text-neutral-600">
              Current Primary Logo
            </span>
          </div>
        )}

        {/* Recommended Colors moved up */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider">Recommended from logo</span>
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
                    color.toUpperCase() === c.toUpperCase() ? "border-neutral-800" : "border-transparent"
                  )}
                  style={{ backgroundColor: c }}
                />
                <span className="text-[10px] font-bold text-neutral-400 group-hover:text-neutral-600 uppercase tracking-wider">{c}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Interactive Color Picker */}
        <div className="flex gap-4 h-[240px]">
          {/* SV Area */}
          <div 
            ref={svAreaRef}
            onPointerDown={handleSvPointerDown}
            className="flex-1 rounded-2xl relative overflow-hidden cursor-crosshair touch-none"
            style={{ backgroundColor: hueColor }}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-white to-transparent pointer-events-none" />
            <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent pointer-events-none" />
            <div 
              className="absolute h-6 w-6 rounded-full border-[3px] border-white pointer-events-none -ml-3 -mt-3 transition-transform"
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
            className="w-5 rounded-full relative cursor-pointer touch-none"
            style={{
              background: 'linear-gradient(to bottom, #f00 0%, #ff0 17%, #0f0 33%, #0ff 50%, #00f 67%, #f0f 83%, #f00 100%)'
            }}
          >
            <div 
              className="absolute -left-1 -right-1 h-3 rounded-full bg-white border border-border pointer-events-none -mt-1.5 transition-transform"
              style={{ top: `${(hsv.h / 360) * 100}%` }}
            />
          </div>
        </div>

        {/* HEX/RGB Inputs */}
        <div className="flex gap-4">
          <div className="space-y-1.5 flex-none">
            <span className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider">Hex</span>
            <div className="relative flex items-center group">
              <div 
                className="absolute left-2.5 size-5 rounded-[4px] border border-neutral-100 transition-transform group-focus-within:scale-110"
                style={{ backgroundColor: color }}
              />
              <input 
                value={color}
                onChange={handleHexChange}
                className="w-[120px] h-10 rounded-[6px] border border-[#E5E7EB] bg-white pl-10 pr-3 text-[14px] font-medium text-neutral-800 outline-none focus:border-primary-300 transition-all"
              />
            </div>
          </div>
          
          <div className="flex-1 grid grid-cols-3 gap-4">
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
