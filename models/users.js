const shortid = require('shortid');
const bcrypt = require('bcrypt');

class Users
{
    constructor()
    {
        this.users = [];
    }

    async add(name, password, homes)
    {
        const id = shortid.generate();
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = {_id:id, name:name, password:hashedPassword, homes:homes};
        this.users.push(user);
        console.log(user);
        return user;
    }

    findUser(key, value)
    {
        const user = this.users.find(item => item[key] == value)
        return user;
    }
    
    setUsers(list)
    {
        this.users = list;
    }
}

module.exports = new Users();