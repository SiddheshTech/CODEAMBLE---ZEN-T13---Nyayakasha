import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { User, ChevronDown, Check } from 'lucide-react';

interface Option {
  value: string;
  label: string;
}

interface ModernDropdownProps {
  options: Option[];
  placeholder?: string;
  className?: string;
}

export function ModernDropdown({ options, placeholder = "Select your role", className = "bg-white border-black/10" }: ModernDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [value, setValue] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find(opt => opt.value === value);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative group" ref={dropdownRef}>
      <div 
        className={`w-full pl-11 pr-10 py-3.5 border rounded-xl flex items-center justify-between cursor-pointer transition-all ${className} ${isOpen ? 'border-black/30 ring-4 ring-black/5' : 'hover:border-black/20'}`}
        onClick={() => setIsOpen(!isOpen)}
        tabIndex={0}
      >
        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-black/40 group-focus-within:text-black transition-colors">
          <User className={`w-5 h-5 transition-colors ${isOpen || value ? 'text-black' : ''}`} />
        </div>
        
        <span className={`block truncate ${!selectedOption ? 'text-black/50' : 'text-black'} text-base`}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>

        <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none text-black/40">
          <motion.div animate={{ rotate: isOpen ? 180 : 0 }} transition={{ duration: 0.2 }}>
            <ChevronDown className="w-5 h-5" />
          </motion.div>
        </div>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 5 }}
            transition={{ duration: 0.15 }}
            className="absolute z-[100] w-full mt-2 bg-white rounded-xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-black/5 overflow-hidden"
          >
            <div className="py-1">
              {options.map((option) => (
                <div
                  key={option.value}
                  className={`px-4 py-3 flex items-center justify-between cursor-pointer transition-colors ${value === option.value ? 'bg-black/5 text-black font-medium' : 'text-black/70 hover:bg-black/5 hover:text-black'}`}
                  onClick={() => {
                    setValue(option.value);
                    setIsOpen(false);
                  }}
                >
                  <span className="block truncate text-sm">{option.label}</span>
                  {value === option.value && <Check className="w-4 h-4 text-black" />}
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
