/**
 * @description 微博 @ 用户关系 service
 * @author 阿凡
 */

const { AtRelation, Blog, User } = require('../db/model/index');
const { formatBlog, formatUser } = require('./_format');

/**
 * 创建微博 @ 用户的关系
 * @param {number} blogId 微博 id
 * @param {number} userId 用户 id
 */
async function createAtRelation(blogId, userId) {
  const result = await AtRelation.create({
    blogId,
    userId,
  });
  return result.dataValues;
}

/**
 * 获取 @ 用户的微博数量 (未读的)
 * @param {number} userId
 */
async function getAtRelationCount(userId) {
  const result = await AtRelation.findAndCountAll({
    where: {
      userId,
      isRead: false,
    },
  });
  return result.count;
  // result.rows
}

/**
 * 获取 @ 用户的微博列表
 * @param {Obejct} param0 查询条件{ userId, pageIndex, pageSize = 10}
 */
async function getAtUserBlogList({ userId, pageIndex, pageSize = 10 }) {
  const result = await Blog.findAndCountAll({
    limit: pageSize,
    offset: pageIndex * pageSize,
    order: [['id', 'desc']],
    include: [
      // @ 关系
      {
        model: AtRelation,
        attributes: ['userId', 'blogId'],
        where: { userId },
      },
      // User
      {
        model: User,
        attributes: ['userName', 'nickName', 'picture'],
      },
    ],
  });
  // result.rows
  // result.count

  // 格式化
  let blogList = result.rows.map((row) => row.dataValues);
  blogList = formatBlog(blogList);
  blogList = blogList.map((blogItem) => {
    blogItem.user = formatUser(blogItem.user.dataValues);
    return blogItem;
  });

  return {
    count: result.count,
    blogList,
  };
}

/**
 * 更新 AtRelation
 * @param {Obejct} param0 更新内容
 * @param {Obejct} param1 查询条件
 */
async function updateAtRelation(
  { newIsRead }, // 要更新的内容
  { userId, isRead } // 条件
) {
  // 拼接更新内容
  const updateData = {};
  if (newIsRead) {
    updateData.isRead = newIsRead;
  }

  // 拼接查询条件
  const whrerData = {};
  if (userId) {
    whrerData.userId = userId;
  }
  if (isRead) {
    whrerData.isRead = isRead;
  }

  // 执行更新
  const result = await AtRelation.update(updateData, {
    where: whrerData,
  });
  return result[0] > 0;
}

module.exports = {
  createAtRelation,
  getAtRelationCount,
  getAtUserBlogList,
  updateAtRelation,
};
