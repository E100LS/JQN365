/**
 * 文件操作工具 - 处理文件读取和写入
 */

export interface FileContent {
  name: string;
  type: string;
  content: string;
}

export async function readFileContent(file: File): Promise<FileContent> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (event) => {
      const content = event.target?.result as string;
      resolve({
        name: file.name,
        type: file.type,
        content
      });
    };
    
    reader.onerror = () => {
      reject(new Error(`读取文件失败: ${file.name}`));
    };
    
    reader.readAsText(file);
  });
}

export async function readMultipleFiles(files: FileList | null): Promise<FileContent[]> {
  if (!files) return [];
  
  const promises = Array.from(files).map(file => readFileContent(file));
  return Promise.all(promises);
}

export function getSupportedFileTypes(): { ext: string; mime: string; label: string }[] {
  return [
    { ext: '.md', mime: 'text/markdown', label: 'Markdown 文件' },
    { ext: '.markdown', mime: 'text/markdown', label: 'Markdown 文件' },
    { ext: '.txt', mime: 'text/plain', label: '文本文件' },
  ];
}

export async function importFromFile(file: File): Promise<{ 
  title?: string; 
  content: string; 
  type: string; 
  error?: string 
}> {
  const { name, content } = await readFileContent(file);
  
  // 判断文件类型
  const isMarkdown = name.endsWith('.md') || name.endsWith('.markdown');
  const isText = name.endsWith('.txt') || file.type === 'text/plain';
  
  if (isMarkdown) {
    // Markdown 文件，尝试解析 front-matter
    const titleMatch = content.match(/^\s*---\s*\n.*?title:\s*(.+?)\s*\n/m);
    return {
      title: titleMatch?.[1]?.trim(),
      content,
      type: 'markdown'
    };
  } else if (isText) {
    // 纯文本文件
    return {
      title: name.replace(/\.[^.]+$/, ''), // 去掉扩展名
      content,
      type: 'text'
    };
  } else {
    // 不支持的文件类型
    return {
      content: '',
      type: 'unknown',
      error: `不支持的文件类型: ${name}`
    };
  }
}