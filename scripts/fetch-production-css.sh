# 獲取生產環境 CSS 文件用於分析

echo "正在獲取生產環境 CSS 文件..."
curl -s https://admission-master-ecru.vercel.app/_next/static/chunks/0vlsmocr05n6f.css > /tmp/production.css

echo "文件大小："
ls -lh /tmp/production.css

echo "檢查是否有文字方向相關的設定："
grep -i "writing\|direction\|orientation" /tmp/production.css | head -20

echo "檢查 Tailwind 相關的設定："
grep -i "text" /tmp/production.css | head -30