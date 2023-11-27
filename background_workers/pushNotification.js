const { PrismaClient } = require('@prisma/client');
const { workerData } = require('worker_threads');
const axios = require('axios');

(
    async () => {
        const prisma = new PrismaClient();
        try {
            const { action, data } = workerData;
            let notifications;
            switch (action) {
                case 'editTripMembers': {
                    const { tripId, addMembers, removeMembers } = data;
                    const trip = await prisma.trip.findUnique({
                        where: { tripId: tripId },
                        select: {
                            title: true,
                            owner: true,
                        }
                    })
                    const title = trip.title, owner = trip.owner;

                    const addNoti = addMembers.map(e => {
                        return {
                            email: e,
                            message: `${owner} recently added you to a trip: ${title}`
                        }
                    });
                    const removeNoti = removeMembers.map(e => {
                        return {
                            email: e,
                            message: `${owner} recently removed you from a trip: ${title}`
                        }
                    })
                    notifications = [...addNoti, ...removeNoti];
                    await prisma.notification.createMany({
                        data: notifications
                    })
                    break;
                }
                case 'removeSelfFromTrip': {
                    const { tripId, leave } = data;
                    const trip = await prisma.trip.findUnique({
                        where: { tripId: tripId },
                        select: { title: true, owner: true }
                    });
                    const { title, owner } = trip
                    await prisma.sharedTrip.delete({
                        where: {
                            email_tripId: { email: leave, tripId: tripId }
                        }
                    })
                    const notification = {
                        email: owner,
                        message: `${leave} recently left your trip: ${title}`
                    }
                    notifications = [notification]
                    await prisma.notification.create({
                        data: notification
                    })
                    break;
                }
            }
            if (notifications) axios.post(
                `${process.env.FE_SERVER}/notification/trip`,
                { notifications }
            )

        } catch (error) {
            console.log(error);
        } finally {
            prisma.$disconnect();
        }
    }
)();