import { createRouter, createWebHashHistory } from 'vue-router'

const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    {
      path: '/',
      component: () => import('../layouts/MainLayout.vue'),
      children: [
        {
          path: '',
          name: 'home',
          component: () => import('../views/HomeView.vue'),
          meta: { title: '首页' }
        },
        {
          path: 'post/:id',
          name: 'post-detail',
          component: () => import('../views/PostDetailView.vue'),
          meta: { title: '帖子详情' }
        },
        {
          path: 'create',
          name: 'create-post',
          component: () => import('../views/CreatePostView.vue'),
          meta: { title: '发布树洞' }
        },
        {
          path: 'my',
          name: 'my-posts',
          component: () => import('../views/MyPostsView.vue'),
          meta: { title: '我的树洞' }
        }
      ]
    },
    {
      path: '/login',
      name: 'login',
      component: () => import('../views/LoginView.vue'),
      meta: { title: '登录' }
    },
    {
      path: '/register',
      name: 'register',
      component: () => import('../views/RegisterView.vue'),
      meta: { title: '注册' }
    },
    {
      path: '/:pathMatch(.*)*',
      name: 'not-found',
      component: () => import('../views/NotFoundView.vue'),
      meta: { title: '页面未找到' }
    }
  ]
})

router.beforeEach((to, from, next) => {
  // 设置页面标题
  document.title = to.meta.title ? `${to.meta.title} - 大学生树洞` : '大学生树洞'
  next()
})

export default router