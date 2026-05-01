'use client';

import { useRef, useState, useEffect } from 'react';
import type { ScoreAnalysis, ShareCardData } from '@/types';

interface Props {
  analysis: ScoreAnalysis;
  onClose: () => void;
}

export default function ShareCard({ analysis, onClose }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [goal, setGoal] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(true);
  const [imageUrl, setImageUrl] = useState<string | null>(null);

  useEffect(() => {
    drawCard();
  }, [goal, isAnonymous]);

  function drawCard() {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const W = 1280;
    const H = 720;
    canvas.width = W;
    canvas.height = H;

    // Background gradient
    const bg = ctx.createLinearGradient(0, 0, W, H);
    bg.addColorStop(0, '#4F46E5');
    bg.addColorStop(1, '#7C3AED');
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, W, H);

    // Subtle pattern
    ctx.globalAlpha = 0.05;
    for (let i = 0; i < 20; i++) {
      ctx.beginPath();
      ctx.arc(Math.random() * W, Math.random() * H, Math.random() * 100 + 50, 0, Math.PI * 2);
      ctx.fillStyle = '#ffffff';
      ctx.fill();
    }
    ctx.globalAlpha = 1;

    // Ema (繪馬) shape - wooden plaque
    const plaqueX = 340;
    const plaqueY = 60;
    const plaqueW = 600;
    const plaqueH = 600;

    // Wooden background
    ctx.fillStyle = '#FFF8E7';
    ctx.beginPath();
    ctx.moveTo(plaqueX + 20, plaqueY);
    ctx.lineTo(plaqueX + plaqueW - 20, plaqueY);
    ctx.lineTo(plaqueX + plaqueW, plaqueY + 30);
    ctx.lineTo(plaqueX + plaqueW, plaqueY + plaqueH);
    ctx.lineTo(plaqueX, plaqueY + plaqueH);
    ctx.lineTo(plaqueX, plaqueY + 30);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = '#D4A574';
    ctx.lineWidth = 3;
    ctx.stroke();

    // Inner border
    ctx.strokeStyle = '#E8C89E';
    ctx.lineWidth = 1;
    ctx.strokeRect(plaqueX + 30, plaqueY + 40, plaqueW - 60, plaqueH - 80);

    // Rope at top
    ctx.strokeStyle = '#8B6914';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(640, 0);
    ctx.lineTo(640, 70);
    ctx.stroke();

    // Title
    ctx.fillStyle = '#8B6914';
    ctx.font = 'bold 28px "Noto Sans TC", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('我的升學願望', 640, 130);

    // Divider
    ctx.strokeStyle = '#E8C89E';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(plaqueX + 60, 150);
    ctx.lineTo(plaqueX + plaqueW - 60, 150);
    ctx.stroke();

    // Score
    ctx.fillStyle = '#4F46E5';
    ctx.font = 'bold 72px "Noto Sans TC", sans-serif';
    ctx.fillText(`${analysis.total} 級分`, 640, 240);

    ctx.fillStyle = '#6B7280';
    ctx.font = '20px "Noto Sans TC", sans-serif';
    ctx.fillText(`超越全國 ${analysis.percentile}% 的學生`, 640, 275);

    // Recommended pathway
    const topPathway = analysis.recommendedPathways[0];
    ctx.fillStyle = '#1F2937';
    ctx.font = 'bold 24px "Noto Sans TC", sans-serif';
    ctx.fillText(`推薦管道：${topPathway.name}`, 640, 330);

    ctx.fillStyle = '#6B7280';
    ctx.font = '18px "Noto Sans TC", sans-serif';
    ctx.fillText(topPathway.description, 640, 365);

    // Goal section
    if (goal) {
      ctx.fillStyle = '#4F46E5';
      ctx.font = 'bold 22px "Noto Sans TC", sans-serif';
      ctx.fillText('我的目標', 640, 430);

      ctx.fillStyle = '#374151';
      ctx.font = '24px "Noto Sans TC", sans-serif';
      const goalLines = wrapText(ctx, goal, 480);
      goalLines.forEach((line, i) => {
        ctx.fillText(line, 640, 465 + i * 35);
      });
    } else {
      ctx.fillStyle = '#9CA3AF';
      ctx.font = 'italic 20px "Noto Sans TC", sans-serif';
      ctx.fillText('寫下你的目標，讓未來可見', 640, 450);
    }

    // Anonymous badge
    if (isAnonymous) {
      ctx.fillStyle = '#F3F4F6';
      roundRect(ctx, 560, 570, 160, 32, 16);
      ctx.fill();
      ctx.fillStyle = '#9CA3AF';
      ctx.font = '14px "Noto Sans TC", sans-serif';
      ctx.fillText('匿名分享', 640, 591);
    }

    // Branding
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 20px "Noto Sans TC", sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('升學大師', 40, 700);

    ctx.fillStyle = 'rgba(255,255,255,0.7)';
    ctx.font = '14px "Noto Sans TC", sans-serif';
    ctx.fillText('admission-master.app', 40, 720);

    // QR placeholder area
    ctx.fillStyle = '#FFFFFF';
    roundRect(ctx, W - 130, H - 130, 100, 100, 12);
    ctx.fill();
    ctx.fillStyle = '#4F46E5';
    ctx.font = '12px "Noto Sans TC", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('掃碼查看', W - 80, H - 85);
    ctx.fillText('更多分析', W - 80, H - 65);
  }

  function wrapText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
    const lines: string[] = [];
    let current = '';
    for (const char of text) {
      const test = current + char;
      if (ctx.measureText(test).width > maxWidth) {
        lines.push(current);
        current = char;
      } else {
        current = test;
      }
    }
    if (current) lines.push(current);
    return lines.slice(0, 3);
  }

  function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h - r);
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx.lineTo(x + r, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
  }

  function downloadCard() {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const url = canvas.toDataURL('image/png');
    setImageUrl(url);

    const link = document.createElement('a');
    link.download = 'admission-master-card.png';
    link.href = url;
    link.click();
  }

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[95vh] overflow-y-auto p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900">我的升學圖卡</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl">&times;</button>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <div className="flex justify-center">
            <canvas
              ref={canvasRef}
              className="rounded-xl shadow-lg max-w-full h-auto"
              style={{ width: 480 }}
            />
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                我的目标（會顯示在圖卡上）
              </label>
              <input
                type="text"
                value={goal}
                onChange={e => setGoal(e.target.value)}
                placeholder="例如：考上台大電機、成為一名醫生..."
                maxLength={50}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
              />
            </div>

            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={isAnonymous}
                onChange={e => setIsAnonymous(e.target.checked)}
                className="w-5 h-5 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
              />
              <span className="text-sm text-gray-600">匿名分享（不顯示姓名）</span>
            </label>

            <button
              onClick={downloadCard}
              className="w-full py-3 bg-primary-600 text-white rounded-xl font-bold hover:bg-primary-700 transition-colors"
            >
              下載圖卡
            </button>

            <p className="text-xs text-gray-400 text-center">
              長按圖片儲存，分享到 IG Story 讗朋友看到
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
