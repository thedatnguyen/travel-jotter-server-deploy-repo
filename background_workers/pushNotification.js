const { PrismaClient } = require('@prisma/client');
const { workerData } = require('worker_threads');
const messageBroker = require('../configs/caching');

(async () => {
  const prisma = new PrismaClient()
  try {
    const { action, data } = workerData
    let notifications
    switch (action) {
      case 'editTripMembers': {
        const { tripId, addMembers, removeMembers } = data
        const trip = await prisma.trip.findUnique({
          where: { tripId: tripId }
        })

        const { title, owner } = trip

        const addNoti = addMembers.map(email => {
          return {
            owner: email,
            title: 'Explore a new trip!',
            content: `${owner} recently added you to a trip: ${title}`,
            createAt: new Date().toISOString()
          }
        })
        const removeNoti = removeMembers.map(email => {
          return {
            owner: email,
            title: 'Sorry, you are no longer a member ...',
            content: `${owner} recently removed you from a trip: ${title}`,
            createAt: new Date().toISOString()
          }
        })
        notifications = [...addNoti, ...removeNoti]

        // push noti
        await Promise.allSettled(
          notifications.map(async notification => {
            // messageBroker.pub('notifications', notification);
            const { result: socketId } = await messageBroker.get(
              notification.owner
            )
            if (socketId) {
              const type = notification.title[0] == 'S' ? 'removed' : 'added'
              messageBroker.pub('notification', {
                socketId,
                data: {
                  title: notification.title,
                  content: notification.content,
                  createAt: notification.createAt,
                  trip: trip,
                  type: type
                }
              })
            }
            return null
          })
        )

        // add to database
        await prisma.notification.createMany({
          data: notifications
        })
        break
      }
      case 'removeSelfFromTrip': {
        const { tripId, leave } = data
        const { title, owner } = await prisma.trip.findUnique({
          where: { tripId: tripId },
          select: { title: true, owner: true }
        })

        const notification = {
          owner: owner,
          title: 'Maybe someone is busy ...',
          content: `${leave} recently left your trip: ${title}`,
          createAt: new Date().toISOString()
        }

        // push noti
        const { result: socketId } = await messageBroker.get(owner)
        if (socketId) {
          messageBroker.pub('notification', {
            socketId,
            data: {
              title: notification.title,
              content: notification.content,
              createAt: notification.createAt,
              type: 'leave',
              userLeave: leave
            }
          })
        }

        // add to database
        await prisma.notification.create({
          data: notification
        })
        break
      }
    }
  } catch (error) {
    console.log(error)
  } finally {
    prisma.$disconnect()
  }
})()
