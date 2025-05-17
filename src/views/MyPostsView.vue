<template>
  <div class="my-posts-view">
    <el-card>
      <template #header>
        <div class="card-header">
          <h2>我的树洞</h2>
          <p>查看和管理你发布的所有树洞内容</p>
        </div>
      </template>
      
      <el-empty v-if="posts.length === 0" description="你还没有发布过树洞内容" />
      
      <div v-else class="posts-list">
        <el-card v-for="post in posts" :key="post.id" class="post-card" @click="viewPostDetail(post.id)">
          <div class="post-content">
            <p>{{ post.content }}</p>
          </div>
          
          <div class="post-meta">
            <div class="post-tags">
              <el-tag v-for="tag in post.tags" :key="tag" size="small" class="post-tag">{{ tag }}</el-tag>
            </div>
            
            <div class="post-info">
              <span class="post-status">{{ post.anonymous ? '匿名发布' : '实名发布' }}</span>
              <span class="post-time">{{ formatTime(post.createdAt) }}</span>
            </div>
            
            <div class="post-stats">
              <span class="post-likes">
                <el-icon><thumb /></el-icon> {{ post.likes }}
              </span>
              <span class="post-comments">
                <el-icon><chat-dot-round /></el-icon> {{ post.comments }}
              </span>
            </div>
          </div>
        </el-card>
      </div>
      
      <div class="load-more" v-if="hasMore">
        <el-button :loading="loading" @click="loadMorePosts">加载更多</el-button>
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { Thumb, ChatDotRound } from '@element-plus/icons-vue'
import { postService, userService } from '../utils/leancloud'
import { ElMessage } from 'element-plus'
import dayjs from 'dayjs'

const router = useRouter()

// 帖子数据
const posts = ref([])
const loading = ref(false)
const hasMore = ref(true)
const currentPage = ref(0)
const pageSize = 10

// 格式化时间
function formatTime(time) {
  if (!time) return ''
  const date = typeof time === 'string' ? new Date(time) : time
  return dayjs(date).format('YYYY-MM-DD HH:mm')
}

// 获取用户帖子列表
async function fetchUserPosts() {
  if (loading.value || !hasMore.value) return
  
  const currentUser = userService.getCurrentUser()
  if (!currentUser) {
    ElMessage.warning('请先登录')
    router.push('/login')
    return
  }
  
  loading.value = true
  try {
    const skip = currentPage.value * pageSize
    const fetchedPosts = await postService.getUserPosts(currentUser, pageSize, skip)
    
    if (fetchedPosts.length < pageSize) {
      hasMore.value = false
    }
    
    posts.value = [...posts.value, ...fetchedPosts.map(post => ({
      id: post.id,
      content: post.get('content'),
      tags: post.get('tags') || [],
      anonymous: post.get('anonymous'),
      likes: post.get('likes') || 0,
      comments: post.get('comments') || 0,
      createdAt: post.createdAt
    }))]
    
    currentPage.value++
  } catch (error) {
    console.error('获取帖子失败:', error)
    ElMessage.error('获取帖子失败，请稍后重试')
  } finally {
    loading.value = false
  }
}

// 加载更多帖子
function loadMorePosts() {
  fetchUserPosts()
}

// 查看帖子详情
function viewPostDetail(postId) {
  router.push(`/post/${postId}`)
}

// 检查用户是否已登录
onMounted(() => {
  const currentUser = userService.getCurrentUser()
  if (!currentUser) {
    ElMessage.warning('请先登录后再查看')
    router.push('/login')
    return
  }
  
  fetchUserPosts()
})
</script>

<style scoped>
.my-posts-view {
  max-width: 800px;
  margin: 0 auto;
}

.card-header {
  text-align: center;
}

.card-header h2 {
  margin-bottom: 10px;
  font-weight: 500;
}

.card-header p {
  color: #909399;
  font-size: 14px;
}

.posts-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
  margin-top: 20px;
}

.post-card {
  cursor: pointer;
  transition: transform 0.2s;
  border: 1px solid #ebeef5;
}

.post-card:hover {
  transform: translateY(-3px);
}

.post-content {
  margin-bottom: 15px;
}

.post-content p {
  white-space: pre-line;
  word-break: break-word;
  line-height: 1.6;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.post-meta {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.post-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 5px;
  margin-bottom: 5px;
}

.post-info {
  display: flex;
  justify-content: space-between;
  color: #909399;
  font-size: 14px;
}

.post-stats {
  display: flex;
  gap: 15px;
  color: #909399;
  font-size: 14px;
}

.post-likes, .post-comments {
  display: flex;
  align-items: center;
  gap: 5px;
}

.load-more {
  text-align: center;
  margin-top: 20px;
}
</style>