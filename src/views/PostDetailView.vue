<template>
  <div class="post-detail-view">
    <!-- 帖子内容 -->
    <el-card v-if="post" class="post-card">
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
        
        <div class="post-actions">
          <el-button type="primary" size="small" plain @click="handleLike" :disabled="!isLoggedIn">
            <el-icon><thumb /></el-icon> 点赞 ({{ post.likes }})
          </el-button>
        </div>
      </div>
    </el-card>
    
    <el-card v-else class="loading-card">
      <el-skeleton :rows="3" animated />
    </el-card>
    
    <!-- 评论区 -->
    <el-card class="comments-card">
      <template #header>
        <div class="comments-header">
          <h3>评论 ({{ comments.length }})</h3>
        </div>
      </template>
      
      <!-- 评论列表 -->
      <div v-if="comments.length > 0" class="comments-list">
        <div v-for="comment in comments" :key="comment.id" class="comment-item">
          <div class="comment-author">
            <span>{{ comment.anonymous ? '匿名用户' : comment.authorName }}</span>
            <span class="comment-time">{{ formatTime(comment.createdAt) }}</span>
          </div>
          <div class="comment-content">
            <p>{{ comment.content }}</p>
          </div>
        </div>
      </div>
      
      <el-empty v-else description="暂无评论" />
      
      <!-- 发表评论 -->
      <div class="comment-form">
        <el-divider>发表评论</el-divider>
        <el-form v-if="isLoggedIn">
          <el-form-item>
            <el-input
              v-model="commentContent"
              type="textarea"
              :rows="3"
              placeholder="分享你的想法..."
            />
          </el-form-item>
          <el-form-item>
            <el-checkbox v-model="isAnonymous">匿名发布</el-checkbox>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="submitComment" :loading="submitting" :disabled="!commentContent.trim()">
              发表评论
            </el-button>
          </el-form-item>
        </el-form>
        
        <div v-else class="login-tip">
          <p>请先 <router-link to="/login">登录</router-link> 后发表评论</p>
        </div>
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Thumb } from '@element-plus/icons-vue'
import { postService, commentService, userService } from '../utils/leancloud'
import { ElMessage } from 'element-plus'
import dayjs from 'dayjs'

const route = useRoute()
const router = useRouter()
const postId = route.params.id

// 用户状态
const isLoggedIn = computed(() => !!userService.getCurrentUser())

// 帖子数据
const post = ref(null)
const comments = ref([])
const commentContent = ref('')
const isAnonymous = ref(true)
const submitting = ref(false)

// 格式化时间
function formatTime(time) {
  if (!time) return ''
  const date = typeof time === 'string' ? new Date(time) : time
  return dayjs(date).format('YYYY-MM-DD HH:mm')
}

// 获取帖子详情
async function fetchPostDetail() {
  try {
    const postData = await postService.getPostById(postId)
    post.value = {
      id: postData.id,
      content: postData.get('content'),
      tags: postData.get('tags') || [],
      anonymous: postData.get('anonymous'),
      authorName: postData.get('authorName') || '匿名用户',
      likes: postData.get('likes') || 0,
      comments: postData.get('comments') || 0,
      createdAt: postData.createdAt
    }
  } catch (error) {
    console.error('获取帖子详情失败:', error)
    ElMessage.error('获取帖子详情失败')
    router.push('/')
  }
}

// 获取评论列表
async function fetchComments() {
  try {
    const commentsList = await commentService.getCommentsByPostId(postId)
    comments.value = commentsList.map(comment => ({
      id: comment.id,
      content: comment.get('content'),
      anonymous: comment.get('anonymous'),
      authorName: comment.get('authorName') || '匿名用户',
      createdAt: comment.createdAt
    }))
  } catch (error) {
    console.error('获取评论失败:', error)
    ElMessage.error('获取评论失败')
  }
}

// 提交评论
async function submitComment() {
  if (!commentContent.value.trim()) return
  
  submitting.value = true
  try {
    await commentService.createComment(postId, commentContent.value, isAnonymous.value)
    ElMessage.success('评论发布成功')
    commentContent.value = ''
    // 刷新评论列表和帖子数据
    await Promise.all([fetchComments(), fetchPostDetail()])
  } catch (error) {
    console.error('发布评论失败:', error)
    ElMessage.error('发布评论失败')
  } finally {
    submitting.value = false
  }
}

// 点赞帖子
async function handleLike() {
  if (!isLoggedIn.value) {
    ElMessage.warning('请先登录')
    return
  }
  
  try {
    await postService.likePost(postId)
    post.value.likes++
    ElMessage.success('点赞成功')
  } catch (error) {
    console.error('点赞失败:', error)
    ElMessage.error('点赞失败')
  }
}

// 初始化加载
onMounted(async () => {
  await fetchPostDetail()
  await fetchComments()
})
</script>

<style scoped>
.post-detail-view {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.post-card {
  margin-bottom: 0;
}

.post-content {
  margin-bottom: 20px;
}

.post-content p {
  white-space: pre-line;
  word-break: break-word;
  line-height: 1.6;
  font-size: 16px;
}

.post-meta {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.post-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.post-info {
  display: flex;
  justify-content: space-between;
  color: #909399;
  font-size: 14px;
}

.post-actions {
  display: flex;
  justify-content: flex-end;
  margin-top: 10px;
}

.comments-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.comments-header h3 {
  margin: 0;
  font-size: 18px;
  font-weight: 500;
}

.comments-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.comment-item {
  border-bottom: 1px solid #ebeef5;
  padding-bottom: 15px;
}

.comment-item:last-child {
  border-bottom: none;
}

.comment-author {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
  font-weight: 500;
}

.comment-time {
  font-size: 12px;
  color: #909399;
  font-weight: normal;
}

.comment-content p {
  margin: 0;
  white-space: pre-line;
  word-break: break-word;
}

.comment-form {
  margin-top: 20px;
}

.login-tip {
  text-align: center;
  padding: 20px;
  color: #909399;
}
</style>