"use client";
import React from 'react';
import { Moon, Sun } from 'lucide-react';
import { useTheme } from '../wrapper/ThemeContext';
import { Button } from '@/components/ui/button';

const ThemeToggle = () => {
    const { theme, toggleTheme } = useTheme();

    return (
        <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
        >
            {theme === 'dark' ? <Sun /> : <Moon />}
        </Button>
    );
};

export default ThemeToggle;
