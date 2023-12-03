const { PrismaClient } = require('@prisma/client');
const { workerData } = require('worker_threads');
const messageBroker = require('../configs/caching');

(
    async () => {
        const prisma = new PrismaClient();
        try {
            const { action, data } = workerData;
            let notifications;
            switch (action) {
                case 'editTripMembers': {
                    const { tripId, addMembers, removeMembers } = data;
                    const { title, owner } = await prisma.trip.findUnique({
                        where: { tripId: tripId },
                        select: {
                            title: true,
                            owner: true,
                        }
                    })
                    // const title = trip.title, owner = trip.owner;

                    const addNoti = addMembers.map(email => {
                        return {
                            owner: email,
                            title: 'Explore a new trip!',
                            content: `${owner} recently added you to a trip: ${title}`,
                            createAt: new Date().toISOString()
                        }
                    });
                    const removeNoti = removeMembers.map(email => {
                        return {
                            owner: email,
                            title: 'Sorry, you are no longer a member ...',
                            content: `${owner} recently removed you from a trip: ${title}`,
                            createAt: new Date().toISOString()
                        }
                    })
                    notifications = [...addNoti, ...removeNoti];

                    // push noti
                    await Promise.all(
                        notifications.map(notification => {
                            messageBroker.pub('notifications', notification);
                            return null;
                        })
                    )

                    // add to database
                    await prisma.notification.createMany({
                        data: notifications
                    })
                    break;
                }
                case 'removeSelfFromTrip': {
                    const { tripId, leave } = data;
                    const { title, owner } = await prisma.trip.findUnique({
                        where: { tripId: tripId },
                        select: { title: true, owner: true }
                    });

                    const notification = {
                        owner: owner,
                        title: 'Maybe someone is busy ...',
                        content: `${leave} recently left your trip: ${title}`,
                        createAt: new Date().toISOString()
                    }

                    //push noti
                    await messageBroker.pub('notifications', notification)

                    // add to database
                    await prisma.notification.create({
                        data: notification
                    })
                    break;
                }
            }

        } catch (error) {
            console.log(error);
        } finally {
            prisma.$disconnect();
        }
    }
)();