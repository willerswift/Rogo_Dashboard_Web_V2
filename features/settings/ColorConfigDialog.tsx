"use client";

import { useState, useEffect } from "react";
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
  return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1).toUpperCase();
}

export function ColorConfigDialog({ open, onClose, initialColor, onSave }: ColorConfigDialogProps) {
  const [color, setColor] = useState(initialColor);
  const [rgb, setRgb] = useState(hexToRgb(initialColor));

  useEffect(() => {
    const run = async () => {
      await Promise.resolve();
      setColor(initialColor);
      setRgb(hexToRgb(initialColor));
    };
    void run();
  }, [initialColor]);

  const handleHexChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value;
    if (!value.startsWith("#")) value = "#" + value;
    setColor(value);
    if (/^#[0-9A-F]{6}$/i.test(value)) {
      setRgb(hexToRgb(value));
    }
  };

  const handleRgbChange = (key: keyof typeof rgb, value: string) => {
    const numValue = Math.min(255, Math.max(0, parseInt(value) || 0));
    const newRgb = { ...rgb, [key]: numValue };
    setRgb(newRgb);
    setColor(rgbToHex(newRgb.r, newRgb.g, newRgb.b));
  };

  const recommendedColors = [
    "#FD3566", "#E21B54", "#FFB2BA", "#281719", "#5A5A88"
  ];

  return (
    <Modal open={open} onClose={onClose} title="Brand Color Configuration">
      <div className="space-y-6">
        <p className="text-sm text-neutral-500 -mt-4">Define your primary brand identity</p>
        
        {/* Visual Color Picker Mock */}
        <div className="flex gap-4 h-[240px]">
          <div 
            className="flex-1 rounded-2xl relative overflow-hidden"
            style={{ backgroundColor: color }}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-white to-transparent opacity-50" />
            <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent opacity-50" />
            <div className="absolute top-4 left-4 h-6 w-6 rounded-full border-4 border-white shadow-md cursor-pointer" />
          </div>
          <div className="w-4 rounded-full bg-gradient-to-b from-red-500 via-yellow-500 via-green-500 via-blue-500 to-red-500 relative">
            <div className="absolute top-1/4 -left-1 -right-1 h-2 rounded-full bg-white shadow-md border border-neutral-200" />
          </div>
        </div>

        {/* HEX/RGB Inputs */}
        <div className="grid grid-cols-4 gap-4">
          <div className="space-y-1.5">
            <span className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider">Hex</span>
            <input 
              value={color}
              onChange={handleHexChange}
              className="w-full h-11 rounded-xl border border-neutral-200 bg-white px-3 text-[14px] font-medium text-neutral-800 outline-none focus:border-primary-300 transition-all"
            />
          </div>
          <div className="space-y-1.5">
            <span className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider">R</span>
            <input 
              value={rgb.r}
              onChange={(e) => handleRgbChange("r", e.target.value)}
              className="w-full h-11 rounded-xl border border-neutral-200 bg-white px-3 text-[14px] font-medium text-neutral-800 outline-none focus:border-primary-300 transition-all"
            />
          </div>
          <div className="space-y-1.5">
            <span className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider">G</span>
            <input 
              value={rgb.g}
              onChange={(e) => handleRgbChange("g", e.target.value)}
              className="w-full h-11 rounded-xl border border-neutral-200 bg-white px-3 text-[14px] font-medium text-neutral-800 outline-none focus:border-primary-300 transition-all"
            />
          </div>
          <div className="space-y-1.5">
            <span className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider">B</span>
            <input 
              value={rgb.b}
              onChange={(e) => handleRgbChange("b", e.target.value)}
              className="w-full h-11 rounded-xl border border-neutral-200 bg-white px-3 text-[14px] font-medium text-neutral-800 outline-none focus:border-primary-300 transition-all"
            />
          </div>
        </div>

        {/* Recommended Colors */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider">Recommended from logo</span>
            <div className="flex items-center gap-1">
              <span className="text-[10px] font-bold text-neutral-600 uppercase">Rogo</span>
              <div className="h-3 w-3 bg-primary-300 rounded-sm" />
            </div>
          </div>
          <div className="flex gap-4">
            {recommendedColors.map((c) => (
              <button
                key={c}
                onClick={() => {
                  setColor(c);
                  setRgb(hexToRgb(c));
                }}
                className={cn(
                  "flex flex-col items-center gap-2 group",
                  color === c ? "scale-105" : "hover:scale-105 transition-transform"
                )}
              >
                <div 
                  className={cn(
                    "h-10 w-10 rounded-full border-2",
                    color === c ? "border-neutral-800" : "border-transparent"
                  )}
                  style={{ backgroundColor: c }}
                />
                <span className="text-[10px] font-bold text-neutral-400 group-hover:text-neutral-600 uppercase">{c}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-center gap-3 pt-4">
          <SecondaryButton onClick={() => {
            setColor("#FD3566");
            setRgb(hexToRgb("#FD3566"));
          }}>
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
