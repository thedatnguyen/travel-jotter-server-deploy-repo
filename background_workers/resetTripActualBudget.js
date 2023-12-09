const { PrismaClient } = require('@prisma/client');
const { workerData } = require('worker_threads');

(
	async () => {
		const prisma = new PrismaClient();
		try {
			const { action, data } = workerData;
			switch (action) {
			case 'addActivities': {
				const { activitiesData, tripId } = data;
				const budgetAdding = activitiesData.reduce((t, activityData) => {
					const budget = activityData.budget;
					return (budget) ? t + parseInt(budget) : t;
				}, 0);
				const currentBudget = (await prisma.trip.findUnique({
					where: { tripId: tripId },
					select: { actualBudget: true }
				})).actualBudget;
				await prisma.trip.update({
					where: { tripId: tripId },
					data: { actualBudget: currentBudget + budgetAdding }
				});
				break;
			}
			case 'updateActivities': {
				const { tripId } = data;
				const newBudget = (await prisma.activity.findMany({
					where: {
						TimeSection: {
							Trip: { tripId: tripId }
						}
					},
					select: { budget: true }
				}))
					.map(activity => activity.budget)
					.reduce((t, budget) => t + budget, 0);
				await prisma.trip.update({
					where: { tripId: tripId },
					data: { actualBudget: newBudget }
				});
				break;
			}
			case 'deleteActivities': {
				const { tripId, deleteBudget } = data;
				const currentBudget = (await prisma.trip.findUnique({
					where: { tripId: tripId },
					select: { actualBudget: true }
				})).actualBudget;
				await prisma.trip.update({
					where: { tripId: tripId },
					data: { actualBudget: currentBudget - deleteBudget }
				});
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
