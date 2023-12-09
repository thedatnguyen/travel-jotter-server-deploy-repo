const { PrismaClient } = require('@prisma/client');
const { OpenAI } = require('openai');
const { parentPort, workerData } = require('worker_threads');

(async () => {
	const prisma = new PrismaClient();
	try {
		const { email, tripId } = workerData;

		await prisma.$connect();

		const trip = await prisma.trip.findUnique({
			where: { tripId: tripId }
		});

		// trip suggestion already exists //
		if (trip.suggestGenerated) {
			parentPort.postMessage({
				status: 'success',
				content: trip.suggestGenerated
			});
		}

		// generate new suggestion, owner only //
		else if (trip.owner != email) {
			parentPort.postMessage({
				status: 'failed',
				content: 'not owner'
			});
		} else {
			const locations = trip.locations.join(', ');
			const prompt = `Suggest places for sports, foods, drinks, lodgings and sightseeings in ${locations} along with detailed locations`;
			const openai = new OpenAI({
				apiKey: process.env.OPEN_AI_API_KEY
			});
			const chatCompletion = await openai.chat.completions.create({
				messages: [{ role: 'user', content: prompt }],
				model: 'gpt-3.5-turbo'
			});

			parentPort.postMessage({
				status: 'success',
				content: chatCompletion.choices[0].message.content
			});

			await prisma.trip.update({
				where: { tripId: tripId },
				data: {
					suggest: chatCompletion.choices[0].message.content,
					suggestGenerated: true
				}
			});
		}
	} catch (error) {
		console.log(error);
		parentPort.postMessage({
			status: 'failed',
			content: error.message
		});
	} finally {
		prisma.$disconnect();
	}
})();
