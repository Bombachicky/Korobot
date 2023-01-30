const fs = require('node:fs');
const path = require('node:path');
const { Client, Collection, Events, GatewayIntentBits } = require('discord.js');
const { token } = require('./config.json');
const { Guild } = require('discord.js');
const { CronJob } = require('cron');

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

client.commands = new Collection();
const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
	const filePath = path.join(commandsPath, file);
	const command = require(filePath);
	client.commands.set(command.data.name, command);
}

const eventsPath = path.join(__dirname, 'events');
const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith('.js'));

for (const file of eventFiles) {
	const filePath = path.join(eventsPath, file);
	const event = require(filePath);
	if (event.once) {
		client.once(event.name, (...args) => event.execute(...args));
	} else {
		client.on(event.name, (...args) => event.execute(...args));
	}
}

client.login(token);

const jobsPath = path.join(__dirname, 'jobs');
const jobsFiles = fs.readdirSync(jobsPath).filter(file => file.endsWith('.js'));

for (const file of jobsFiles) {
    const filePath = path.join(jobsPath, file);
	const event = require(filePath);
    const job = new CronJob(event.cronPattern, async () => await event.execute(client), null, false, 'America/New_York');
    job.start();
 }
