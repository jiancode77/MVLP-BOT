import fs from 'fs';
import path from 'path';

class DataBase {
    constructor(filePath = './database.json') {
        this.filePath = filePath;
        this.data = {};
    }

    async read() {
        try {
            if (fs.existsSync(this.filePath)) {
                const fileData = fs.readFileSync(this.filePath, 'utf-8');
                this.data = JSON.parse(fileData);
                return this.data;
            }
            return {};
        } catch (error) {
            console.error('Error reading database:', error.message);
            return {};
        }
    }

    async write(data) {
        try {
            this.data = data;
            fs.writeFileSync(this.filePath, JSON.stringify(data, null, 2), 'utf-8');
            return true;
        } catch (error) {
            console.error('Error writing database:', error.message);
            return false;
        }
    }

    async get(key) {
        await this.read();
        return this.data[key];
    }

    async set(key, value) {
        await this.read();
        this.data[key] = value;
        return await this.write(this.data);
    }

    async delete(key) {
        await this.read();
        delete this.data[key];
        return await this.write(this.data);
    }

    async has(key) {
        await this.read();
        return key in this.data;
    }

    async clear() {
        this.data = {};
        return await this.write(this.data);
    }
}

export default DataBase;
