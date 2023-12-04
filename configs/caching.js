const { createClient } = require('redis');

const redisClient = createClient({
    url: process.env.REDIS_SERVER
})

const get = async (key) => {
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

const set = async (records) => {
    await redisClient.connect();
    try {
        if (!Array.isArray(records)) records = [records];
        const result = await Promise.allSettled(
            records.map(e => {
                if (e.key && e.value) {
                    redisClient.set(`${e.key}`, JSON.stringify(e.value),
                        { NX: true },
                        (err, rep) => {
                            if (err) console.log(err);
                        })
                }
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
    await redisClient.connect();
    try {
        if (!Array.isArray(keys)) keys = [keys];
        const result = await Promise.allSettled(
            keys.map(key => {
                if (redisClient.exists(key)) { redisClient.del(key) }
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

const pub = async (chanel, data) => {
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