import AV from 'leancloud-storage';

// LeanCloud 应用配置
export function initLeanCloud() {
  // 初始化 LeanCloud 存储 SDK
  AV.init({
    // 请在实际使用时替换为您的 LeanCloud 应用信息
    appId: 'YOUR_APP_ID',
    appKey: 'YOUR_APP_KEY',
    serverURL: 'YOUR_SERVER_URL'
  });
}

// 用户相关操作
export const userService = {
  // 用户注册
  async register(username, password, email) {
    const user = new AV.User();
    user.setUsername(username);
    user.setPassword(password);
    user.setEmail(email);
    return user.signUp();
  },

  // 用户登录
  async login(username, password) {
    return AV.User.logIn(username, password);
  },

  // 获取当前用户
  getCurrentUser() {
    return AV.User.current();
  },

  // 用户登出
  logout() {
    return AV.User.logOut();
  }
};

// 帖子相关操作
export const postService = {
  // 创建帖子
  async createPost(content, tags = [], anonymous = true) {
    const Post = AV.Object.extend('Post');
    const post = new Post();
    post.set('content', content);
    post.set('tags', tags);
    post.set('anonymous', anonymous);
    post.set('likes', 0);
    post.set('comments', 0);
    
    // 设置作者
    const currentUser = userService.getCurrentUser();
    if (currentUser) {
      post.set('author', currentUser);
      if (!anonymous) {
        post.set('authorName', currentUser.get('username'));
      }
    }
    
    return post.save();
  },

  // 获取帖子列表
  async getPosts(limit = 20, skip = 0, tag = null) {
    const query = new AV.Query('Post');
    query.descending('createdAt');
    query.limit(limit);
    query.skip(skip);
    
    if (tag) {
      query.equalTo('tags', tag);
    }
    
    return query.find();
  },

  // 获取帖子详情
  async getPostById(id) {
    const query = new AV.Query('Post');
    return query.get(id);
  },

  // 获取用户的帖子
  async getUserPosts(user, limit = 20, skip = 0) {
    const query = new AV.Query('Post');
    query.equalTo('author', user);
    query.descending('createdAt');
    query.limit(limit);
    query.skip(skip);
    return query.find();
  },

  // 点赞帖子
  async likePost(postId) {
    const post = AV.Object.createWithoutData('Post', postId);
    post.increment('likes');
    return post.save();
  }
};

// 评论相关操作
export const commentService = {
  // 创建评论
  async createComment(postId, content, anonymous = true) {
    const Comment = AV.Object.extend('Comment');
    const comment = new Comment();
    
    // 设置评论内容和关联的帖子
    comment.set('content', content);
    comment.set('anonymous', anonymous);
    const post = AV.Object.createWithoutData('Post', postId);
    comment.set('post', post);
    
    // 设置评论作者
    const currentUser = userService.getCurrentUser();
    if (currentUser) {
      comment.set('author', currentUser);
      if (!anonymous) {
        comment.set('authorName', currentUser.get('username'));
      }
    }
    
    // 增加帖子的评论计数
    post.increment('comments');
    await post.save();
    
    return comment.save();
  },

  // 获取帖子的评论
  async getCommentsByPostId(postId, limit = 50, skip = 0) {
    const query = new AV.Query('Comment');
    const post = AV.Object.createWithoutData('Post', postId);
    query.equalTo('post', post);
    query.ascending('createdAt');
    query.limit(limit);
    query.skip(skip);
    return query.find();
  }
};