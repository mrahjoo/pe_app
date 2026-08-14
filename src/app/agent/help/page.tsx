import fs from 'fs';
import path from 'path';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';

export default function AgentHelpPage() {
  const filePath = path.join(process.cwd(), 'src/content/agent-help.md');
  const fileContent = fs.readFileSync(filePath, 'utf8');

  return (
    <div className="h-full overflow-y-auto w-full">
      <div className="max-w-4xl mx-auto p-8 prose prose-slate dark:prose-invert">
        <ReactMarkdown
          remarkPlugins={[remarkGfm, remarkMath]}
          rehypePlugins={[rehypeKatex]}
        >
          {fileContent}
        </ReactMarkdown>
      </div>
    </div>
  );
}
