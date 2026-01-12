// 构建Service Worker的脚本
// 这个脚本会根据config.js中的路径生成正确的sw.js

const fs = require('fs');
const path = require('path');

// 读取config.js获取基础路径
let basePath = '';
try {
    const configContent = fs.readFileSync('config.js', 'utf8');
    const match = configContent.match(/GITHUB_PAGES_BASE\s*=\s*['"]([^'"]*)['"]/);
    if (match) {
        basePath = match[1];
    }
} catch (e) {
    console.log('未找到config.js，使用默认路径');
}

// 生成路径前缀
const pathPrefix = basePath || '';

// 读取原始sw.js模板
const swTemplate = `// Service Worker for PWA - 优化离线支持
const CACHE_NAME = 'cake-adventure-v3';
const BASE_PATH = '${pathPrefix}';
const urlsToCache = [
  BASE_PATH + '/',
  BASE_PATH + '/index.html',
  BASE_PATH + '/style.css',
  BASE_PATH + '/game.js',
  BASE_PATH + '/manifest.json',
  BASE_PATH + '/Assets/cake.png',
  BASE_PATH + '/Assets/cake_run.png',
  BASE_PATH + '/Assets/blueberry.png',
  BASE_PATH + '/Assets/strawberry.png',
  BASE_PATH + '/Assets/fig.png',
  BASE_PATH + '/Assets/orange.png',
  BASE_PATH + '/Assets/apple.png',
  BASE_PATH + '/Assets/mango.png',
  BASE_PATH + '/Assets/dragonfruit.png',
  BASE_PATH + '/Assets/pineapple.png',
  BASE_PATH + '/Assets/watermelon.png',
  BASE_PATH + '/Assets/win.png'
];

// 安装Service Worker - 强制等待缓存完成
self.addEventListener('install', (event) => {
  console.log('Service Worker: 正在安装...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Service Worker: 缓存已打开');
        return cache.addAll(urlsToCache.map(url => new Request(url, {cache: 'reload'})));
      })
      .then(() => {
        console.log('Service Worker: 所有资源已缓存');
        return self.skipWaiting();
      })
      .catch((error) => {
        console.error('Service Worker: 缓存失败:', error);
      })
  );
});

// 激活Service Worker
self.addEventListener('activate', (event) => {
  console.log('Service Worker: 正在激活...');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('Service Worker: 删除旧缓存:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      return self.clients.claim();
    })
  );
});

// 拦截请求 - 使用缓存优先策略（离线优先）
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') {
    return;
  }

  event.respondWith(
    caches.match(event.request)
      .then((cachedResponse) => {
        if (cachedResponse) {
          return cachedResponse;
        }

        return fetch(event.request)
          .then((response) => {
            if (!response || response.status !== 200 || response.type === 'error') {
              return response;
            }

            const responseToCache = response.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, responseToCache);
            });

            return response;
          })
          .catch((error) => {
            console.log('Service Worker: 网络请求失败，使用缓存:', error);
            return caches.match(event.request);
          });
      })
  );
});
`;

// 写入sw.js
fs.writeFileSync('sw.js', swTemplate);
console.log(`Service Worker已生成，基础路径: ${pathPrefix || '(根路径)'}`);
