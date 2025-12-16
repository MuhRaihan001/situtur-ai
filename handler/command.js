const fs = require('fs');
const path = require('path');

const commandsFolder = path.join(__dirname, '../commands');
const commands = new Map();

function loadCommands() {
    const files = fs.readdirSync(commandsFolder, { withFileTypes: true });

    console.log('\nLoading command...')
    for (const file of files) {

        const fullPath = path.join(commandsFolder, file.name);

        if (file.name.endsWith('.js')) {
            const command = require(fullPath)

            if (!command?.name || typeof command?.execute !== 'function') {
                console.warn(`Invalid command type ${fullPath}`);
                continue;
            }

            commands.set(command.name, command);
            console.log(`✔️ Loaded ${command.name}`)
        }
    }

    console.log('All Command loaded...')
}

module.exports = {
    commands,
    loadCommands
}