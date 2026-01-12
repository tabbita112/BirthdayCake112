// Service Worker for PWA - 优化离线支持
const CACHE_NAME = 'cake-adventure-v3';

// 自动检测基础路径（适配GitHub Pages）
const getBasePath = () => {
  // 从self.location获取当前路径
  const path = self.location.pathname;
  // 如果路径是 /repo-name/sw.js，提取 /repo-name
  const match = path.match(/^(\/[^\/]+)/);
  return match ? match[1] : '';
};

const BASE_PATH = getBasePath();

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
].filter(url => url); // 移除空字符串

// 安装Service Worker - 强制等待缓存完成
self.addEventListener('install', (event) => {
  console.log('Service Worker: 正在安装...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Service Worker: 缓存已打开');
        // 使用addAll，如果任何一个失败都会导致整个安装失败
        return cache.addAll(urlsToCache.map(url => new Request(url, {cache: 'reload'})));
      })
      .then(() => {
        console.log('Service Worker: 所有资源已缓存');
        // 强制激活新的Service Worker
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
      // 立即控制所有客户端
      return self.clients.claim();
    })
  );
});

// 拦截请求 - 使用缓存优先策略（离线优先）
self.addEventListener('fetch', (event) => {
  // 只处理GET请求
  if (event.request.method !== 'GET') {
    return;
  }

  event.respondWith(
    caches.match(event.request)
      .then((cachedResponse) => {
        // 如果缓存中有，直接返回（离线优先）
        if (cachedResponse) {
          return cachedResponse;
        }

        // 如果缓存中没有，尝试从网络获取
        return fetch(event.request)
          .then((response) => {
            // 检查响应是否有效
            if (!response || response.status !== 200 || response.type === 'error') {
              return response;
            }

            // 克隆响应以便缓存
            const responseToCache = response.clone();

            // 将新资源添加到缓存
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, responseToCache);
            });

            return response;
          })
          .catch((error) => {
            console.log('Service Worker: 网络请求失败，使用缓存:', error);
            // 如果网络请求失败，尝试返回缓存的版本
            return caches.match(event.request);
          });
      })
  );
});