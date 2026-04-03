'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { BookOpen, Sparkles, FileText } from 'lucide-react';
import type { CurriculumTemplate } from '@/lib/utils/curriculum-templates';
import { getPillarByDocId } from '@/lib/utils/pillars';

interface Props {
  templates: CurriculumTemplate[];
  onSelectTemplate: (template: CurriculumTemplate) => void;
  onStartFromScratch: () => void;
}

export function CurriculumTemplatePicker({ templates, onSelectTemplate, onStartFromScratch }: Props) {
  return (
    <div className="space-y-6">
      {/* Start from template */}
      {templates.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-muted-foreground mb-3 flex items-center gap-2">
            <Sparkles className="h-4 w-4" />
            Recommended Templates (based on student profile)
          </h3>
          <div className="grid gap-3 sm:grid-cols-2">
            {templates.map((t) => (
              <Card
                key={t.id}
                className="cursor-pointer hover:shadow-md hover:border-primary/50 transition-all group"
                onClick={() => onSelectTemplate(t)}
              >
                <CardContent className="p-4 space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-semibold text-sm group-hover:text-primary transition-colors">
                        {t.name}
                      </h4>
                      <p className="text-xs text-muted-foreground mt-0.5">{t.description}</p>
                    </div>
                    <FileText className="h-4 w-4 text-muted-foreground flex-shrink-0 mt-0.5" />
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {t.items.slice(0, 4).map((item, i) => {
                      const pillar = getPillarByDocId(item.pillarId);
                      return (
                        <Badge key={i} variant="outline" className="text-[10px]">
                          {pillar?.shortName || item.pillarSlug}
                        </Badge>
                      );
                    })}
                    {t.items.length > 4 && (
                      <Badge variant="outline" className="text-[10px]">
                        +{t.items.length - 4} more
                      </Badge>
                    )}
                  </div>
                  <p className="text-[10px] text-muted-foreground">{t.items.length} items</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Start from scratch */}
      <div className="text-center pt-2">
        <Button variant="outline" onClick={onStartFromScratch}>
          <BookOpen className="h-4 w-4 mr-2" />
          Start from Scratch
        </Button>
      </div>
    </div>
  );
}
