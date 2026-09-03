import "dotenv/config";
import mongoose from "mongoose";
import User from "./models/User.js";
import Report from "./models/Report.js";

async function saveUser(data) {
  let user = await User.findOne({ email: data.email }).select("+password");

  if (!user) user = new User(data);
  else {
    user.name = data.name;
    user.password = data.password;
    user.role = data.role;
  }

  await user.save();
  return user;
}

async function seed() {
  if (!process.env.MONGO_URI) throw new Error("Manca MONGO_URI nel file .env");
  await mongoose.connect(process.env.MONGO_URI);

  const student = await saveUser({
    name: "Studente Demo",
    email: "studente@aulafix.it",
    password: "Studente123!",
    role: "student",
  });

  await saveUser({
    name: "Tecnico Admin",
    email: "admin@aulafix.it",
    password: "Admin123!",
    role: "admin",
  });

  await Report.findOneAndUpdate(
    { title: "Proiettore non funzionante", room: "Aula A3" },
    {
      $setOnInsert: {
        title: "Proiettore non funzionante",
        description: "Il proiettore non si accende con il telecomando.",
        room: "Aula A3",
        priority: "alta",
        status: "aperta",
        author: student._id,
      },
    },
    { upsert: true },
  );

  console.log("Dati demo creati senza cancellare i dati gia presenti.");
  await mongoose.disconnect();
}

seed().catch(async (error) => {
  console.error("Seed non riuscito:", error.message);
  await mongoose.disconnect();
  process.exit(1);
});
