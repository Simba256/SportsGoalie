'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { ChevronDown, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

interface IconPickerProps {
  value: string;
  onChange: (icon: string) => void;
  label?: string;
  className?: string;
}

// Comprehensive course and activity icons
const COURSE_ICONS = [
  // Ball Sports
  { id: 'soccer', emoji: '⚽', name: 'Soccer', category: 'Ball Sports' },
  { id: 'basketball', emoji: '🏀', name: 'Basketball', category: 'Ball Sports' },
  { id: 'football', emoji: '🏈', name: 'Football', category: 'Ball Sports' },
  { id: 'baseball', emoji: '⚾', name: 'Baseball', category: 'Ball Sports' },
  { id: 'tennis', emoji: '🎾', name: 'Tennis', category: 'Ball Sports' },
  { id: 'volleyball', emoji: '🏐', name: 'Volleyball', category: 'Ball Sports' },
  { id: 'softball', emoji: '🥎', name: 'Softball', category: 'Ball Sports' },
  { id: 'pingpong', emoji: '🏓', name: 'Ping Pong', category: 'Ball Sports' },
  { id: 'badminton', emoji: '🏸', name: 'Badminton', category: 'Ball Sports' },
  { id: 'lacrosse', emoji: '🥍', name: 'Lacrosse', category: 'Ball Sports' },

  // Olympic Sports
  { id: 'swimming', emoji: '🏊', name: 'Swimming', category: 'Olympic Sports' },
  { id: 'running', emoji: '🏃', name: 'Running', category: 'Olympic Sports' },
  { id: 'cycling', emoji: '🚴', name: 'Cycling', category: 'Olympic Sports' },
  { id: 'gymnastics', emoji: '🤸', name: 'Gymnastics', category: 'Olympic Sports' },
  { id: 'weightlifting', emoji: '🏋️', name: 'Weightlifting', category: 'Olympic Sports' },
  { id: 'wrestling', emoji: '🤼', name: 'Wrestling', category: 'Olympic Sports' },
  { id: 'boxing', emoji: '🥊', name: 'Boxing', category: 'Olympic Sports' },
  { id: 'fencing', emoji: '🤺', name: 'Fencing', category: 'Olympic Sports' },
  { id: 'archery', emoji: '🏹', name: 'Archery', category: 'Olympic Sports' },
  { id: 'defense', emoji: '🛡️', name: 'Defense', category: 'Olympic Sports' },

  // Winter Sports
  { id: 'skiing', emoji: '⛷️', name: 'Skiing', category: 'Winter Sports' },
  { id: 'snowboarding', emoji: '🏂', name: 'Snowboarding', category: 'Winter Sports' },
  { id: 'iceskating', emoji: '⛸️', name: 'Ice Skating', category: 'Winter Sports' },
  { id: 'hockey', emoji: '🏒', name: 'Hockey', category: 'Winter Sports' },
  { id: 'sledding', emoji: '🛷', name: 'Sledding', category: 'Winter Sports' },
  { id: 'curling', emoji: '🥌', name: 'Curling', category: 'Winter Sports' },

  // Water Sports
  { id: 'surfing', emoji: '🏄', name: 'Surfing', category: 'Water Sports' },
  { id: 'rowing', emoji: '🚣', name: 'Rowing', category: 'Water Sports' },
  { id: 'canoeing', emoji: '🛶', name: 'Canoeing', category: 'Water Sports' },
  { id: 'swimming-female', emoji: '🏊‍♀️', name: 'Swimming (Female)', category: 'Water Sports' },
  { id: 'swimming-male', emoji: '🏊‍♂️', name: 'Swimming (Male)', category: 'Water Sports' },
  { id: 'waterpolo', emoji: '🤽', name: 'Water Polo', category: 'Water Sports' },

  // Martial Arts
  { id: 'martialarts', emoji: '🥋', name: 'Martial Arts', category: 'Martial Arts' },
  { id: 'wrestling-female', emoji: '🤼‍♀️', name: 'Wrestling (Female)', category: 'Martial Arts' },
  { id: 'wrestling-male', emoji: '🤼‍♂️', name: 'Wrestling (Male)', category: 'Martial Arts' },

  // Fitness & Training
  { id: 'strength', emoji: '💪', name: 'Strength', category: 'Fitness' },
  { id: 'running-female', emoji: '🏃‍♀️', name: 'Running (Female)', category: 'Fitness' },
  { id: 'running-male', emoji: '🏃‍♂️', name: 'Running (Male)', category: 'Fitness' },
  { id: 'yoga', emoji: '🧘', name: 'Yoga', category: 'Fitness' },
  { id: 'handball', emoji: '🤾', name: 'Handball', category: 'Fitness' },
  { id: 'golf', emoji: '🏌️', name: 'Golf', category: 'Fitness' },

  // Mental & Cognitive
  { id: 'brain', emoji: '🧠', name: 'Brain', category: 'Mental & Cognitive' },
  { id: 'thinking', emoji: '💭', name: 'Thinking', category: 'Mental & Cognitive' },
  { id: 'lightbulb', emoji: '💡', name: 'Light Bulb', category: 'Mental & Cognitive' },
  { id: 'puzzle', emoji: '🧩', name: 'Puzzle', category: 'Mental & Cognitive' },
  { id: 'mindfulness', emoji: '🧘‍♀️', name: 'Mindfulness', category: 'Mental & Cognitive' },
  { id: 'meditation', emoji: '🧘‍♂️', name: 'Meditation', category: 'Mental & Cognitive' },
  { id: 'psychology', emoji: '🔬', name: 'Psychology', category: 'Mental & Cognitive' },
  { id: 'wisdom', emoji: '🦉', name: 'Wisdom', category: 'Mental & Cognitive' },
  { id: 'focus', emoji: '🎯', name: 'Focus', category: 'Mental & Cognitive' },
  { id: 'memory', emoji: '🗄️', name: 'Memory', category: 'Mental & Cognitive' },

  // Academic & Learning
  { id: 'book', emoji: '📚', name: 'Books', category: 'Academic & Learning' },
  { id: 'graduation', emoji: '🎓', name: 'Graduation', category: 'Academic & Learning' },
  { id: 'school', emoji: '🏫', name: 'School', category: 'Academic & Learning' },
  { id: 'study', emoji: '📖', name: 'Study', category: 'Academic & Learning' },
  { id: 'notebook', emoji: '📓', name: 'Notebook', category: 'Academic & Learning' },
  { id: 'pencil', emoji: '✏️', name: 'Pencil', category: 'Academic & Learning' },
  { id: 'calculator', emoji: '🔢', name: 'Calculator', category: 'Academic & Learning' },
  { id: 'microscope', emoji: '🔬', name: 'Microscope', category: 'Academic & Learning' },
  { id: 'telescope', emoji: '🔭', name: 'Telescope', category: 'Academic & Learning' },
  { id: 'globe', emoji: '🌍', name: 'Globe', category: 'Academic & Learning' },

  // Technology & Digital
  { id: 'computer', emoji: '💻', name: 'Computer', category: 'Technology & Digital' },
  { id: 'smartphone', emoji: '📱', name: 'Smartphone', category: 'Technology & Digital' },
  { id: 'robot', emoji: '🤖', name: 'Robot', category: 'Technology & Digital' },
  { id: 'gear', emoji: '⚙️', name: 'Gear', category: 'Technology & Digital' },
  { id: 'rocket', emoji: '🚀', name: 'Rocket', category: 'Technology & Digital' },
  { id: 'satellite', emoji: '🛰️', name: 'Satellite', category: 'Technology & Digital' },
  { id: 'wifi', emoji: '📶', name: 'WiFi', category: 'Technology & Digital' },
  { id: 'battery', emoji: '🔋', name: 'Battery', category: 'Technology & Digital' },
  { id: 'circuit', emoji: '🔌', name: 'Circuit', category: 'Technology & Digital' },
  { id: 'code', emoji: '💾', name: 'Code', category: 'Technology & Digital' },

  // Creative Arts
  { id: 'art', emoji: '🎨', name: 'Art', category: 'Creative Arts' },
  { id: 'music', emoji: '🎵', name: 'Music', category: 'Creative Arts' },
  { id: 'guitar', emoji: '🎸', name: 'Guitar', category: 'Creative Arts' },
  { id: 'piano', emoji: '🎹', name: 'Piano', category: 'Creative Arts' },
  { id: 'microphone', emoji: '🎤', name: 'Microphone', category: 'Creative Arts' },
  { id: 'camera', emoji: '📷', name: 'Camera', category: 'Creative Arts' },
  { id: 'video', emoji: '🎥', name: 'Video', category: 'Creative Arts' },
  { id: 'theater', emoji: '🎭', name: 'Theater', category: 'Creative Arts' },
  { id: 'dance', emoji: '💃', name: 'Dance', category: 'Creative Arts' },
  { id: 'writing', emoji: '✍️', name: 'Writing', category: 'Creative Arts' },

  // Business & Professional
  { id: 'briefcase', emoji: '💼', name: 'Briefcase', category: 'Business & Professional' },
  { id: 'chart', emoji: '📊', name: 'Chart', category: 'Business & Professional' },
  { id: 'handshake', emoji: '🤝', name: 'Handshake', category: 'Business & Professional' },
  { id: 'presentation', emoji: '📈', name: 'Presentation', category: 'Business & Professional' },
  { id: 'meeting', emoji: '👥', name: 'Meeting', category: 'Business & Professional' },
  { id: 'leadership', emoji: '👑', name: 'Leadership', category: 'Business & Professional' },
  { id: 'strategy', emoji: '♟️', name: 'Strategy', category: 'Business & Professional' },
  { id: 'communication', emoji: '💬', name: 'Communication', category: 'Business & Professional' },
  { id: 'networking', emoji: '🌐', name: 'Networking', category: 'Business & Professional' },
  { id: 'finance', emoji: '💰', name: 'Finance', category: 'Business & Professional' },

  // Health & Wellness
  { id: 'heart', emoji: '❤️', name: 'Heart', category: 'Health & Wellness' },
  { id: 'medical', emoji: '⚕️', name: 'Medical', category: 'Health & Wellness' },
  { id: 'nutrition', emoji: '🥗', name: 'Nutrition', category: 'Health & Wellness' },
  { id: 'sleep', emoji: '😴', name: 'Sleep', category: 'Health & Wellness' },
  { id: 'wellness', emoji: '🌱', name: 'Wellness', category: 'Health & Wellness' },
  { id: 'balance', emoji: '⚖️', name: 'Balance', category: 'Health & Wellness' },
  { id: 'peace', emoji: '☮️', name: 'Peace', category: 'Health & Wellness' },
  { id: 'therapy', emoji: '🛋️', name: 'Therapy', category: 'Health & Wellness' },
  { id: 'medicine', emoji: '💊', name: 'Medicine', category: 'Health & Wellness' },
  { id: 'spa', emoji: '🧖‍♀️', name: 'Spa', category: 'Health & Wellness' },

  // Equipment & Tools
  { id: 'goal', emoji: '🥅', name: 'Goal', category: 'Equipment & Tools' },
  { id: 'trophy', emoji: '🏆', name: 'Trophy', category: 'Equipment & Tools' },
  { id: 'gold-medal', emoji: '🥇', name: 'Gold Medal', category: 'Equipment & Tools' },
  { id: 'silver-medal', emoji: '🥈', name: 'Silver Medal', category: 'Equipment & Tools' },
  { id: 'bronze-medal', emoji: '🥉', name: 'Bronze Medal', category: 'Equipment & Tools' },
  { id: 'target', emoji: '🎯', name: 'Target', category: 'Equipment & Tools' },
  { id: 'energy', emoji: '⚡', name: 'Energy', category: 'Equipment & Tools' },
  { id: 'fire', emoji: '🔥', name: 'Fire', category: 'Equipment & Tools' },
  { id: 'diamond', emoji: '💎', name: 'Diamond', category: 'Equipment & Tools' },
  { id: 'key', emoji: '🔑', name: 'Key', category: 'Equipment & Tools' },

  // General & Symbols
  { id: 'stadium', emoji: '🏟️', name: 'Stadium', category: 'General & Symbols' },
  { id: 'performance', emoji: '🎪', name: 'Performance', category: 'General & Symbols' },
  { id: 'star', emoji: '⭐', name: 'Star', category: 'General & Symbols' },
  { id: 'sparkle', emoji: '🌟', name: 'Sparkle', category: 'General & Symbols' },
  { id: 'sun', emoji: '☀️', name: 'Sun', category: 'General & Symbols' },
  { id: 'moon', emoji: '🌙', name: 'Moon', category: 'General & Symbols' },
  { id: 'rainbow', emoji: '🌈', name: 'Rainbow', category: 'General & Symbols' },
  { id: 'mountain', emoji: '⛰️', name: 'Mountain', category: 'General & Symbols' },
  { id: 'tree', emoji: '🌳', name: 'Tree', category: 'General & Symbols' },
  { id: 'flower', emoji: '🌸', name: 'Flower', category: 'General & Symbols' },
];

