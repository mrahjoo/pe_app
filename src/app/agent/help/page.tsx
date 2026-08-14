import fs from 'fs';
import path from 'path';
import { BarChart3, Camera, CircleDashed, Sparkles, Thermometer, Wand2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

const quickStats = [
  {
    title: 'Psychrometrics',
    description: 'Air-state properties and process calculations.',
    icon: BarChart3,
  },
  {
    title: 'Thermodynamics',
    description: 'Fluid and refrigerant state evaluation.',
    icon: Thermometer,
  },
  {
    title: 'Thermal comfort',
    description: 'PMV, UTCI, SET, and related indices.',
    icon: CircleDashed,
  },
  {
    title: 'Image understanding',
    description: 'Read equations, diagrams, and technical charts.',
    icon: Camera,
  },
];

export default function AgentHelpPage() {
  const filePath = path.join(process.cwd(), 'src/content/agent-help.md');
  const fileContent = fs.readFileSync(filePath, 'utf8');

  return (
    <div className="h-full w-full overflow-y-auto">
      <div className="mx-auto max-w-5xl p-4 md:p-8">
        <Card className="border-border/60 bg-background/80 shadow-sm backdrop-blur-sm">
          <CardHeader className="space-y-4 pb-6">
            <div className="inline-flex w-fit items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-medium text-primary">
              <Sparkles className="h-3.5 w-3.5" />
              Engineering copilot
            </div>

            <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
              <div>
                <CardTitle className="text-3xl font-semibold tracking-tight md:text-4xl">
                  Agent capabilities and help
                </CardTitle>
                <CardDescription className="mt-2 max-w-2xl text-base">
                  Use the assistant for calculations, design checks, and rapid engineering analysis across psychrometrics, thermodynamics, comfort, and unit conversion workflows.
                </CardDescription>
              </div>

              <div className="inline-flex items-center gap-2 rounded-full border bg-muted/60 px-3 py-1.5 text-xs text-muted-foreground">
                <Wand2 className="h-3.5 w-3.5" />
                Ready for technical prompts
              </div>
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              {quickStats.map(({ title, description, icon: Icon }) => (
                <Card key={title} className="border-border/60 bg-muted/20">
                  <CardContent className="flex h-full flex-col gap-3 p-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <Icon className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="font-medium text-foreground">{title}</p>
                      <p className="mt-1 text-sm text-muted-foreground">{description}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="rounded-2xl border border-border/60 bg-muted/20 p-4 md:p-6">
              <div className="prose prose-slate max-w-none dark:prose-invert prose-headings:scroll-mt-24 prose-h1:mt-0 prose-h2:mt-8 prose-p:leading-7 prose-li:leading-7 prose-code:before:content-none prose-code:after:content-none">
                <ReactMarkdown
                  remarkPlugins={[remarkGfm, remarkMath]}
                  rehypePlugins={[rehypeKatex]}
                >
                  {fileContent}
                </ReactMarkdown>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
