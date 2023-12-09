const { PrismaClient } = require('@prisma/client');
const { Worker } = require('worker_threads');

const dropbox = require('../utils/dropbox');

const prisma = new PrismaClient();
const errorHandler = (error) => {
	console.log(error);
	return { error: { message: error.message }, result: undefined };
};

const createTrip = async (trip) => {
	try {
		// upload image and get url
		if (trip.coverPicture) {
			const pictureBuffer = Buffer.from(trip.coverPicture, 'base64');
			const { pictureId, pictureUrl } = await dropbox.uploadImage(pictureBuffer);
			delete trip.coverPicture;
			trip.coverPictureId = pictureId;
			trip.coverPictureUrl = pictureUrl;
		}
		await prisma.$connect();
		const newTrip = await prisma.trip.create({
			data: trip
		});
		await prisma.sharedTrip.create({
			data: {
				tripId: newTrip.tripId,
				email: newTrip.owner,
				role: 'owner'
			}
		});
		return { result: newTrip };
	} catch (error) {
		return errorHandler(error);
	} finally {
		await prisma.$disconnect();
	}
};

const getAllTrip = async (email) => {
	try {
		await prisma.$connect();
		const tripIds = await prisma.sharedTrip.findMany({
			where: { email: email },
			select: { tripId: true }
		});
		const trips = await Promise.all(
			tripIds.map(e => prisma.trip.findUnique({
				where: { tripId: e.tripId }
			}))
		);
		return { result: trips };
	} catch (error) {
		return errorHandler(error);
	} finally {
		await prisma.$disconnect();
	}
};

const getTripById = async (email, tripId) => {
	try {
		await prisma.$connect();
		if (! await prisma.sharedTrip.findUnique({
			where: { email_tripId: { email: email, tripId: tripId } }
		})) return { error: { message: 'Unauthorized' } };

		const trip = await prisma.trip.findUnique({
			where: { tripId: tripId }
		});

		return { result: trip };
	} catch (error) {
		return errorHandler(error);
	} finally {
		await prisma.$disconnect();
	}
};

const deleteTripById = async (tripId, email) => {
	try {
		await prisma.$connect();
		const result = await prisma.trip.delete({
			where: {
				owner: email,
				tripId: tripId
			},
		});
		return { result: result.tripId };
	} catch (error) {
		return errorHandler(error);
	} finally {
		await prisma.$disconnect();
	}
};

const updateTrip = async (email, trip) => {
	try {
		await prisma.$connect();
		if (trip.coverPicture) {
			const pictureBuffer = Buffer.from(trip.coverPicture, 'base64');

			const coverPictureId = (await prisma.trip.findUnique({
				where: { tripId: trip.tripId },
				select: { coverPictureId: true }
			})).coverPictureId;

			if (coverPictureId) {
				await dropbox.updateImage(coverPictureId, pictureBuffer);
			} else {
				const { pictureId, pictureUrl } = await dropbox.uploadImage(pictureBuffer);
				trip.coverPictureId = pictureId;
				trip.coverPictureUrl = pictureUrl;
			}

			delete trip.coverPicture;
		}

		const result = await prisma.trip.update({
			where: {
				owner: email,
				tripId: trip.tripId
			},
			data: trip
		});
		return { result: result };
	} catch (error) {
		return errorHandler(error);
	} finally {
		await prisma.$disconnect();
	}
};

const getAllMember = async (email, tripId) => {
	try {
		await prisma.$connect();

		const emails = (await prisma.sharedTrip.findMany({
			where: { tripId: tripId },
			select: { email: true }
		})).map(e => e.email);

		if (!emails.includes(email)) return { error: { message: 'Not trip member' } };

		const result = await Promise.all(
			emails.map(e => prisma.account.findUnique({
				where: { email: e },
				select: {
					email: true,
					pictureUrl: true,
					username: true
				}
			}))
		);
		return { result: result };
	} catch (error) {
		return errorHandler(error);
	} finally {
		await prisma.$disconnect();
	}
};

const editMember = async (owner, emails, tripId) => {
	try {
		await prisma.$connect();

		// check owner
		if (! await prisma.trip.findUnique({
			where: {
				tripId: tripId,
				owner: owner
			}
		})) return { error: { message: 'Unauthorized' } };

		const currentMember = (await prisma.sharedTrip.findMany({
			where: {
				tripId: tripId,
				role: 'member'
			},
			select: { email: true }
		})).map(e => e.email);

		const combine = [...new Set(currentMember.concat(emails))];
		let addMembers = [], removeMembers = [];
		await Promise.all(
			combine.map(e => {
				if (e == owner) return null;
				if (emails.includes(e) && !currentMember.includes(e)) {
					addMembers.push(e);
					return prisma.sharedTrip.create({
						data: {
							email: e,
							tripId: tripId,
							role: 'member'
						}
					});
				}
				else if (!emails.includes(e) && currentMember.includes(e)) {
					removeMembers.push(e);
					return prisma.sharedTrip.delete({
						where: { email_tripId: { email: e, tripId: tripId } }
					});
				}
				return null;
			})
		);

		// 123 -> 234 1234

		// push notification
		const workerData = {
			action: 'editTripMembers',
			data: {
				tripId,
				addMembers,
				removeMembers
			}
		};
		new Worker(
			`${global.__path_background_workers}/pushNotification.js`,
			{ workerData }
		);

		return { result: 'modify success' };
	} catch (error) {
		return errorHandler(error);
	} finally {
		await prisma.$disconnect();
	}
};

const removeSelf = async (email, tripId) => {
	try {
		await prisma.$connect();
		const checkMember = await prisma.sharedTrip.findUnique({
			where: {
				email_tripId: { email: email, tripId: tripId },
				role: 'member'
			}
		});

		if (!checkMember) return {
			error: { message: 'Not a trip member || owner cannot remove themselves' },
		};

		const result = await prisma.sharedTrip.delete({
			where: {
				email_tripId: { email: email, tripId: tripId }
			}
		});

		const workerData = {
			action: 'removeSelfFromTrip',
			data: {
				tripId,
				leave: email
			}
		};
		new Worker(
			`${global.__path_background_workers}/pushNotification.js`,
			{ workerData }
		);

		return { result };
	} catch (error) {
		return errorHandler(error);
	} finally {
		await prisma.$disconnect();
	}
};

module.exports.tripService = {
	createTrip,
	getAllTrip,
	getTripById,
	deleteTripById,
	updateTrip,
	getAllMember,
	editMember,
	removeSelf
};