export function IconPicker({ value, onChange, label, className }: IconPickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  const categories = ['All', ...Array.from(new Set(COURSE_ICONS.map(icon => icon.category)))];

  const filteredIcons = COURSE_ICONS.filter(icon => {
    const matchesSearch = icon.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         icon.emoji.includes(searchQuery);
    const matchesCategory = selectedCategory === 'All' || icon.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const selectedIcon = COURSE_ICONS.find(icon => icon.emoji === value);

  return (
    <div className={cn('space-y-2', className)}>
      {label && <Label>{label}</Label>}

      <div className="relative">
        <Button
          type="button"
          variant="outline"
          onClick={() => setIsOpen(!isOpen)}
          className="w-full justify-between h-12 px-4"
        >
          <div className="flex items-center gap-3">
            <span className="text-2xl">{value || '❓'}</span>
            <span className="text-sm text-muted-foreground">
              {selectedIcon ? selectedIcon.name : 'Select an icon'}
            </span>
          </div>
          <ChevronDown className={cn('h-4 w-4 transition-transform', isOpen && 'rotate-180')} />
        </Button>

        {isOpen && (
          <Card className="absolute top-full left-0 w-full mt-2 z-50 shadow-lg">
            <CardContent className="p-4">
              {/* Search */}
              <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Search icons..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* Categories */}
              <div className="mb-4">
                <div className="flex flex-wrap gap-2">
                  {categories.map(category => (
                    <Button
                      key={category}
                      type="button"
                      variant={selectedCategory === category ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setSelectedCategory(category)}
                      className="text-xs"
                    >
                      {category}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Icon Grid */}
              <div className="max-h-64 overflow-y-auto">
                <div className="grid grid-cols-6 gap-2">
                  {filteredIcons.map(icon => (
                    <Button
                      key={icon.id}
                      type="button"
                      variant={value === icon.emoji ? 'default' : 'ghost'}
                      size="sm"
                      onClick={() => {
                        onChange(icon.emoji);
                        setIsOpen(false);
                      }}
                      className="h-12 w-12 text-xl p-0 hover:scale-110 transition-transform"
                      title={icon.name}
                    >
                      {icon.emoji}
                    </Button>
                  ))}
                </div>
              </div>

              {filteredIcons.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <p>No icons found matching "{searchQuery}"</p>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}