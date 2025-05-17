<template>
  <div class="home-view">
    <div class="filter-section">
      <el-card>
        <div class="filter-header">
          <h2>筛选</h2>
          <el-button type="primary" @click="$router.push('/create')" :disabled="!isLoggedIn">
            <el-icon><plus /></el-icon> 发布树洞
          </el-button>
        </div>
        
        <div class="tags-filter">
          <el-tag 
            :effect="currentTag === null ? 'dark' : 'plain'"
            @click="setCurrentTag(null)"
            class="filter-tag"
          >
            全部
          </el-tag>
          <el-tag 
            v-for="tag in popularTags" 
            :key="tag"
            :effect="currentTag === tag ? 'dark' : 'plain'"
            @click="setCurrentTag(tag)"
            class="filter-tag"
          >
            {{ tag }}
          </el-tag>
        </div>
      </el-card>
    </div>
    
    <div class="posts-section">
      <el-empty v-if="posts.length === 0" description="暂无树洞内容" />
      
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
              <span class="post-author">{{ post.anonymous ? '匿名用户' : post.authorName }}</span>
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
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { Plus, Thumb, ChatDotRound } from '@element-plus/icons-vue'
import { postService, userService } from '../utils/leancloud'
import { ElMessage } from 'element-plus'
import dayjs from 'dayjs'
import 'dayjs/locale/zh-cn'

dayjs.locale('zh-cn')

const router = useRouter()

// 用户状态
const isLoggedIn = computed(() => !!userService.getCurrentUser())

// 帖子数据
const posts = ref([])
const loading = ref(false)
const hasMore = ref(true)
const currentPage = ref(0)
const pageSize = 10
const currentTag = ref(null)

// 热门标签
const popularTags = ref(['学习', '生活', '情感', '吐槽', '求助'])

// 格式化时间
function formatTime(time) {
  if (!time) return ''
  const date = typeof time === 'string' ? new Date(time) : time
  return dayjs(date).format('YYYY-MM-DD HH:mm')
}

// 设置当前标签筛选
function setCurrentTag(tag) {
  currentTag.value = tag
  posts.value = []
  currentPage.value = 0
  hasMore.value = true
  fetchPosts()
}

// 获取帖子列表
async function fetchPosts() {
  if (loading.value || !hasMore.value) return
  
  loading.value = true
  try {
    const skip = currentPage.value * pageSize
    const fetchedPosts = await postService.getPosts(pageSize, skip, currentTag.value)
    
    if (fetchedPosts.length < pageSize) {
      hasMore.value = false
    }
    
    posts.value = [...posts.value, ...fetchedPosts.map(post => ({
      id: post.id,
      content: post.get('content'),
      tags: post.get('tags') || [],
      anonymous: post.get('anonymous'),
      authorName: post.get('authorName') || '匿名用户',
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
  fetchPosts()
}

// 查看帖子详情
function viewPostDetail(postId) {
  router.push(`/post/${postId}`)
}

// 初始化加载
onMounted(() => {
  fetchPosts()
})
</script>

<style scoped>
.home-view {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.filter-section {
  margin-bottom: 10px;
}

.filter-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.filter-header h2 {
  margin: 0;
  font-size: 18px;
  font-weight: 500;
}

.tags-filter {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.filter-tag {
  cursor: pointer;
}

.posts-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.post-card {
  cursor: pointer;
  transition: transform 0.2s;
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

@media (max-width: 768px) {
  .filter-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }
}
</style>