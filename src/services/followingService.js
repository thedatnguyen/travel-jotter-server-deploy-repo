const { PrismaClient } = require('@prisma/client');
const { Worker } = require('worker_threads');

const prisma = new PrismaClient();

const errorHandler = (err) => {
	console.log(err);
	return { error: { message: err.message } };
};

const follow = async(following, follower) => {
  try {
		await prisma.$connect();
		const accounts = await Promise.all([
      prisma.account.findUnique({
        where: {email: following}
      }),
      prisma.account.findUnique({
        where: {email: follower}
      })
    ])

    if(accounts.length != 2) return errorHandler({
      message: 'Account invalid'
    })

    await prisma.follow.create({
      data: {
        following,
        follower
      }
    })

    // push notification to following
    const workerData = {
			action: 'new follower',
			data: {
        following,
        follower
			}
		};
		new Worker(
			`${global.__path_background_workers}/pushNotification.js`,
			{ workerData }
		);

    return {
      result: null
    }
	} catch (error) {
		return errorHandler(error);
	} finally {
		await prisma.$disconnect();
	}
};

const removeOrUnfollow = async(following, follower) => {
  try {
		await prisma.$connect();
    await prisma.follow.delete({
      where: {
        follower_following: {
          follower: follower,
          following: following
        }
      }
    })

    return {
      result: null
    }
	} catch (error) {
		return errorHandler(error);
	} finally {
		await prisma.$disconnect();
	}
}

const getAllFollowingAndFollower = async(email) => {
  try {
		await prisma.$connect();
    const [following, follower] = await new Promise.all([
      prisma.follow.findMany({
        where: {follower: email}
      }),
      prisma.follow.findMany({
        where: {following: email}
      })
    ])
    return {
      result: {
        following,
        follower
      }
    }
	} catch (error) {
		return errorHandler(error);
	} finally {
		await prisma.$disconnect();
	}
}

module.exports = {
  follow,
  removeOrUnfollow,
  getAllFollowingAndFollower
}