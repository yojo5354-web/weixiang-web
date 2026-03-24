'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { FiX, FiCamera } from 'react-icons/fi';
import { contentAPI, aiAPI } from '@/lib/api';
import { useAppStore } from '@/lib/store';
import BottomNav from '@/components/BottomNav';
import toast from 'react-hot-toast';

interface GeneratedRecipe {
  title: string;
  coverImage: string;
  ingredients: string[];
  steps: string[];
  tips?: string;
}

export default function Publish() {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [hasGenerated, setHasGenerated] = useState(false);
  const [generatedRecipe, setGeneratedRecipe] = useState<GeneratedRecipe | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const { isLoggedIn } = useAppStore();

  if (!isLoggedIn) {
    router.push('/login');
    return null;
  }

  const handleSelectImages = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    // 先显示预览
    const newImages: string[] = [];
    Array.from(files).forEach(file => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        newImages.push(result);
        if (newImages.length === Array.from(files).length) {
          triggerRecipeGeneration(newImages);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  // 核心：拍照/选图后自动触发 AI 生成食谱
  const triggerRecipeGeneration = async (imgs: string[]) => {
    setAiLoading(true);
    setImages(imgs.slice(0, 9));
    try {
      // 用第一张图调用 AI 生成食谱
      const imageUrl = imgs[0];
      const res: any = await aiAPI.generateRecipe(imageUrl);
      if (res.code === 'SUCCESS') {
        const recipe = res.data;
        setGeneratedRecipe(recipe);

        // 自动填充标题和正文
        const stepsText = recipe.steps.map((s: string, i: number) => `${i + 1}. ${s}`).join('\n');
        const ingredientsText = recipe.ingredients.join('、');

        setTitle(recipe.title || '');
        setContent(
          `【食材】\n${ingredientsText}\n\n` +
          `【做法】\n${stepsText}` +
          (recipe.tips ? `\n\n💡 小贴士：${recipe.tips}` : '')
        );

        // 自动设置封面图
        if (recipe.coverImage) {
          setImages([recipe.coverImage, ...imgs.slice(1, 9)]);
        }

        setHasGenerated(true);
        toast.success('AI 已自动生成食谱，标题和正文已填好！');
      }
    } catch (error) {
      toast.error('AI 生成失败，请手动填写');
      setHasGenerated(true);
    } finally {
      setAiLoading(false);
    }
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const addTag = () => {
    const tag = tagInput.trim().replace(/^#/, '');
    if (tag && !tags.includes(tag)) {
      setTags(prev => [...prev, tag]);
    }
    setTagInput('');
  };

  const removeTag = (tag: string) => {
    setTags(prev => prev.filter(t => t !== tag));
  };

  const handleTagKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addTag();
    }
  };

  // 发布
  const handlePublish = async () => {
    if (!title.trim()) {
      toast.error('请输入标题');
      return;
    }
    if (!content.trim()) {
      toast.error('请输入内容');
      return;
    }

    setLoading(true);
    try {
      const res: any = await contentAPI.publish({
        title: title.trim(),
        content: content.trim(),
        images: images.map(img => img.startsWith('data:') ? 'https://picsum.photos/400/400?random=' + Math.random() : img),
        tags: tags.length > 0 ? tags : undefined
      });

      if (res.code === 'SUCCESS') {
        toast.success('发布成功');
        router.push('/');
      } else {
        toast.error(res.message || '发布失败');
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || '发布失败');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* 顶部导航 */}
      <header className="sticky top-0 z-50 bg-white border-b border-gray-100">
        <div className="max-w-2xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link href="/" className="text-gray-400">
            <FiX className="w-6 h-6" />
          </Link>
          <h1 className="font-semibold text-gray-900">发布笔记</h1>
          <button
            onClick={handlePublish}
            disabled={loading}
            className="text-pink-500 font-medium disabled:opacity-50"
          >
            {loading ? '发布中...' : '发布'}
          </button>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-4 py-4 space-y-3">

        {/* ========== AI 拍照 Hero Banner（最醒目） ========== */}
        <div className="bg-gradient-to-br from-pink-500 via-orange-400 to-red-500 rounded-2xl p-6 text-white shadow-lg shadow-pink-200/50">
          <div className="text-center mb-4">
            <div className="text-4xl mb-2">📸</div>
            <h2 className="text-xl font-bold mb-1">拍照即发布 · 零门槛创作</h2>
            <p className="text-sm text-pink-100">拍张美食照，AI 自动生成标题、正文、食谱内容</p>
          </div>

          {aiLoading ? (
            <div className="flex flex-col items-center gap-3 py-4">
              <div className="w-10 h-10 border-4 border-white/30 border-t-white rounded-full animate-spin" />
              <span className="text-sm text-pink-100">AI 正在识别美食并生成食谱...</span>
            </div>
          ) : (
            <>
              <button
                onClick={handleSelectImages}
                className="w-full py-4 bg-white text-pink-600 font-bold rounded-xl text-base shadow-md hover:shadow-lg hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center gap-2"
              >
                <FiCamera className="w-5 h-5" />
                拍照 / 选择美食图片
              </button>
              <p className="text-center text-xs text-pink-200 mt-2">支持拍照或从相册选择</p>
            </>
          )}

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            onChange={handleFileChange}
            className="hidden"
          />
        </div>

        {/* AI 生成成功提示 */}
        {hasGenerated && !aiLoading && (
          <div className="bg-green-50 border border-green-200 rounded-xl p-3 flex items-center gap-2">
            <span className="text-green-500 text-lg">✅</span>
            <div className="flex-1">
              <div className="text-sm font-medium text-green-800">AI 已生成食谱！</div>
              <div className="text-xs text-green-600">
                标题和正文已自动填充，可直接发布或修改
              </div>
            </div>
            <button
              onClick={() => setHasGenerated(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              <FiX className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* AI 生成的食谱预览 */}
        {generatedRecipe && !aiLoading && (
          <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-xs bg-pink-100 text-pink-600 px-2 py-0.5 rounded-full font-medium">AI 生成</span>
              <span className="text-xs text-gray-400">点击标题/正文可直接修改</span>
            </div>
            {/* 食材 */}
            {generatedRecipe.ingredients && generatedRecipe.ingredients.length > 0 && (
              <div className="mb-3">
                <div className="text-xs text-gray-400 uppercase tracking-wide mb-1">食材</div>
                <div className="flex flex-wrap gap-1">
                  {generatedRecipe.ingredients.map((ing, i) => (
                    <span key={i} className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded">
                      {ing}
                    </span>
                  ))}
                </div>
              </div>
            )}
            {/* 步骤预览 */}
            {generatedRecipe.steps && generatedRecipe.steps.length > 0 && (
              <div>
                <div className="text-xs text-gray-400 uppercase tracking-wide mb-1">步骤预览</div>
                <div className="space-y-1">
                  {generatedRecipe.steps.slice(0, 2).map((step, i) => (
                    <div key={i} className="text-xs text-gray-500 flex gap-1.5">
                      <span className="text-pink-400 font-medium shrink-0">{i + 1}.</span>
                      <span className="line-clamp-1">{step}</span>
                    </div>
                  ))}
                  {generatedRecipe.steps.length > 2 && (
                    <div className="text-xs text-pink-400">+ 还有 {generatedRecipe.steps.length - 2} 步</div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* 标题 */}
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-medium text-gray-500">标题</label>
            {hasGenerated && (
              <span className="text-xs text-pink-400">✨ AI 已填充</span>
            )}
          </div>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="添加标题，让更多人看到你的笔记"
            className="w-full px-0 py-1 text-lg font-semibold border-0 border-b border-gray-100 focus:outline-none focus:border-pink-500 transition-colors placeholder-gray-300 bg-transparent"
          />
        </div>

        {/* 正文 */}
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-medium text-gray-500">正文</label>
            {hasGenerated && (
              <span className="text-xs text-pink-400">✨ AI 已填充</span>
            )}
          </div>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="分享你的美食心得..."
            rows={6}
            className="w-full px-0 py-1 border-0 focus:outline-none resize-none placeholder-gray-300 bg-transparent text-gray-700 text-sm leading-relaxed"
          />
        </div>

        {/* 图片预览（已由 AI 填充） */}
        {images.length > 0 && (
          <div className="bg-white rounded-xl p-4 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium text-gray-500">图片</label>
              <span className="text-xs text-gray-400">{images.length}/9</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {images.map((img, index) => (
                <div key={index} className="relative w-20 h-20 rounded-lg overflow-hidden bg-gray-100 shrink-0">
                  <Image src={img} alt="" fill className="object-cover" unoptimized />
                  <button
                    onClick={() => removeImage(index)}
                    className="absolute top-1 right-1 w-5 h-5 bg-black/50 rounded-full flex items-center justify-center text-white"
                  >
                    <FiX className="w-3 h-3" />
                  </button>
                </div>
              ))}
              {images.length < 9 && (
                <button
                  onClick={handleSelectImages}
                  className="w-20 h-20 rounded-lg border-2 border-dashed border-gray-200 flex flex-col items-center justify-center text-gray-400 hover:border-pink-300 hover:text-pink-400 transition-colors shrink-0"
                >
                  <FiCamera className="w-5 h-5 mb-0.5" />
                  <span className="text-xs">添加</span>
                </button>
              )}
            </div>
          </div>
        )}

        {/* 标签 */}
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-medium text-gray-500">标签</label>
            <button
              onClick={async () => {
                if (!content) { toast.error('请先生成或输入内容'); return; }
                setAiLoading(true);
                try {
                  const res: any = await aiAPI.generateTags(content);
                  if (res.code === 'SUCCESS' && res.data.length > 0) {
                    setTags(prev => Array.from(new Set([...prev, ...res.data.map((t: any) => t.name)])).slice(0, 10));
                    toast.success('AI 推荐标签');
                  }
                } catch {
                  toast.error('生成失败');
                } finally {
                  setAiLoading(false);
                }
              }}
              disabled={aiLoading || !content}
              className="text-xs text-pink-500 disabled:opacity-50"
            >
              {aiLoading ? '生成中...' : '🏷️ AI 推荐'}
            </button>
          </div>
          <div className="flex flex-wrap gap-2 mb-2">
            {tags.map(tag => (
              <span
                key={tag}
                className="px-3 py-1 bg-pink-50 text-pink-600 rounded-full text-sm flex items-center gap-1"
              >
                #{tag}
                <button onClick={() => removeTag(tag)} className="hover:text-pink-800">
                  <FiX className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>
          <input
            type="text"
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyDown={handleTagKeyDown}
            placeholder="输入标签后按回车添加"
            className="w-full px-3 py-2 border border-gray-100 rounded-lg focus:outline-none focus:border-pink-500 text-sm"
          />
        </div>

      </div>

      {/* 底部固定发布栏 */}
      <div className="fixed bottom-16 left-0 right-0 bg-white border-t border-gray-100 p-4 z-40">
        <div className="max-w-2xl mx-auto">
          <button
            onClick={handlePublish}
            disabled={loading}
            className="w-full py-3.5 bg-gradient-to-r from-pink-500 to-orange-500 text-white font-bold rounded-xl disabled:opacity-50 shadow-md shadow-pink-200/50 hover:shadow-lg transition-shadow"
          >
            {loading ? '发布中...' : '🚀 发布笔记'}
          </button>
        </div>
      </div>

      {/* 底部导航 */}
      <BottomNav />
    </div>
  );
}
