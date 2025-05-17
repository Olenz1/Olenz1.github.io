<template>
  <div class="create-post-view">
    <el-card>
      <template #header>
        <div class="card-header">
          <h2>发布树洞</h2>
          <p>分享你的想法、故事或问题</p>
        </div>
      </template>
      
      <el-form :model="postForm" :rules="rules" ref="postFormRef" label-position="top">
        <el-form-item label="内容" prop="content">
          <el-input
            v-model="postForm.content"
            type="textarea"
            :rows="6"
            placeholder="写下你想分享的内容..."
          />
        </el-form-item>
        
        <el-form-item label="标签">
          <el-select
            v-model="postForm.tags"
            multiple
            filterable
            allow-create
            default-first-option
            placeholder="选择或创建标签"
            style="width: 100%"
          >
            <el-option
              v-for="tag in availableTags"
              :key="tag"
              :label="tag"
              :value="tag"
            />
          </el-select>
          <div class="form-tip">最多选择3个标签，标签有助于其他人找到你的内容</div>
        </el-form-item>
        
        <el-form-item>
          <el-checkbox v-model="postForm.anonymous">匿名发布</el-checkbox>
          <div class="form-tip">匿名发布后，其他用户将无法看到你的用户名</div>
        </el-form-item>
        
        <div class="form-actions">
          <el-button @click="$router.push('/')">取消</el-button>
          <el-button type="primary" :loading="submitting" @click="submitPost">发布</el-button>
        </div>
      </el-form>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { postService, userService } from '../utils/leancloud'
import { ElMessage } from 'element-plus'

const router = useRouter()
const postFormRef = ref(null)
const submitting = ref(false)

// 检查用户是否已登录
onMounted(() => {
  const currentUser = userService.getCurrentUser()
  if (!currentUser) {
    ElMessage.warning('请先登录后再发布内容')
    router.push('/login')
  }
})

// 可用标签
const availableTags = [
  '学习', '生活', '情感', '吐槽', '求助', '分享', '校园', '考试', '实习', '就业',
  '考研', '娱乐', '美食', '运动', '社团', '宿舍', '课程', '老师', '同学', '友情', '爱情'
]

// 发布表单
const postForm = reactive({
  content: '',
  tags: [],
  anonymous: true
})

// 表单验证规则
const rules = {
  content: [
    { required: true, message: '请输入内容', trigger: 'blur' },
    { min: 5, max: 2000, message: '内容长度应在5-2000个字符之间', trigger: 'blur' }
  ]
}

// 提交发布
async function submitPost() {
  if (!postFormRef.value) return
  
  await postFormRef.value.validate(async (valid) => {
    if (!valid) return
    
    // 限制标签数量
    if (postForm.tags.length > 3) {
      ElMessage.warning('最多只能选择3个标签')
      return
    }
    
    submitting.value = true
    try {
      await postService.createPost(
        postForm.content,
        postForm.tags,
        postForm.anonymous
      )
      ElMessage.success('发布成功')
      router.push('/')
    } catch (error) {
      console.error('发布失败:', error)
      ElMessage.error('发布失败，请稍后重试')
    } finally {
      submitting.value = false
    }
  })
}
</script>

<style scoped>
.create-post-view {
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

.form-tip {
  font-size: 12px;
  color: #909399;
  margin-top: 5px;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 20px;
}
</style>