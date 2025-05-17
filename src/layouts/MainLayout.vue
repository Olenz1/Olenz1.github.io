<template>
  <div class="main-layout">
    <header class="header">
      <div class="container header-container">
        <div class="logo" @click="$router.push('/')">
          <h1>大学生树洞</h1>
        </div>
        <div class="nav-menu">
          <el-menu
            :default-active="activeIndex"
            mode="horizontal"
            router
            background-color="transparent"
            text-color="#333"
            active-text-color="#409EFF"
          >
            <el-menu-item index="/">首页</el-menu-item>
            <el-menu-item index="/create">发布树洞</el-menu-item>
            <el-menu-item index="/my" v-if="isLoggedIn">我的树洞</el-menu-item>
          </el-menu>
        </div>
        <div class="user-actions">
          <template v-if="isLoggedIn">
            <el-dropdown>
              <span class="user-profile">
                {{ currentUser?.username }}
                <el-icon><arrow-down /></el-icon>
              </span>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item @click="handleLogout">退出登录</el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </template>
          <template v-else>
            <el-button type="primary" @click="$router.push('/login')">登录</el-button>
            <el-button @click="$router.push('/register')">注册</el-button>
          </template>
        </div>
      </div>
    </header>

    <main class="main-content">
      <div class="container">
        <router-view />
      </div>
    </main>

    <footer class="footer">
      <div class="container">
        <p>© {{ new Date().getFullYear() }} 大学生树洞 - 校园生活交流平台</p>
      </div>
    </footer>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ArrowDown } from '@element-plus/icons-vue'
import { userService } from '../utils/leancloud'
import { ElMessage } from 'element-plus'

const route = useRoute()
const router = useRouter()

// 当前活跃的导航项
const activeIndex = computed(() => route.path)

// 用户状态
const currentUser = ref(null)
const isLoggedIn = computed(() => !!currentUser.value)

// 获取当前用户信息
onMounted(() => {
  getCurrentUser()
})

function getCurrentUser() {
  const user = userService.getCurrentUser()
  if (user) {
    currentUser.value = {
      id: user.id,
      username: user.get('username'),
      email: user.get('email')
    }
  }
}

// 退出登录
async function handleLogout() {
  try {
    await userService.logout()
    currentUser.value = null
    ElMessage.success('退出登录成功')
    router.push('/login')
  } catch (error) {
    console.error('退出登录失败:', error)
    ElMessage.error('退出登录失败')
  }
}
</script>

<style scoped>
.main-layout {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 15px;
}

.header {
  background-color: #fff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  position: sticky;
  top: 0;
  z-index: 100;
}

.header-container {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 60px;
}

.logo {
  cursor: pointer;
}

.logo h1 {
  margin: 0;
  font-size: 1.5rem;
  color: #409EFF;
}

.nav-menu {
  flex: 1;
  margin: 0 20px;
}

.user-actions {
  display: flex;
  gap: 10px;
  align-items: center;
}

.user-profile {
  display: flex;
  align-items: center;
  cursor: pointer;
  font-size: 14px;
}

.main-content {
  flex: 1;
  padding: 20px 0;
}

.footer {
  background-color: #f8f8f8;
  padding: 20px 0;
  text-align: center;
  color: #666;
}
</style>