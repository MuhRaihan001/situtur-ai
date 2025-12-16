class Memory {
    #conversation
    constructor() {
        this.#conversation = {};
    }

    get(id) {
        return this.#conversation[id];
    }

    add(id, payload) {
        if(!this.#conversation[id])
            this.#conversation[id] = [];

        this.#conversation[id].push(payload);
    }

    clear(message_id) {
        for (const id in this.#conversation) {
            const history = this.get(id);
            
            if (history.some(message => message.id === message_id)) {
                delete this.#conversation[id];
            }

        }
    }

    format(conversation) {
        return conversation
        .map(c => `[${c.time}] ${c.from}: ${c.message}`)
        .join('\n');
    }
}

const conversation = new Memory();
module.exports = conversation;