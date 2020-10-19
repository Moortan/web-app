var Teams = require('../models/teamModel')

module.exports = app => {
    
    app.get('/api/setupTeams', (req, res) => {
        //seed database
        let starterTeams = [
            {
                teamLeader: 'Moortan',
                teamName: 'Team1',
                teamMembers: ['Moortan','Abi'],
                game: 'League of Legends'
            },
            {
                teamLeader: 'Moortan',
                teamName: 'Team2',
                teamMembers: ['Moortan', 'Krop', 'Abi'],
                game: 'League of Legends'
            }
        ];
        Teams.create(starterTeams, (err, results) => {
            res.send(results);
        })
    });
}