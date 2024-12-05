import { Client, GatewayIntentBits, REST, Routes } from "discord.js";
import fetch from "node-fetch"; // ES module import for node-fetch
import dotenv from "dotenv";

// Load environment variables from .env file
dotenv.config();

// Create a new Discord client instance
const client = new Client({
  intents: [GatewayIntentBits.Guilds],
});

// Plane API details from environment variables
const clientId = process.env.CLIENT_ID;
const token = process.env.DISCORD_TOKEN;
const API_KEY = process.env.PLANE_API_KEY;
const workspaceSlug = process.env.WORKSPACE_SLUG;
const projectId = process.env.PROJECT_ID;

// Register Slash Commands with Discord
const commands = [
  {
    name: "create-module",
    description: "Creates a new module in Plane.",
    options: [
      {
        name: "name", // Changed from title to name
        type: 3, // STRING type
        description: "The name of the module", // Updated description
        required: true,
      },
    ],
  },
];

const rest = new REST({ version: "10" }).setToken(token);

// Register commands globally
(async () => {
  try {
    console.log("Started refreshing application (/) commands.");

    const response = await rest.put(Routes.applicationCommands(clientId), {
      body: commands,
    });

    console.log("Successfully reloaded application (/) commands:", response);
  } catch (error) {
    console.error("Error registering commands:", error);
  }
})();

// Handle incoming interactions (commands)
client.on("interactionCreate", async (interaction) => {
  if (!interaction.isCommand()) return; // Only handle slash commands

  const { commandName, options } = interaction;

  if (commandName === "create-module") {
    const name = options.getString("name"); // Changed from title to name

    // Create the module in Plane via the API
    const createModuleResponse = await createModuleInPlane(name);

    // Respond to the user with the result
    if (createModuleResponse.success) {
      await interaction.reply(
        `Module '${name}' created successfully in the project '${projectId}'!` // Changed from title to name
      );
    } else {
      await interaction.reply("There was an error creating the module.");
    }
  }
});

// Function to create a module in Plane API
async function createModuleInPlane(name) {
  // Changed from title to name
  try {
    console.log("API_KEY:", API_KEY); // Debugging log for the API key

    const options = {
      method: "POST",
      headers: {
        "x-api-key": API_KEY,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ name }), // Correctly formatting the body as JSON
    };

    console.log("Request Options:", options); // Debug log for request options
    console.log(process.env.WORKSPACE_SLUG);
    console.log(process.env.PROJECT_ID);

    const response = await fetch(
      `https://api.plane.so/api/v1/workspaces/${workspaceSlug}/projects/${projectId}/modules/`,
      options
    );

    // Debug the raw response
    const data = await response.json();
    console.log("API Response:", data); // Debug log for API response

    if (response.ok) {
      return { success: true };
    } else {
      console.error("Error creating module:", data);
      return { success: false, error: data };
    }
  } catch (err) {
    console.error("Error with API request:", err);
    return { success: false, error: err.message };
  }
}

// Log in to Discord
client
  .login(token)
  .then(() => {
    console.log("Bot has logged in and is online!");
  })
  .catch((error) => {
    console.error("Error logging in:", error);
  });
