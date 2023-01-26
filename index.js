import axios from "axios";
import dotenv from "dotenv";
import mongo from "mongodb";

dotenv.config();

const mongoClient = new mongo.MongoClient(process.env.MONGO_CONNECTION_URL);
const db = mongoClient.db(process.env.MONGO_DB_NAME);
const collection = db.collection("posts");

// get the latest post, if any
const post = await collection.findOne({}, { sort: { _id: -1 } });

let lastPostId =
	post == null ? Number(process.env.DEFAULT_START_ID) : post.postId;
const limit = Number(process.env.SEARCH_LIMIT);
const delay = Number(process.env.SECONDS_BETWEEN_HTTPREQ);

console.log(`Starting at ${lastPostId}`);

for (let idx = 0; idx < limit; idx++) {
	const postId = lastPostId + idx + 1;
	const res = await axios.get(`${process.env.BASE_URL}${postId}`, {
		validateStatus: false,
	});
	const data = res.data;
	if (res.status != 404) {
		// is the status check superfluous?
		// TODO: Check and test the above statement
		if (data.data && data.data.status != 404) {
			// found something!
			if (data.data.status == 401) {
				// hidden post
				notify(`🔒 Hidden post found!`, postId);
			} else {
				notify(`❓ Unknown post type found!`, postId);
			}
		}

		if (data.id) {
			// found a visible post, possible update?
			notify(`👀 Found a visible post!`, postId);
		}

		// insert into mongo
		await collection.insertOne({
			postId,
			data,
		});
	}

	await new Promise((resolve) => setTimeout(resolve, delay * 1000));
}

function notify(message, postid) {
	axios.post(
		`https://api.telegram.org/bot${process.env.TELEGRAM_BOT_ID}/sendMessage`,
		{
			chat_id: process.env.TELEGRAM_CHAT_ID,
			text: `${message}\nPost ID: ${postid}\n\n<a href="${process.env.POST_URL}${postid}">🔗 Link to website</a>`,
			parse_mode: "HTML",
		}
	);
}

await mongoClient.close();
