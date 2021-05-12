const shortid = require('shortid');
const bcrypt = require('bcrypt');

class Homes
{
    constructor()
    {
        this.homes = [];
    }

    addHome(homeName)
    {
        const home = {home:homeName, id:shortid.generate(), pets:[], log:[]};
        this.homes.push(home);
//        console.log(home);
        return home;
    }

    findHome(id)
    {
        const home = this.homes.find(e => e.id === id);
        return home;
    }

}

module.exports = new Homes();