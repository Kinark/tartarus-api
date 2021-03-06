const updateUsers = require('~/app/api/user/services').modifyUsers
const updateWorlds = require('~/app/api/world/services').modifyWorlds

const disconnectEveryoneFromEverything = async () => {
   await updateUsers({ currentSocket: { $ne: null } }, { currentSocket: null })
   await updateWorlds({ 'members.online': true }, { 'members.$.online': false })
   console.log('Everyone was disconnected from everything')
}

module.exports = disconnectEveryoneFromEverything
