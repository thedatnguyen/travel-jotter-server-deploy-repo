const { createClient } = require('redis');

const get = async (key) => {
    const redisClient = createClient({
        url: process.env.REDIS_SERVER
    });
    await redisClient.connect();
    try {
        const result = await redisClient.get(key);
        return { result }
    } catch (error) {
        console.log(error);
        return { error: { message: error.message } }
    } finally {
        await redisClient.disconnect();
    }
}

const set = async (records, exp) => {
    const redisClient = createClient({
        url: process.env.REDIS_SERVER
    });
    await redisClient.connect();
    try {
        if (!Array.isArray(records)) records = [records];
        const result = await Promise.all(
            records.map(e => {
                redisClient.set(e.key, JSON.stringify(e.value), {
                    EX: exp,
                    NX: true
                })
            })
        )
        return { result }
    } catch (error) {
        console.log(error);
        return { error: { message: error.message } }
    } finally {
        await redisClient.disconnect();
    }
}

const del = async (keys) => {
    const redisClient = createClient({
        url: process.env.REDIS_SERVER
    });
    await redisClient.connect();
    try {
        if (!Array.isArray(keys)) keys = [keys];
        const result = await Promise.all(
            keys.map(key => redisClient.del(key))
        )
        return { result }
    } catch (error) {
        console.log(error);
        return { error: { message: error.message } }
    } finally {
        await redisClient.disconnect();
    }
}

const pub = async (chanel, data) => {
    const redisClient = createClient({
        url: process.env.REDIS_SERVER
    });
    await redisClient.connect();
    try {
        const result = await redisClient.publish(chanel, JSON.stringify(data));
        return { result }
    } catch (error) {
        console.log(error);
        return { error: { message: error.message } }
    } finally {
        await redisClient.disconnect();
    }
}

module.exports = { get, set, del, pub }